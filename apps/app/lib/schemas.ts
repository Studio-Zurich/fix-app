import { z } from "zod";
import { IMAGE_CONSTANTS } from "./constants";

// Image upload validation schema
export const imageUploadSchema = z.object({
  image: z
    .instanceof(File)
    .refine((file) => file.size <= IMAGE_CONSTANTS.MAX_SIZE_MB * 1024 * 1024, {
      message: IMAGE_CONSTANTS.FILE_SIZE_ERROR,
    })
    .refine(
      (file) =>
        IMAGE_CONSTANTS.ALLOWED_TYPES.includes(
          file.type as (typeof IMAGE_CONSTANTS.ALLOWED_TYPES)[number]
        ),
      {
        message: IMAGE_CONSTANTS.FILE_TYPE_ERROR,
      }
    ),
});

// Location validation schema
export const locationSchema = z.object({
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  address: z.string().optional(),
});
