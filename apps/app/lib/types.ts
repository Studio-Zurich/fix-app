// Locale type
export type Locale = "de" | "en";

// Location types
export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Location extends Coordinates {
  address: string;
}

// EXIF data interface
export interface ExifData {
  latitude?: number;
  longitude?: number;
  DateTimeOriginal?: string;
  Make?: string;
  Model?: string;
  source?: string;
  [key: string]: string | number | undefined; // For other potential EXIF properties
}

// Upload result interface
export interface UploadResult {
  filename?: string;
  url?: string;
  error?: string;
}

// Image Upload Props
export interface ImageUploadProps {
  onImageSelected?: (file: File) => void;
}

// Component Props Interfaces
export interface IncidentTypeProps {
  incidentTypes: Array<{
    id: string;
    name: string;
    description: string;
    active: boolean;
  }>;
  incidentSubtypes?: Array<{
    id: string;
    name: string;
    description: string;
    active: boolean;
    incident_type_id: string;
  }>;
}

export interface IncidentSubtypeProps {
  incidentSubtypes: Array<{
    id: string;
    name: string;
    description: string;
    active: boolean;
    incident_type_id: string;
  }>;
}

export interface IncidentDescriptionProps {
  maxCharacters?: number;
}

export interface UserDataFormFields {
  reporter_first_name: string;
  reporter_last_name: string;
  reporter_email: string;
  reporter_phone: string;
}
