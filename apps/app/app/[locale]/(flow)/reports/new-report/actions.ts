"use server";

import { redirect } from "@/i18n/navigation";
import { log, logError, logSuccess } from "@/lib/logger";
import { reportStore } from "@/lib/store";
import { createClient } from "@/lib/supabase/server";
import { EmailSendParams, Locale } from "@/lib/types";
import { ReportEmail as ExternalReportEmail } from "@repo/transactional/emails/extern";
import { ReportEmail as InternalReportEmail } from "@repo/transactional/emails/intern";
import messages from "@repo/translations/messages";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// Helper function for retrying email sending
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

// Helper function to get translated type name
function getTranslatedType(typeId: string, locale: Locale) {
  try {
    const translations = messages[locale];
    const translatedName =
      translations.incidentTypes.types[
        typeId as keyof typeof translations.incidentTypes.types
      ]?.name;
    return translatedName || typeId;
  } catch (error) {
    return typeId;
  }
}

// Helper function to get translated subtype name
function getTranslatedSubtype(
  typeId: string,
  subtypeId: string,
  locale: Locale
) {
  try {
    const translations = messages[locale];
    const type =
      translations.incidentTypes.types[
        typeId as keyof typeof translations.incidentTypes.types
      ];
    if (type && "subtypes" in type) {
      const subtypes = type.subtypes as Record<string, { name: string }>;
      const translatedName = subtypes[subtypeId]?.name;
      return translatedName || subtypeId;
    }
    return subtypeId;
  } catch (error) {
    return subtypeId;
  }
}

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

    // Log all form data keys and values for debugging
    const formDataEntries: Record<string, string | File> = {};
    for (const [key, value] of formData.entries()) {
      formDataEntries[key] = value;
    }
    log("Form data received in submitReport action", formDataEntries);

    const firstName = formData.get("reporter_first_name");
    const lastName = formData.get("reporter_last_name");
    const email = formData.get("reporter_email");
    const phone = formData.get("reporter_phone");
    const locale = formData.get("locale");
    const incidentTypeId = formData.get("incident_type_id");
    const incidentSubtypeId = formData.get("incident_subtype_id");
    const description = formData.get("description");
    const locationLat = formData.get("location_lat");
    const locationLng = formData.get("location_lng");
    const locationAddress = formData.get("location_address");
    const imageFilename = formData.get("image-filename") as string;

    log("Submitting report with data", {
      firstName,
      lastName,
      email,
      phone,
      locale,
      incidentTypeId,
      incidentSubtypeId,
      description,
      locationLat,
      locationLng,
      locationAddress,
      imageFilename,
    });

    // Set incident_subtype_id to null if it's empty or not provided
    const finalSubtypeId =
      incidentSubtypeId && String(incidentSubtypeId).trim()
        ? incidentSubtypeId
        : null; // Use null when there's no subtype

    const { data, error } = await supabase
      .from("reports")
      .insert({
        reporter_first_name: firstName,
        reporter_last_name: lastName,
        reporter_email: email,
        reporter_phone: phone || null,
        incident_type_id: incidentTypeId,
        incident_subtype_id: finalSubtypeId,
        description: description || "",
        location_lat: locationLat ? parseFloat(locationLat as string) : null,
        location_lng: locationLng ? parseFloat(locationLng as string) : null,
        location_address: locationAddress || "",
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

    // Prepare email data
    const emailProps = {
      imageCount: imageFilename ? 1 : 0,
      locale: locale as Locale,
      reportId,
      location: (locationAddress as string) || "",
      incidentType: {
        type: {
          id: incidentTypeId as string,
          name: getTranslatedType(incidentTypeId as string, locale as Locale),
          has_subtypes: Boolean(finalSubtypeId),
        },
        subtype: finalSubtypeId
          ? {
              id: finalSubtypeId as string,
              name: getTranslatedSubtype(
                incidentTypeId as string,
                finalSubtypeId as string,
                locale as Locale
              ),
            }
          : undefined,
      },
      description: description as string,
      userData: {
        firstName: firstName as string,
        lastName: lastName as string,
        email: email as string,
        phone: phone as string,
      },
    };

    try {
      // Send internal email
      await sendEmailWithRetry({
        from: "notifications@fixapp.ch",
        to: "reports@fixapp.ch",
        cc: "hello@studio-zurich.ch",
        subject: "New Report Submitted",
        react: InternalReportEmail(emailProps),
      });

      // Send external email
      await sendEmailWithRetry({
        from: "notifications@fixapp.ch",
        to: email as string,
        bcc: "reports@fixapp.ch",
        subject: "Your Report Has Been Received",
        react: ExternalReportEmail(emailProps),
      });

      logSuccess("Emails sent successfully", { reportId });
    } catch (emailError) {
      logError("Error sending emails", emailError);
      // Continue with redirect even if email sending fails
    }

    reportStore.setState((state) => ({
      ...state,
      isSubmitted: true,
      step: 0,
    }));

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
