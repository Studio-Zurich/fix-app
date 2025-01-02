import { create } from "zustand";
import {
  ImageMetadata,
  ImagesMetadata,
  ReportData,
  ReportLocation,
} from "./types";

interface ReportState {
  currentStep: number;
  reportData: Partial<ReportData>;
  location: ReportLocation | null;
  images: string[];
  imagesMetadata: ImagesMetadata;
  stepValidation: {
    location?: boolean;
    incidentType?: boolean;
    userData?: boolean;
  };
  skipIncidentType: boolean;
}

interface ReportStore extends ReportState {
  reset: () => void;
  setCurrentStep: (step: number) => void;
  updateReportData: (data: Partial<ReportData>) => void;
  setLocation: (location: ReportLocation) => void;
  setImages: (images: string[]) => void;
  removeImage: (url: string) => void;
  setImageMetadata: (url: string, metadata: ImageMetadata) => void;
  setStepValidation: (
    step: keyof ReportState["stepValidation"],
    isValid: boolean
  ) => void;
}

const initialState: ReportState = {
  currentStep: 0,
  reportData: {
    images: [],
  },
  location: null,
  images: [],
  imagesMetadata: {},
  stepValidation: {},
  skipIncidentType: false,
};

export const useReportStore = create<ReportStore>((set) => ({
  ...initialState,
  reset: () => set(initialState),
  setCurrentStep: (step) => {
    set((state) => {
      if (state.skipIncidentType && step === 2) {
        return { currentStep: 3 };
      }
      return { currentStep: step };
    });
  },
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
  setStepValidation: (step, isValid) =>
    set((state) => ({
      stepValidation: {
        ...state.stepValidation,
        [step]: isValid,
      },
    })),
}));
