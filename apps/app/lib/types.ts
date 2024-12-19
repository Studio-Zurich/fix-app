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
  images?: ReportImage[];
  location: ReportLocation;
  incidentTypeId: string;
  incidentSubtypeId?: string;
  description?: string;
  reporterFirstName: string;
  reporterLastName: string;
  reporterEmail: string;
  reporterPhone?: string;
};

export type StepStatus = "pending" | "current" | "completed";
