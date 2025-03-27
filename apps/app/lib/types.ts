import { z } from "zod";
import { reportSchema } from "./db-schema";

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

export type EmailProps = {
  imageCount: number;
  locale: "de" | "en";
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

export type IncidentType = {
  name: string;
  subtype?: string;
};

// File upload related types
export type FileUploadResponse = {
  success: boolean;
  error?: string;
  reportId?: string;
};

export type FileAttachment = {
  filename: string;
  content: Buffer;
};

export type InternalEmailProps = {
  reportId: string;
  reporterName: string;
  reporterEmail: string;
  location: string;
  description: string;
  imageCount: number;
  incidentType: IncidentType;
  locale: "de" | "en";
};

// Email sending related types
export type EmailSendParams = {
  from: string;
  to: string;
  subject: string;
  react: React.ReactElement;
  attachments?: FileAttachment[];
};
