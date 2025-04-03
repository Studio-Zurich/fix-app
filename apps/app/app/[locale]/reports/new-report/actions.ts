"use server";

import { EMAIL_CONSTANTS, FILE_CONSTANTS } from "@/lib/constants";
import { reportSubmissionSchema } from "@/lib/schemas";
import { createClient } from "@/lib/supabase/server";
import {
  EmailProps,
  EmailSendParams,
  FileUploadResponse,
  Location,
  ProcessedImage,
  ProcessedImageError,
  ProcessedImageSuccess,
  ReportDescription,
  SelectedIncidentTypeType,
  UserData,
} from "@/lib/types";
import { processImageForUpload } from "@/lib/utils/image";
import { ReportEmail as ErrorReportEmail } from "@repo/transactional/emails/error";
import { ReportEmail as ExternalReportEmail } from "@repo/transactional/emails/extern";
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

    // Validate file count if files are provided
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
      files: files.length > 0 ? files : undefined,
      locale,
      location,
      incidentType,
      description,
      userData,
    });

    // Step 1: Create report record
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

      // Send error notification for database errors
      await sendEmailWithRetry({
        from: EMAIL_CONSTANTS.FROM_ADDRESS,
        to: EMAIL_CONSTANTS.TO_ADDRESS,
        bcc: EMAIL_CONSTANTS.BCC_ADDRESSES,
        subject: "Error in Report Processing - Database Error",
        react: ErrorReportEmail({
          imageCount: files.length,
          locale: validatedData.locale,
          reportId: "DB_ERROR",
          errorType: "internal_mail",
          errorMessage: `Database error: ${reportError.message}`,
          location: validatedData.location.address,
          incidentType: {
            type: {
              ...validatedData.incidentType.type,
              has_subtypes: Boolean(validatedData.incidentType.subtype),
            },
            subtype: validatedData.incidentType.subtype,
          },
          description: validatedData.description?.text,
          userData: validatedData.userData,
        }),
      });

      return {
        success: false,
        error: {
          code: "DATABASE_ERROR",
          message: t("components.reportFlow.errors.databaseError"),
        },
      };
    }

    // Prepare email data
    const emailProps: EmailProps = {
      imageCount: files.length,
      locale: validatedData.locale,
      reportId: report.id,
      location: validatedData.location.address,
      incidentType: {
        type: {
          ...validatedData.incidentType.type,
          has_subtypes: Boolean(validatedData.incidentType.subtype),
        },
        subtype: validatedData.incidentType.subtype,
      },
      description: validatedData.description?.text,
      userData: validatedData.userData,
    };

    // Step 2: Send internal email
    try {
      await sendEmailWithRetry({
        from: EMAIL_CONSTANTS.FROM_ADDRESS,
        to: EMAIL_CONSTANTS.TO_ADDRESS,
        bcc: EMAIL_CONSTANTS.BCC_ADDRESSES,
        subject: t("mails.internal.subject"),
        react: InternalReportEmail(emailProps),
      });
    } catch (error) {
      console.error("Error sending internal email:", error);
      // Send error notification
      await sendEmailWithRetry({
        from: EMAIL_CONSTANTS.FROM_ADDRESS,
        to: EMAIL_CONSTANTS.TO_ADDRESS,
        bcc: EMAIL_CONSTANTS.BCC_ADDRESSES,
        subject: "Error in Report Processing - Internal Email Failed",
        react: ErrorReportEmail({
          ...emailProps,
          reportId: report.id,
          errorType: "internal_mail",
          errorMessage:
            error instanceof Error
              ? error.message
              : "Internal email sending failed",
        }),
      });
      throw error;
    }

    // Step 3: Send external email
    try {
      await sendEmailWithRetry({
        from: EMAIL_CONSTANTS.FROM_ADDRESS,
        to: validatedData.userData.email,
        subject: t("mails.external.subject"),
        react: ExternalReportEmail(emailProps),
      });
    } catch (error) {
      console.error("Error sending external email:", error);
      // Send error notification
      await sendEmailWithRetry({
        from: EMAIL_CONSTANTS.FROM_ADDRESS,
        to: EMAIL_CONSTANTS.TO_ADDRESS,
        bcc: EMAIL_CONSTANTS.BCC_ADDRESSES,
        subject: "Error in Report Processing - External Email Failed",
        react: ErrorReportEmail({
          ...emailProps,
          reportId: report.id,
          errorType: "external_mail",
          errorMessage:
            error instanceof Error
              ? error.message
              : "External email sending failed",
        }),
      });
      throw error;
    }

    // Step 4: Process and upload files if any
    if (files.length > 0) {
      try {
        // Process all images first
        const processedImages = await Promise.all(
          files.map(async (file): Promise<ProcessedImage> => {
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

            try {
              // Process and compress the image once
              const { buffer, fileName } = await processImageForUpload(file, {
                maxWidth: 1920,
                maxHeight: 1080,
                quality: 80,
                format: "jpeg",
              });

              return {
                success: true,
                buffer,
                fileName,
                filePath: `${FILE_CONSTANTS.STORAGE_BUCKET}/${report.id}/${fileName}`,
              };
            } catch (error) {
              console.error("Error processing image:", {
                error,
                fileName: file.name,
                fileSize: file.size,
                fileType: file.type,
              });
              return {
                success: false,
                error: {
                  code: "PROCESSING_FAILED",
                  message: t("components.reportFlow.errors.processingFailed"),
                },
              };
            }
          })
        );

        // Check for any processing failures
        const processingFailures = processedImages.filter(
          (result): result is ProcessedImageError => !result.success
        );
        if (processingFailures.length > 0) {
          const firstFailure = processingFailures[0];
          if (!firstFailure) {
            throw new Error("Image processing failed");
          }
          throw new Error(firstFailure.error.message);
        }

        // Upload files and create database records in parallel
        const uploadPromises = processedImages
          .filter((result): result is ProcessedImageSuccess => result.success)
          .map(async (processedImage) => {
            const { buffer, fileName, filePath } = processedImage;

            // Upload file and create database record in parallel
            const [uploadResult, imageRecord] = await Promise.all([
              supabase.storage.from("report-images").upload(filePath, buffer),
              supabase.from("report_images").insert({
                report_id: report.id,
                storage_path: filePath,
                file_name: fileName,
                file_type: "image/jpeg",
                file_size: buffer.length,
                created_at: timestamp,
              }),
            ]);

            if (uploadResult.error || imageRecord.error) {
              console.error("Error processing file:", {
                uploadError: uploadResult.error,
                imageError: imageRecord.error,
                fileName,
                fileSize: buffer.length,
                fileType: "image/jpeg",
              });
              // Clean up if needed
              if (!uploadResult.error) {
                await supabase.storage.from("report-images").remove([filePath]);
              }
              throw new Error("File upload failed");
            }

            uploadedFiles.push(filePath);
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
          throw new Error("Some uploads failed");
        }
      } catch (error) {
        console.error("Error in image processing/upload:", error);
        // Send error notification
        await sendEmailWithRetry({
          from: EMAIL_CONSTANTS.FROM_ADDRESS,
          to: EMAIL_CONSTANTS.TO_ADDRESS,
          bcc: EMAIL_CONSTANTS.BCC_ADDRESSES,
          subject: "Error in Report Processing - Image Upload Failed",
          react: ErrorReportEmail({
            ...emailProps,
            reportId: report.id,
            errorType: "image_upload",
            errorMessage:
              error instanceof Error
                ? error.message
                : "Image processing or upload failed",
          }),
        });
        throw error;
      }
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

    // Send error notification for unexpected errors
    try {
      await sendEmailWithRetry({
        from: EMAIL_CONSTANTS.FROM_ADDRESS,
        to: EMAIL_CONSTANTS.TO_ADDRESS,
        bcc: EMAIL_CONSTANTS.BCC_ADDRESSES,
        subject: "Error in Report Processing - Unexpected Error",
        react: ErrorReportEmail({
          imageCount: files?.length || 0,
          locale: (formData.get("locale") as "de" | "en") || "de",
          reportId: "UNEXPECTED_ERROR",
          errorType: "internal_mail",
          errorMessage:
            error instanceof Error
              ? error.message
              : "Unexpected error during report submission",
        }),
      });
    } catch (emailError) {
      console.error("Failed to send error notification:", emailError);
    }

    return {
      success: false,
      error: {
        code: "UPLOAD_FAILED",
        message: "Upload failed",
      },
    };
  }
}
