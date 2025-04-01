import { z } from "zod";
import { reportSchema } from "./db-schema";

// Locale type
export type Locale = "de" | "en";

// Email related types
export type EmailMessages = {
  pages: {
    newReport: {
      title: string;
      description: string;
    };
  };
  components: {
    reportFlow: {
      takePhotoOrChooseImage: string;
      uploading: string;
      uploadImage: string;
      errors: {
        invalidFileType: string;
        uploadFailed: string;
      };
    };
    reportOverview: {
      imagesUploaded: string;
      image: string;
      images: string;
      location: string;
      incidentType: string;
      description: string;
      reporter: string;
      reporterEmail: string;
      reporterPhone: string;
    };
  };
  mails: {
    internal: {
      title: string;
      newReport: string;
      images: string;
    };
    external: {
      title: string;
      greeting: string;
      confirmationMessage: string;
      reportNumber: string;
      nextSteps: string;
      nextStepsDescription: string;
      viewReport: string;
      incidentType: string;
      location: string;
      description: string;
    };
  };
};

// Base email props
export type BaseEmailProps = {
  imageCount: number;
  locale: "de" | "en";
};

// Extended email props for internal emails
export type EmailProps = BaseEmailProps & {
  reportId?: string;
  reporterName?: string;
  reporterEmail?: string;
  location?: string;
  description?: string;
  incidentType?: SelectedIncidentTypeType;
  userData?: UserData;
};

// Report related types
export type Report = z.infer<typeof reportSchema>;

export type Location = {
  lat: number;
  lng: number;
  address: string;
};

export type ContactInfo = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
};

// Incident type related types
export type IncidentTypeType = {
  id: string;
  name: string;
  description: string | null;
  active: boolean;
  has_subtypes: boolean;
};

export type IncidentSubtypeType = {
  id: string;
  incident_type_id: string;
  name: string;
  description: string | null;
  active: boolean;
};

export type SelectedIncidentTypeType = {
  type: IncidentTypeType;
  subtype?: IncidentSubtypeType;
};

// Report description type
export type ReportDescription = {
  text: string;
  maxLength: number;
};

// File upload related types
export type ReportError = {
  code:
    | "FILE_TOO_LARGE"
    | "INVALID_FILE_TYPE"
    | "UPLOAD_FAILED"
    | "UNKNOWN"
    | "NO_FILES"
    | "TOO_MANY_FILES"
    | "DATABASE_ERROR"
    | "PROCESSING_FAILED";
  message: string;
};

export type FileUploadResponse = {
  success: boolean;
  error?: ReportError;
  reportId?: string;
};

export type FileAttachment = {
  filename: string;
  content: Buffer;
};

// Image processing related types
export type ProcessedImageSuccess = {
  success: true;
  buffer: Buffer;
  fileName: string;
  filePath: string;
};

export type ProcessedImageError = {
  success: false;
  error: {
    code: "INVALID_FILE_TYPE" | "PROCESSING_FAILED";
    message: string;
  };
};

export type ProcessedImage = ProcessedImageSuccess | ProcessedImageError;

// Email sending related types
export type EmailSendParams = {
  from: string;
  to: string;
  bcc?: string[];
  subject: string;
  react: React.ReactElement;
  attachments?: FileAttachment[];
};

// User data related types
export type UserData = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
};

// Image location related types
export type ImageLocation = {
  lat: number;
  lng: number;
  address: string;
};

// Map related types
export type Suggestion = {
  id: string;
  place_name: string;
  center: [number, number];
};

export type MapOverlayProps = {
  onInteraction: () => void;
  text: string;
};

// Component props types
export interface ImageUploadProps {
  files: File[];
  setFiles: (files: File[]) => void;
  onLocationFound: (location: ImageLocation | null) => void;
  isUploading: boolean;
  locationSubmitted: boolean;
  detectedLocation?: ImageLocation | null;
}

export interface LocationMapProps {
  onLocationSelect: (location: ImageLocation | null) => void;
  initialLocation?: ImageLocation | null;
  locationSubmitted?: boolean;
  hasInteractedWithMap: boolean;
  onMapInteraction: () => void;
  setHasInteractedWithMap: (hasInteracted: boolean) => void;
  detectedLocation?: ImageLocation | null;
}

export interface StepHeaderProps {
  step: string;
  description: string;
}
