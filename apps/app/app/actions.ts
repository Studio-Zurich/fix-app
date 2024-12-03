"use server";

import { reportSchema } from "@/lib/schemas";
import { createClient } from "@/lib/supabase/server";
import { ReportData } from "@/lib/types";
import { revalidatePath } from "next/cache";
import { ZodError } from "zod";

export async function submitReport(data: ReportData) {
  const supabase = await createClient();

  try {
    // Validate the input data
    const validatedData = reportSchema.parse(data);

    // Start a Supabase transaction
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
        reporter_name: `${validatedData.reporterFirstName} ${validatedData.reporterLastName}`,
        reporter_email: validatedData.reporterEmail,
        reporter_phone: validatedData.reporterPhone,
      })
      .select()
      .single();

    if (reportError) {
      console.error("Error creating report record:", reportError);
      throw new Error(`Failed to create report: ${reportError.message}`);
    }

    // Process images: copy from temp to permanent location and create records
    for (const image of validatedData.images) {
      try {
        // Generate permanent path
        const permanentPath = `reports/${report.id}/${image.fileName}`;

        // Download the file from temp location
        const { data: fileData, error: downloadError } = await supabase.storage
          .from("report-images")
          .download(image.storagePath);

        if (downloadError) {
          console.error("Error downloading temp file:", downloadError);
          throw new Error(
            `Failed to download temp file: ${downloadError.message}`
          );
        }

        // Upload to permanent location
        const { error: uploadError } = await supabase.storage
          .from("report-images")
          .upload(permanentPath, fileData);

        if (uploadError) {
          console.error("Error uploading to permanent location:", uploadError);
          throw new Error(
            `Failed to upload to permanent location: ${uploadError.message}`
          );
        }

        // Create report_images record
        const { error: imageRecordError } = await supabase
          .from("report_images")
          .insert({
            report_id: report.id,
            storage_path: permanentPath,
            file_name: image.fileName,
            file_type: image.fileType,
            file_size: image.fileSize,
          });

        if (imageRecordError) {
          console.error("Error creating image record:", imageRecordError);
          throw new Error(
            `Failed to create image record: ${imageRecordError.message}`
          );
        }
      } catch (error) {
        console.error("Error processing image:", error);
        // Create error report entry
        await supabase.from("report_history").insert({
          report_id: report.id,
          action: "error",
          details: {
            error:
              error instanceof Error
                ? error.message
                : "Unknown error during image processing",
            image: image.fileName,
          },
        });
        throw error;
      }
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
