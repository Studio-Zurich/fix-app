"use server";

import { reportSchema } from "@/lib/schemas";
import { createClient } from "@/lib/supabase/server";
import { ReportData } from "@/lib/types";
import { revalidatePath } from "next/cache";

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

    if (reportError) throw reportError;

    // Process images: copy from temp to permanent location and create records
    for (const image of validatedData.images) {
      try {
        // Generate permanent path
        const permanentPath = `reports/${report.id}/${image.fileName}`;

        // Download the file from temp location
        const { data: fileData, error: downloadError } = await supabase.storage
          .from("report-images")
          .download(image.storagePath);

        if (downloadError) throw downloadError;

        // Upload to permanent location
        const { error: uploadError } = await supabase.storage
          .from("report-images")
          .upload(permanentPath, fileData);

        if (uploadError) throw uploadError;

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

        if (imageRecordError) throw imageRecordError;
      } catch (error) {
        console.error("Error processing image:", error);
        throw error;
      }
    }

    // Create report history entry
    const { error: historyError } = await supabase
      .from("report_history")
      .insert({
        report_id: report.id,
        action: "created",
        details: { status: "submitted" },
      });

    if (historyError) throw historyError;

    revalidatePath("/");
    return { success: true, reportId: report.id };
  } catch (error) {
    console.error("Error submitting report:", error);
    return { success: false, error: "Failed to submit report" };
  }
}
