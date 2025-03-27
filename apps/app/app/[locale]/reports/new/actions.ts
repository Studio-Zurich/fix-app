"use server";

import {
  ALLOWED_FILE_EXTENSIONS,
  ALLOWED_FILE_TYPES,
  MAX_FILE_SIZE,
  reportSubmissionSchema,
} from "@/lib/schemas";
import { createClient } from "@/lib/supabase/server";
import {
  FileAttachment,
  FileUploadResponse,
  InternalEmailProps,
} from "@/lib/types";
import { ReportEmail as InternalReportEmail } from "@repo/transactional/emails/intern";
import { getTranslations } from "next-intl/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

function getCETTimestamp() {
  const now = new Date();
  const cetDate = new Date(
    now.toLocaleString("en-US", { timeZone: "Europe/Zurich" })
  );
  return cetDate.toISOString();
}

async function sendEmailWithRetry(
  params: {
    from: string;
    to: string;
    subject: string;
    react: React.ReactElement;
    attachments?: FileAttachment[];
  },
  maxRetries = 3
) {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await resend.emails.send(params);
      return result;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < maxRetries) {
        await new Promise((resolve) =>
          setTimeout(resolve, Math.pow(2, attempt) * 1000)
        );
      }
    }
  }

  throw lastError;
}

export async function submitReport(
  formData: FormData
): Promise<FileUploadResponse> {
  try {
    const supabase = await createClient();
    const timestamp = getCETTimestamp();
    const t = await getTranslations();

    // Get and validate form data
    const files = formData.getAll("files") as File[];
    const location = JSON.parse(formData.get("location") as string);
    const incidentType = JSON.parse(formData.get("incidentType") as string);
    const description = formData.get("description") as string;
    const contactInfo = JSON.parse(formData.get("contactInfo") as string);
    const locale = formData.get("locale") as "de" | "en";

    // Validate submission data
    const validatedData = reportSubmissionSchema.parse({
      files,
      location,
      incidentType,
      description,
      contactInfo,
      locale,
    });

    // Validate files
    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        throw new Error(t("components.reportFlow.errors.fileTooLarge"));
      }
      if (!ALLOWED_FILE_TYPES.includes(file.type as any)) {
        throw new Error(t("components.reportFlow.errors.invalidFileType"));
      }
    }

    // Create a new report record
    const { data: report, error: reportError } = await supabase
      .from("reports")
      .insert({
        status: "new",
        description: validatedData.description,
        location_lat: validatedData.location.lat,
        location_lng: validatedData.location.lng,
        location_address: validatedData.location.address,
        reporter_email: validatedData.contactInfo.email,
        reporter_phone: validatedData.contactInfo.phone,
        reporter_first_name: validatedData.contactInfo.firstName,
        reporter_last_name: validatedData.contactInfo.lastName,
        created_at: timestamp,
        updated_at: timestamp,
      })
      .select()
      .single();

    if (reportError) {
      console.error("Error creating report:", reportError);
      return {
        success: false,
        error: t("components.reportFlow.errors.uploadFailed"),
      };
    }

    // Upload files to Supabase storage
    const uploadPromises = files.map(async (file) => {
      const fileExt = file.name.split(".").pop()?.toLowerCase();
      if (!fileExt || !ALLOWED_FILE_EXTENSIONS.includes(fileExt as any)) {
        throw new Error(t("components.reportFlow.errors.invalidFileType"));
      }

      const fileName = `${report.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `report-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("report-images")
        .upload(filePath, file);

      if (uploadError) {
        console.error("Error uploading file:", uploadError);
        throw uploadError;
      }

      // Create report_images record
      const { error: imageError } = await supabase
        .from("report_images")
        .insert({
          report_id: report.id,
          storage_path: filePath,
          file_name: file.name,
          file_type: file.type,
          file_size: file.size,
          created_at: timestamp,
        });

      if (imageError) {
        console.error("Error creating report image record:", imageError);
        throw imageError;
      }

      return filePath;
    });

    // Wait for all uploads to complete
    await Promise.all(uploadPromises);

    const emailProps: InternalEmailProps = {
      reportId: report.id,
      reporterName: `${validatedData.contactInfo.firstName} ${validatedData.contactInfo.lastName}`,
      reporterEmail: validatedData.contactInfo.email,
      location: validatedData.location.address,
      description: validatedData.description,
      imageCount: files.length,
      incidentType: validatedData.incidentType,
      locale: validatedData.locale,
    };

    // Prepare attachments for internal email
    const attachments = await Promise.all(
      files.map(async (file) => ({
        filename: file.name,
        content: Buffer.from(await file.arrayBuffer()),
      }))
    );

    // Send internal notification email
    try {
      await sendEmailWithRetry({
        from: "notifications@fixapp.ch",
        to: "hello@studio-zurich.ch",
        subject: t("mails.internal.subject"),
        react: InternalReportEmail(emailProps),
        attachments,
      });
    } catch (error) {
      console.error("Error sending internal email:", error);
      // Log the error but don't fail the whole process
    }

    return { success: true, reportId: report.id };
  } catch (error) {
    console.error("Error in submitReport:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}
