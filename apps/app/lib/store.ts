import { create } from "zustand";

interface Image {
  previewUrl: string;
  storagePath: string;
  fileName: string;
  fileType: string;
  fileSize: number;
}

interface ReportData {
  images: Image[];
  description?: string;
  location?: {
    lat: number;
    lng: number;
    address: string;
  };
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
}

interface ReportStore extends ReportState {
  reset: () => void;
  setCurrentStep: (step: number) => void;
  updateReportData: (data: Partial<ReportData>) => void;
}

const initialState: ReportState = {
  currentStep: 0,
  reportData: {
    images: [],
  },
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
}));
