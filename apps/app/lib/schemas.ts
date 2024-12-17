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
  images: z.array(reportImageSchema).default([]),
  location: locationSchema,
  incidentTypeId: z.string().uuid(),
  incidentSubtypeId: z.string().uuid().optional(),
  description: z.string().min(1),
  reporterFirstName: z.string().optional(),
  reporterLastName: z.string().optional(),
  reporterEmail: z.string().email("Invalid email address").optional(),
  reporterPhone: z.string().optional(),
});

export const incidentDescriptionSchema = z.object({
  description: z
    .string()
    .min(1, "Please provide a description")
    .max(1000, "Description must not exceed 1000 characters"),
});

export type IncidentDescriptionSchema = z.infer<
  typeof incidentDescriptionSchema
>;
