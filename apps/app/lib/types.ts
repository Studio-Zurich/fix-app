export type ReportImage = {
  previewUrl: string;
  storagePath: string;
  fileName: string;
  fileType: string;
  fileSize: number;
};

export type ReportLocation = {
  lat: number;
  lng: number;
  address: string;
};

export type ReportData = {
  images: ReportImage[];
  location: ReportLocation;
  description?: string;
  reporterFirstName?: string;
  reporterLastName?: string;
  reporterEmail?: string;
  reporterPhone?: string;
  incidentTypeId: string;
  incidentSubtypeId?: string;
};

export type ImageMetadata = {
  coordinates?: { lat: number; lng: number };
  fileInfo?: {
    size: number;
    format: string;
  };
};

export type ImagesMetadata = {
  [url: string]: ImageMetadata;
};
