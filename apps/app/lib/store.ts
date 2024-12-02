import { create } from "zustand";
import { ReportData } from "./types";

interface ReportStore {
  currentStep: number;
  reportData: ReportData;
  setCurrentStep: (step: number) => void;
  updateReportData: (data: Partial<ReportData>) => void;
  reset: () => void;
}

const initialState: ReportData = {
  images: [],
};

export const useReportStore = create<ReportStore>((set) => ({
  currentStep: 0,
  reportData: initialState,
  setCurrentStep: (step) => set({ currentStep: step }),
  updateReportData: (data) =>
    set((state) => ({
      reportData: { ...state.reportData, ...data },
    })),
  reset: () => set({ currentStep: 0, reportData: initialState }),
}));
