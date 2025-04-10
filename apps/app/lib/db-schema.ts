import { z } from "zod";

export const governmentDepartmentSchema = z.object({
  id: z.string().uuid(),
  canton: z.string(),
  department_name: z.string(),
  email: z.string().email(),
  phone: z.string(),
  description: z.string(),
  active: z.boolean(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const incidentTypeSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  active: z.boolean(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  description: z.string(),
});

export const incidentSubtypeSchema = z.object({
  id: z.string().uuid(),
  incident_type_id: z.string().uuid(),
  name: z.string(),
  active: z.boolean(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  description: z.string(),
});

export const incidentMappingSchema = z.object({
  id: z.string().uuid(),
  canton: z.string(),
  department_id: z.string().uuid(),
  incident_type_id: z.string().uuid(),
  incident_subtype_id: z.string().uuid(),
  is_default: z.boolean(),
  active: z.boolean(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const reportSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid().optional(),
  incident_type_id: z.string().uuid(),
  incident_subtype_id: z.string().uuid(),
  status: z.string(),
  description: z.string(),
  location_lat: z.number(),
  location_lng: z.number(),
  location_address: z.string(),
  reporter_email: z.string().email(),
  reporter_phone: z.string().optional(),
  reporter_first_name: z.string(),
  reporter_last_name: z.string(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  locale: z.string(),
});
