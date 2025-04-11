"use server";

import { redirect } from "@/i18n/navigation";
import { log, logError, logSuccess } from "@/lib/logger";
import { createClient } from "@/lib/supabase/server";
import { isRedirectError } from "next/dist/client/components/redirect-error";

export type ActionState = {
  success: boolean;
  message: string;
};

export async function submitReport(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const supabase = await createClient();

    const firstName = formData.get("reporter_first_name");
    const lastName = formData.get("reporter_last_name");
    const email = formData.get("reporter_email");
    const phone = formData.get("reporter_phone");
    const locale = formData.get("locale");
    const incidentTypeId = formData.get("incident_type_id");
    const incidentSubtypeId = formData.get("incident_subtype_id");
    const imageFilename = formData.get("image-filename") as string;

    log("Submitting report with data", {
      firstName,
      lastName,
      email,
      phone,
      locale,
      incidentTypeId,
      incidentSubtypeId,
      imageFilename,
    });

    const { data, error } = await supabase
      .from("reports")
      .insert({
        reporter_first_name: firstName,
        reporter_last_name: lastName,
        reporter_email: email,
        reporter_phone: phone || null,
        incident_type_id: incidentTypeId,
        incident_subtype_id: incidentSubtypeId,
        locale: locale,
        status: "open",
      })
      .select();

    if (error) {
      logError("Failed to submit report to database", error);
      return {
        success: false,
        message: `Failed to submit report: ${error.message}`,
      };
    }

    const reportId = data[0]?.id;
    logSuccess("Report created successfully", { reportId });

    // If an image was uploaded, move it from temp to the report's folder
    if (imageFilename) {
      try {
        // Define source and destination paths
        const sourcePath = `temp/${imageFilename}`;
        const destinationPath = `${reportId}/${imageFilename}`;

        log("Moving image from temp to report folder", {
          sourcePath,
          destinationPath,
        });

        // Copy the file from temp to the report's folder
        const { error: copyError } = await supabase.storage
          .from("report-images")
          .copy(sourcePath, destinationPath);

        if (copyError) {
          logError("Error copying image", copyError);
          // Continue with the redirect even if image move fails
        } else {
          logSuccess("Image moved successfully", { destinationPath });
        }
      } catch (imageError) {
        logError("Error handling image", imageError);
        // Continue with the redirect even if image handling fails
      }
    }

    log("Redirecting to report page", `/reports/${reportId}`);

    redirect({
      href: `/reports/${reportId}`,
      locale: locale as string,
    });

    return {
      success: true,
      message: `Report submitted successfully. Report ID: ${reportId}`,
    };
  } catch (e) {
    if (isRedirectError(e)) {
      throw e;
    }

    logError("Error in submitReport", e);

    return {
      success: false,
      message: "An unexpected error occurred",
    };
  }
}

export async function uploadReportImage(formData: FormData) {
  const file = formData.get("image") as File;

  if (!file) {
    logError("No image provided for upload");
    return { error: "No image provided" };
  }

  try {
    // Use the filename from the file object (which now has a unique name)
    const filePath = `temp/${file.name}`;

    log("Uploading image to temp folder", {
      filePath,
      fileSize: file.size,
      fileType: file.type,
    });

    // Upload to Supabase storage directly without processing
    const supabase = await createClient();
    const { error } = await supabase.storage
      .from("report-images")
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      logError("Error uploading image to Supabase", error);
      throw error;
    }

    // Get the public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("report-images").getPublicUrl(filePath);

    logSuccess("Image uploaded successfully", { filePath, publicUrl });

    return { url: publicUrl, filename: file.name };
  } catch (error) {
    logError("Error uploading image", error);
    return { error: "Failed to upload image" };
  }
}
