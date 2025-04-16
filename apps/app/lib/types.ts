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
