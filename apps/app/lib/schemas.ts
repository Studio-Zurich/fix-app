import { z } from "zod";
import { FILE_CONSTANTS } from "./constants";

// File upload constants
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
] as const;
export const ALLOWED_FILE_EXTENSIONS = ["jpg", "jpeg", "png", "gif"] as const;

// File upload validation
export const fileUploadSchema = z.object({
  files: z.array(
    z.object({
      size: z
        .number()
        .max(FILE_CONSTANTS.MAX_SIZE, "File size must be less than 5MB"),
      type: z.enum(FILE_CONSTANTS.ALLOWED_TYPES, {
        errorMap: () => ({
          message: "Invalid file type. Only JPEG, PNG and GIF are allowed",
        }),
      }),
      name: z.string(),
    })
  ),
});

// Location validation
export const locationSchema = z.object({
  lat: z.number(),
  lng: z.number(),
  address: z.string().min(1, "Address is required"),
});

// Contact information validation
export const contactInfoSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
});

// Incident type validation
export const incidentTypeSchema = z.object({
  name: z.string().min(1, "Incident type is required"),
  subtype: z.string().optional(),
});

// Report submission validation
export const reportSubmissionSchema = z.object({
  files: z.array(z.any()),
  locale: z.enum(["de", "en"]),
});
