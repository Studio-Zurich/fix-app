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
  images: z.array(reportImageSchema),
  location: locationSchema,
  description: z.string().optional(),
  reporterFirstName: z.string().optional(),
  reporterLastName: z.string().optional(),
  reporterEmail: z.string().email().optional(),
  reporterPhone: z.string().optional(),
  incidentTypeId: z.string(),
  incidentSubtypeId: z.string().optional(),
  locale: z.enum(["de", "en"]).optional(),
});

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
