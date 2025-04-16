import { z } from "zod";
import { IMAGE_CONSTANTS } from "./constants";

// Schema for image uploads
export const imageUploadSchema = z.object({
  image: z
    .instanceof(File)
    .refine(
      (file) =>
        IMAGE_CONSTANTS.ALLOWED_TYPES.includes(
          file.type as (typeof IMAGE_CONSTANTS.ALLOWED_TYPES)[number]
        ),
      IMAGE_CONSTANTS.FILE_TYPE_ERROR
    )
    .refine(
      (file) => file.size <= IMAGE_CONSTANTS.MAX_SIZE_MB * 1024 * 1024,
      IMAGE_CONSTANTS.FILE_SIZE_ERROR
    ),
});

// Location validation schema
export const locationSchema = z.object({
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  address: z.string().optional(),
});

// Schema for incident description
export const incidentDescriptionSchema = z.object({
  description: z
    .string()
    .min(10, "Description must be at least 10 characters long")
    .max(500, "Description must be less than 500 characters long"),
});

// Schema for user data
export const userDataSchema = z.object({
  reporter_first_name: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name must be less than 50 characters"),
  reporter_last_name: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name must be less than 50 characters"),
  reporter_email: z
    .string()
    .email("Please enter a valid email address")
    .min(1, "Email is required"),
  reporter_phone: z.string().optional(),
});
