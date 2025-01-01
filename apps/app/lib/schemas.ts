import { z } from "zod";

export const reportImageSchema = z.object({
  previewUrl: z.string().url(),
  storagePath: z.string(),
  fileName: z.string(),
  fileType: z.string(),
  fileSize: z.number(),
});

export const locationSchema = z.object({
  lat: z.number(),
  lng: z.number(),
  address: z.string(),
});

export const reportSchema = z.object({
  images: z.array(reportImageSchema).optional().default([]),
  location: locationSchema,
  incidentTypeId: z.string().uuid({
    message: "Please select an incident type",
  }),
  incidentSubtypeId: z.string().uuid().optional(),
  description: z.string().optional(),
  reporterFirstName: z
    .string({
      required_error: "First name is required",
    })
    .min(1, "First name is required"),
  reporterLastName: z
    .string({
      required_error: "Last name is required",
    })
    .min(1, "Last name is required"),
  reporterEmail: z
    .string({
      required_error: "Email is required",
    })
    .email("Invalid email address"),
  reporterPhone: z.string().optional(),
});

export const incidentDescriptionSchema = z.object({
  description: z.string().optional(),
});

export type IncidentDescriptionSchema = z.infer<
  typeof incidentDescriptionSchema
>;

export const imageMetadataSchema = z.object({
  coordinates: z
    .object({
      lat: z.number(),
      lng: z.number(),
    })
    .optional(),
  fileInfo: z
    .object({
      size: z.number(),
      format: z.string(),
    })
    .optional(),
});

export const imagesMetadataSchema = z.record(imageMetadataSchema);
