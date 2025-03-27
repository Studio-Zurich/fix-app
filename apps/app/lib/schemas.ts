import { z } from "zod";
import { FILE_CONSTANTS } from "./constants";

// File upload validation
export const fileSchema = z.object({
  size: z.number().max(FILE_CONSTANTS.MAX_SIZE),
  type: z.enum(FILE_CONSTANTS.ALLOWED_TYPES),
  name: z.string(),
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
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  active: z.boolean(),
});

export const incidentSubtypeSchema = z.object({
  id: z.string(),
  incident_type_id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  active: z.boolean(),
});

export const selectedIncidentTypeSchema = z.object({
  type: incidentTypeSchema,
  subtype: incidentSubtypeSchema.optional(),
});

// Report submission validation
export const reportSubmissionSchema = z.object({
  files: z.array(fileSchema),
  locale: z.enum(["de", "en"]),
  location: locationSchema,
  incidentType: selectedIncidentTypeSchema,
});
