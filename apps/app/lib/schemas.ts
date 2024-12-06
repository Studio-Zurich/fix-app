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
  incidentTypeId: z.string().uuid().optional(),
  incidentSubtypeId: z.string().uuid().optional(),
  description: z.string().min(1),
  reporterFirstName: z.string().min(1, "Bitte geben Sie Ihren Vornamen ein"),
  reporterLastName: z.string().min(1, "Bitte geben Sie Ihren Nachnamen ein"),
  reporterEmail: z
    .string()
    .email("Bitte geben Sie eine gültige E-Mail-Adresse ein"),
  reporterPhone: z.string().optional(),
});

export const incidentDescriptionSchema = z.object({
  description: z
    .string()
    .min(1, "Bitte geben Sie eine Beschreibung ein")
    .max(1000, "Beschreibung darf maximal 1000 Zeichen lang sein"),
});

export type IncidentDescriptionSchema = z.infer<
  typeof incidentDescriptionSchema
>;
