import { create } from "zustand";
import { ImageMetadata, ImagesMetadata } from "./types";

interface Image {
  previewUrl: string;
  storagePath: string;
  fileName: string;
  fileType: string;
  fileSize: number;
}

interface Location {
  lat: number;
  lng: number;
  address: string;
}

interface ReportData {
  images: Image[];
  description?: string;
  location?: Location;
  reporterFirstName?: string;
  reporterLastName?: string;
  reporterEmail?: string;
  reporterPhone?: string;
  incidentTypeId?: string;
  incidentSubtypeId?: string;
}

export interface ReportState {
  currentStep: number;
  reportData: ReportData;
  location: Location | null;
  images: string[];
  imagesMetadata: ImagesMetadata;
}

interface ReportStore extends ReportState {
  reset: () => void;
  setCurrentStep: (step: number) => void;
  updateReportData: (data: Partial<ReportData>) => void;
  setLocation: (location: Location) => void;
  setImages: (images: string[]) => void;
  removeImage: (url: string) => void;
  setImageMetadata: (url: string, metadata: ImageMetadata) => void;
}

const initialState: ReportState = {
  currentStep: 0,
  reportData: {
    images: [],
  },
  location: null,
  images: [],
  imagesMetadata: {},
};

export const useReportStore = create<ReportStore>((set) => ({
  ...initialState,
  reset: () => set(initialState),
  setCurrentStep: (step) => set({ currentStep: step }),
  updateReportData: (data) =>
    set((state) => ({
      reportData: {
        ...state.reportData,
        ...data,
      },
    })),
  setLocation: (location) =>
    set((state) => ({
      location,
      reportData: {
        ...state.reportData,
        location,
      },
    })),
  setImages: (images) => set({ images }),
  removeImage: (url: string) =>
    set((state) => {
      const { [url]: removed, ...rest } = state.imagesMetadata;
      return {
        images: state.images.filter((img) => img !== url),
        imagesMetadata: rest,
      };
    }),
  setImageMetadata: (url: string, metadata: ImageMetadata) =>
    set((state) => ({
      imagesMetadata: {
        ...state.imagesMetadata,
        [url]: metadata,
      },
    })),
}));
