import { create } from "zustand";

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

interface ReportState {
  currentStep: number;
  reportData: ReportData;
  location: Location | null;
}

interface ReportStore extends ReportState {
  reset: () => void;
  setCurrentStep: (step: number) => void;
  updateReportData: (data: Partial<ReportData>) => void;
  setLocation: (location: Location) => void;
}

const initialState: ReportState = {
  currentStep: 0,
  reportData: {
    images: [],
  },
  location: null,
};

export const useReportStore = create<ReportStore>((set) => ({
  ...initialState,
  reset: () => set(initialState),
  setCurrentStep: (step) => set({ currentStep: step }),
  updateReportData: (data) =>
    set((state) => ({
      ...state,
      reportData: {
        ...state.reportData,
        ...data,
      },
    })),
  setLocation: (location) =>
    set((state) => ({
      ...state,
      location,
      reportData: {
        ...state.reportData,
        location,
      },
    })),
}));
