"use server";

import { reportSchema } from "@/lib/schemas";
import { createClient } from "@/lib/supabase/server";
import { ReportData } from "@/lib/types";
import { renderAsync } from "@react-email/render";
import { ReportEmail } from "@repo/transactional/emails/my-email";
import { revalidatePath } from "next/cache";
import { Resend } from "resend";
import { ZodError } from "zod";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function uploadImages(reportId: string, images: string[]) {
  const supabase = await createClient();

  const uploads = images.map(async (imageUrl) => {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const timestamp = new Date().getTime();
    const fileName = `${timestamp}.jpg`;
    const storagePath = `${reportId}/${fileName}`;

    const { data, error } = await supabase.storage
      .from("report-images")
      .upload(storagePath, blob, {
        contentType: "image/jpeg",
        upsert: false,
      });

    if (error) throw error;

    const { error: recordError } = await supabase.from("report_images").insert({
      report_id: reportId,
      storage_path: storagePath,
      file_name: fileName,
      file_type: "image/jpeg",
      file_size: blob.size,
    });

    if (recordError) throw recordError;

    return data;
  });

  try {
    await Promise.all(uploads);
  } catch (error) {
    console.error("Error in batch upload:", error);
    throw error;
  }
}

export async function submitReport(data: ReportData) {
  const supabase = await createClient();

  try {
    // Validate the input data
    const validatedData = reportSchema.parse(data);

    // Create the report first to get the ID
    const { data: report, error: reportError } = await supabase
      .from("reports")
      .insert({
        incident_type_id: validatedData.incidentTypeId,
        incident_subtype_id: validatedData.incidentSubtypeId,
        status: "submitted",
        description: validatedData.description,
        location_lat: validatedData.location.lat,
        location_lng: validatedData.location.lng,
        location_address: validatedData.location.address,
        reporter_first_name: validatedData.reporterFirstName || null,
        reporter_last_name: validatedData.reporterLastName || null,
        reporter_email: validatedData.reporterEmail || null,
        reporter_phone: validatedData.reporterPhone || null,
      })
      .select()
      .single();

    if (reportError) {
      console.error("Error creating report record:", reportError);
      throw new Error(`Failed to create report: ${reportError.message}`);
    }

    // Handle image uploads if there are any
    if (validatedData.images && validatedData.images.length > 0) {
      const reportFolder = `reports/${report.id}`; // Create a folder for this report

      for (const image of validatedData.images) {
        try {
          // Create filename with timestamp to ensure uniqueness
          const timestamp = Date.now();
          const fileName = `image_${timestamp}.${image.fileType.split("/")[1]}`;
          const storagePath = `${reportFolder}/${fileName}`;

          // Upload to the report's folder
          const { error: uploadError } = await supabase.storage
            .from("report-images")
            .upload(storagePath, image.previewUrl, {
              contentType: image.fileType,
              upsert: false,
            });

          if (uploadError) throw uploadError;

          // Create image record
          const { error: imageRecordError } = await supabase
            .from("report_images")
            .insert({
              report_id: report.id,
              storage_path: storagePath,
              file_name: fileName,
              file_type: image.fileType,
              file_size: image.fileSize,
            });

          if (imageRecordError) throw imageRecordError;
        } catch (error) {
          console.error("Error processing image:", error);
          throw error;
        }
      }
    }

    // Fetch incident type info for email
    const { data: typeInfo } = await supabase
      .from("incident_types")
      .select("name")
      .eq("id", validatedData.incidentTypeId)
      .single();

    let subtypeInfo;
    if (validatedData.incidentSubtypeId) {
      const { data: subtype } = await supabase
        .from("incident_subtypes")
        .select("name")
        .eq("id", validatedData.incidentSubtypeId)
        .single();
      subtypeInfo = subtype;
    }

    // Send email notifications
    try {
      const emailHtml = await renderAsync(
        ReportEmail({
          reportId: report.id,
          reporterName:
            `${validatedData.reporterFirstName ?? ""} ${validatedData.reporterLastName ?? ""}`.trim(),
          reporterEmail: validatedData.reporterEmail ?? "",
          reporterPhone: validatedData.reporterPhone ?? "",
          location: validatedData.location,
          description: validatedData.description ?? "",
          imageCount: validatedData.images?.length ?? 0,
          incidentType: {
            name: typeInfo?.name || "Unknown",
            subtype: subtypeInfo?.name,
          },
        })
      );

      await resend.emails.send({
        from: "Fix App <notifications@fixapp.ch>",
        to: ["hello@studio-zurich.ch"],
        // to: ["hello@studio-zurich.ch", "Remigi.rageth@gmail.com"].concat(
        //   validatedData.reporterEmail ? [validatedData.reporterEmail] : []
        // ),
        subject: "Neue Meldung auf Fix App",
        html: emailHtml,
      });
    } catch (emailError) {
      console.error("Error sending email:", emailError);
      // Create error report entry for email failure
      await supabase.from("report_history").insert({
        report_id: report.id,
        action: "error",
        details: {
          error:
            emailError instanceof Error
              ? emailError.message
              : "Email sending failed",
          type: "email_error",
        },
      });
      // Continue with the submission process even if email fails
    }

    // Create report history entry
    const { error: historyError } = await supabase
      .from("report_history")
      .insert({
        report_id: report.id,
        action: "created",
        details: {
          status: "submitted",
          timestamp: new Date().toISOString(),
        },
      });

    if (historyError) {
      console.error("Error creating history record:", historyError);
      throw new Error(
        `Failed to create history record: ${historyError.message}`
      );
    }

    revalidatePath("/");
    return { success: true, reportId: report.id };
  } catch (error: unknown) {
    // Log detailed error information
    console.error("Error submitting report:", {
      error,
      errorMessage: error instanceof Error ? error.message : "Unknown error",
      errorStack: error instanceof Error ? error.stack : undefined,
      validationErrors: error instanceof ZodError ? error.errors : undefined,
    });

    // Return user-friendly error message with more context
    let errorMessage = "Failed to submit report";
    if (error instanceof ZodError) {
      errorMessage =
        "Invalid report data: " + error.errors.map((e) => e.message).join(", ");
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    return {
      success: false,
      error: errorMessage,
      details:
        process.env.NODE_ENV === "development"
          ? {
              type:
                error instanceof Error
                  ? error.constructor.name
                  : "UnknownError",
              message: error instanceof Error ? error.message : String(error),
              validation: error instanceof ZodError ? error.errors : undefined,
            }
          : undefined,
    };
  }
}
