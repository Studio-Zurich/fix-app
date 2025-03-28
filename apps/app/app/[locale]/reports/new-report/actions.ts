"use server";

import { EMAIL_CONSTANTS, FILE_CONSTANTS } from "@/lib/constants";
import { reportSubmissionSchema } from "@/lib/schemas";
import { createClient } from "@/lib/supabase/server";
import {
  EmailProps,
  EmailSendParams,
  FileUploadResponse,
  Location,
  ReportDescription,
  SelectedIncidentTypeType,
  UserData,
} from "@/lib/types";
import { ReportEmail as InternalReportEmail } from "@repo/transactional/emails/intern";
import { getTranslations } from "next-intl/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

function getCETTimestamp() {
  // Create a date object with the current time and set it to Swiss timezone
  const now = new Date();
  // Use a more reliable approach for getting a timestamp in Swiss time
  return (
    now
      .toLocaleString("sv-SE", { timeZone: "Europe/Zurich" })
      .replace(" ", "T") + ".000Z"
  );
}

// Move this function above where it's used
async function sendEmailWithRetry(params: EmailSendParams, maxRetries = 3) {
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
  const supabase = await createClient();
  const timestamp = getCETTimestamp();
  const t = await getTranslations();
  let uploadedFiles: string[] = [];
  let files: File[] = [];

  try {
    // Get and validate form data
    files = formData.getAll("files") as File[];
    const locale = formData.get("locale") as "de" | "en";
    const locationJson = formData.get("location") as string;
    const location = JSON.parse(locationJson) as Location;
    const incidentTypeJson = formData.get("incidentType") as string;
    const incidentType = JSON.parse(
      incidentTypeJson
    ) as SelectedIncidentTypeType;
    const descriptionJson = formData.get("description") as string | null;
    const description = descriptionJson
      ? (JSON.parse(descriptionJson) as ReportDescription)
      : undefined;

    const userDataJson = formData.get("userData") as string;
    const userData = JSON.parse(userDataJson) as UserData;

    // Validate file count
    if (files.length === 0) {
      return {
        success: false,
        error: {
          code: "NO_FILES",
          message: t("components.reportFlow.errors.noFilesSelected"),
        },
      };
    }

    if (files.length > 5) {
      return {
        success: false,
        error: {
          code: "TOO_MANY_FILES",
          message: t("components.reportFlow.errors.tooManyFiles", { max: 5 }),
        },
      };
    }

    // Validate submission data
    const validatedData = reportSubmissionSchema.parse({
      files,
      locale,
      location,
      incidentType,
      description,
      userData,
    });

    // Create a new report record with user data
    const { data: report, error: reportError } = await supabase
      .from("reports")
      .insert({
        status: "new",
        location_lat: validatedData.location.lat,
        location_lng: validatedData.location.lng,
        location_address: validatedData.location.address,
        incident_type_id: validatedData.incidentType.type.id,
        incident_subtype_id: validatedData.incidentType.subtype?.id,
        description: validatedData.description?.text,
        reporter_first_name: validatedData.userData.firstName,
        reporter_last_name: validatedData.userData.lastName,
        reporter_email: validatedData.userData.email,
        reporter_phone: validatedData.userData.phone,
        created_at: timestamp,
        updated_at: timestamp,
      })
      .select()
      .single();

    if (reportError) {
      console.error("Error creating report:", {
        error: reportError,
        timestamp,
        fileCount: files.length,
      });
      return {
        success: false,
        error: {
          code: "DATABASE_ERROR",
          message: t("components.reportFlow.errors.databaseError"),
        },
      };
    }

    // Upload files to Supabase storage
    const uploadPromises = files.map(async (file) => {
      const fileExt = file.name.split(".").pop()?.toLowerCase();
      if (
        !fileExt ||
        !FILE_CONSTANTS.ALLOWED_EXTENSIONS.includes(
          fileExt as (typeof FILE_CONSTANTS.ALLOWED_EXTENSIONS)[number]
        )
      ) {
        return {
          success: false,
          error: {
            code: "INVALID_FILE_TYPE",
            message: t("components.reportFlow.errors.invalidFileType"),
          },
        };
      }

      const fileName = `${report.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${FILE_CONSTANTS.STORAGE_BUCKET}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("report-images")
        .upload(filePath, file);

      if (uploadError) {
        console.error("Error uploading file:", {
          error: uploadError,
          fileName,
          fileSize: file.size,
          fileType: file.type,
        });
        return {
          success: false,
          error: {
            code: "UPLOAD_FAILED",
            message: t("components.reportFlow.errors.uploadFailed"),
          },
        };
      }

      uploadedFiles.push(filePath);

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
        console.error("Error creating report image record:", {
          error: imageError,
          filePath,
          reportId: report.id,
        });
        // Try to clean up the uploaded file
        await supabase.storage.from("report-images").remove([filePath]);
        uploadedFiles = uploadedFiles.filter((f) => f !== filePath);
        return {
          success: false,
          error: {
            code: "DATABASE_ERROR",
            message: t("components.reportFlow.errors.databaseError"),
          },
        };
      }

      return { success: true, filePath };
    });

    // Wait for all uploads to complete
    const uploadResults = await Promise.all(uploadPromises);
    const failedUploads = uploadResults.filter((result) => !result.success);

    if (failedUploads.length > 0) {
      // Clean up any successfully uploaded files
      if (uploadedFiles.length > 0) {
        await supabase.storage.from("report-images").remove(uploadedFiles);
      }

      console.error("Some uploads failed:", {
        totalFiles: files.length,
        failedCount: failedUploads.length,
        errors: failedUploads.map((u) => u.error),
      });

      return {
        success: false,
        error: {
          code: "UPLOAD_FAILED",
          message: t("components.reportFlow.errors.someUploadsFailed"),
        },
      };
    }

    // Prepare attachments for internal email
    const attachments = await Promise.all(
      files.map(async (file) => ({
        filename: file.name,
        content: Buffer.from(await file.arrayBuffer()),
      }))
    );

    // Send internal notification email with simplified data
    const emailProps: EmailProps = {
      imageCount: files.length,
      locale: validatedData.locale,
      reportId: report.id,
      location: validatedData.location.address,
      incidentType: validatedData.incidentType,
      description: validatedData.description?.text,
      userData: validatedData.userData,
    };

    try {
      await sendEmailWithRetry({
        from: EMAIL_CONSTANTS.FROM_ADDRESS,
        to: EMAIL_CONSTANTS.TO_ADDRESS,
        bcc: EMAIL_CONSTANTS.BCC_ADDRESSES,
        subject: t("mails.internal.subject"),
        react: InternalReportEmail(emailProps),
        attachments,
      });
    } catch (error) {
      console.error("Error sending internal email:", {
        error,
        reportId: report.id,
        fileCount: files.length,
      });
      // Log the error but don't fail the whole process
      // The files are already uploaded and the report is created
    }

    return { success: true, reportId: report.id };
  } catch (error) {
    console.error("Error in submitReport:", {
      error,
      timestamp,
      fileCount: files?.length,
    });

    // Clean up any uploaded files if there was an error
    if (uploadedFiles.length > 0) {
      await supabase.storage.from("report-images").remove(uploadedFiles);
    }

    return {
      success: false,
      error: {
        code: "UPLOAD_FAILED",
        message: t("components.reportFlow.errors.uploadFailed"),
      },
    };
  }
}
