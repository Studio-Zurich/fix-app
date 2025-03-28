import { submitReport } from "@/app/[locale]/reports/new-report/actions";
import { create } from "zustand";
import {
  IncidentSubtypeType,
  IncidentTypeType,
  Location,
  ReportDescription,
  UserData,
} from "./types";

interface ReportStore {
  // Form Data
  files: File[];
  location: Location | null;
  selectedType: IncidentTypeType | undefined;
  selectedSubtype: IncidentSubtypeType | undefined;
  description: ReportDescription | undefined;
  userData: UserData | undefined;

  // UI State
  currentStep: number;
  uploading: boolean;
  error: string | null;

  // Actions
  setFiles: (files: File[]) => void;
  setLocation: (location: Location) => void;
  setSelectedType: (type: IncidentTypeType) => void;
  setSelectedSubtype: (subtype: IncidentSubtypeType) => void;
  setDescription: (description: ReportDescription) => void;
  setUserData: (data: UserData) => void;
  setCurrentStep: (step: number) => void;
  setUploading: (uploading: boolean) => void;
  setError: (error: string | null) => void;

  // Form Actions
  submitReport: (locale: "de" | "en") => Promise<void>;
  resetForm: () => void;
}

export const useReportStore = create<ReportStore>((set, get) => ({
  // Initial state
  files: [],
  location: null,
  selectedType: undefined,
  selectedSubtype: undefined,
  description: undefined,
  userData: undefined,
  currentStep: 1,
  uploading: false,
  error: null,

  // Actions
  setFiles: (files) => set({ files }),
  setLocation: (location) => set({ location }),
  setSelectedType: (type) =>
    set({ selectedType: type, selectedSubtype: undefined }),
  setSelectedSubtype: (subtype) => set({ selectedSubtype: subtype }),
  setDescription: (description) => set({ description }),
  setUserData: (userData) => set({ userData }),
  setCurrentStep: (step) => set({ currentStep: step }),
  setUploading: (uploading) => set({ uploading }),
  setError: (error) => set({ error }),

  // Form Actions
  submitReport: async (locale) => {
    const state = get();
    if (!state.location || !state.selectedType || !state.userData) {
      set({ error: "Missing required fields" });
      return;
    }

    set({ uploading: true, error: null });
    try {
      const formData = new FormData();
      state.files.forEach((file) => formData.append("files", file));
      formData.append("locale", locale);
      formData.append("location", JSON.stringify(state.location));
      formData.append(
        "incidentType",
        JSON.stringify({
          type: state.selectedType,
          subtype: state.selectedSubtype,
        })
      );
      if (state.description) {
        formData.append("description", JSON.stringify(state.description));
      }
      formData.append("userData", JSON.stringify(state.userData));

      const result = await submitReport(formData);
      if (!result.success) {
        set({ error: result.error?.message || "Upload failed" });
        return;
      }

      // Reset form after successful upload
      get().resetForm();
    } catch (err) {
      set({ error: "Upload failed" });
    } finally {
      set({ uploading: false });
    }
  },

  resetForm: () =>
    set({
      files: [],
      location: null,
      selectedType: undefined,
      selectedSubtype: undefined,
      description: undefined,
      userData: undefined,
      currentStep: 1,
      uploading: false,
      error: null,
    }),
}));
