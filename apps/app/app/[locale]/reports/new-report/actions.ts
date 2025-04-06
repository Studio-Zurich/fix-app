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
  console.log("submitReport called with formData");

  try {
    const supabase = await createClient();
    const timestamp = getCETTimestamp();
    const t = await getTranslations();
    let uploadedFiles: string[] = [];
    let files: File[] = [];

    try {
      // Get and validate form data
      files = formData.getAll("files") as File[];
      const locale = formData.get("locale") as "de" | "en";

      console.log("Form data received:", {
        filesCount: files.length,
        locale,
        hasLocation: !!formData.get("location"),
        hasIncidentType: !!formData.get("incidentType"),
        hasDescription: !!formData.get("description"),
        hasUserData: !!formData.get("userData"),
      });

      // Safely parse JSON data with error handling
      let location: Location;
      let incidentType: SelectedIncidentTypeType;
      let description: ReportDescription | undefined;
      let userData: UserData;

      try {
        const locationJson = formData.get("location") as string;
        location = JSON.parse(locationJson) as Location;
      } catch (error) {
        console.error("Error parsing location data:", error);
        return {
          success: false,
          error: {
            code: "UNKNOWN",
            message: "Invalid location data format",
          },
        };
      }

      try {
        const incidentTypeJson = formData.get("incidentType") as string;
        incidentType = JSON.parse(incidentTypeJson) as SelectedIncidentTypeType;
      } catch (error) {
        console.error("Error parsing incident type data:", error);
        return {
          success: false,
          error: {
            code: "UNKNOWN",
            message: "Invalid incident type data format",
          },
        };
      }

      try {
        const descriptionJson = formData.get("description") as string | null;
        description = descriptionJson
          ? (JSON.parse(descriptionJson) as ReportDescription)
          : undefined;
      } catch (error) {
        console.error("Error parsing description data:", error);
        return {
          success: false,
          error: {
            code: "UNKNOWN",
            message: "Invalid description data format",
          },
        };
      }

      try {
        const userDataJson = formData.get("userData") as string;
        userData = JSON.parse(userDataJson) as UserData;
      } catch (error) {
        console.error("Error parsing user data:", error);
        return {
          success: false,
          error: {
            code: "UNKNOWN",
            message: "Invalid user data format",
          },
        };
      }

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
      let validatedData;
      try {
        validatedData = reportSubmissionSchema.parse({
          files: files.length > 0 ? files : undefined,
          locale,
          location,
          incidentType,
          description,
          userData,
        });
      } catch (error) {
        console.error("Error validating submission data:", error);
        return {
          success: false,
          error: {
            code: "UNKNOWN",
            message: "Invalid submission data",
          },
        };
      }

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
        return {
          success: false,
          error: {
            code: "DATABASE_ERROR",
            message: t("components.reportFlow.errors.databaseError"),
          },
        };
      }

      // Step 2: Process and upload files if any
      if (files.length > 0) {
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
            return {
              success: false,
              error: {
                code: "UPLOAD_FAILED",
                message: t("components.reportFlow.errors.uploadFailed"),
              },
            };
          }
          return {
            success: false,
            error: {
              code:
                firstFailure.error.code === "INVALID_FILE_TYPE"
                  ? "INVALID_FILE_TYPE"
                  : "UPLOAD_FAILED",
              message: firstFailure.error.message,
            },
          };
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
              return {
                success: false,
                error: {
                  code: "UPLOAD_FAILED",
                  message: t("components.reportFlow.errors.uploadFailed"),
                },
              };
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

        // Prepare email attachments using already processed images
        const fileBuffers = processedImages
          .filter(
            (result): result is ProcessedImage & { success: true } =>
              result.success
          )
          .map((processedImage) => ({
            filename: processedImage.fileName,
            content: processedImage.buffer,
          }));

        // Send emails sequentially to ensure both are sent
        try {
          // Send internal email first
          await sendEmailWithRetry({
            from: EMAIL_CONSTANTS.FROM_ADDRESS,
            to: EMAIL_CONSTANTS.TO_ADDRESS,
            bcc: EMAIL_CONSTANTS.BCC_ADDRESSES,
            subject: t("mails.internal.subject"),
            react: InternalReportEmail(emailProps),
            attachments: fileBuffers,
          });

          // Then send external email
          await sendEmailWithRetry({
            from: EMAIL_CONSTANTS.FROM_ADDRESS,
            to: validatedData.userData.email,
            subject: t("mails.external.subject"),
            react: ExternalReportEmail(emailProps),
            attachments: fileBuffers,
          });
        } catch (error) {
          console.error("Error sending emails:", {
            error,
            reportId: report.id,
            fileCount: files.length,
          });
          // Log the error but don't fail the whole process
          // The files are already uploaded and the report is created
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

      return {
        success: false,
        error: {
          code: "UPLOAD_FAILED",
          message: t("components.reportFlow.errors.uploadFailed"),
        },
      };
    }
  } catch (outerError) {
    console.error("Outer error in submitReport:", outerError);
    return {
      success: false,
      error: {
        code: "UNKNOWN",
        message: "An unexpected error occurred",
      },
    };
  }
}
