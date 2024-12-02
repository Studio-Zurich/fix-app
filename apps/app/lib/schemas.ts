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
  incidentTypeId: z.string().uuid(),
  incidentSubtypeId: z.string().uuid().optional(),
  description: z.string().min(1),
  reporterFirstName: z.string().min(1),
  reporterLastName: z.string().min(1),
  reporterEmail: z.string().email(),
  reporterPhone: z.string().optional(),
});
