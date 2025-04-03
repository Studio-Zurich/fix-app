import { submitReport } from "@/app/[locale]/reports/new-report/actions";
import { create } from "zustand";
import {
  IncidentSubtypeType,
  IncidentTypeType,
  Location,
  ReportDescription,
  ReportError,
  UserData,
} from "./types";

interface ReportStore {
  // Form Data
  files: File[];
  location: Location | null;
  detectedLocation: Location | null; // Location from image
  selectedType: IncidentTypeType | undefined;
  selectedSubtype: IncidentSubtypeType | undefined;
  description: ReportDescription | undefined;
  userData: UserData | undefined;
  locationSubmitted: boolean;
  hasInteractedWithMap: boolean;

  // UI State
  currentStep: number;
  uploading: boolean;
  error: ReportError | null;
  lastAttemptTimestamp: string | null;

  // Actions
  setFiles: (files: File[]) => void;
  setLocation: (location: Location | null) => void;
  setDetectedLocation: (location: Location | null) => void;
  setSelectedType: (type: IncidentTypeType) => void;
  setSelectedSubtype: (subtype: IncidentSubtypeType) => void;
  setDescription: (description: ReportDescription) => void;
  setUserData: (data: UserData) => void;
  setCurrentStep: (step: number) => void;
  setUploading: (uploading: boolean) => void;
  setError: (error: ReportError | null) => void;
  setLocationSubmitted: (submitted: boolean) => void;
  setHasInteractedWithMap: (hasInteracted: boolean) => void;

  // Form Actions
  submitReport: (locale: "de" | "en") => Promise<void>;
  resetForm: () => void;
  handleError: (error: ReportError) => void;
}

export const useReportStore = create<ReportStore>((set, get) => ({
  // Initial state
  files: [],
  location: null,
  detectedLocation: null,
  selectedType: undefined,
  selectedSubtype: undefined,
  description: undefined,
  userData: undefined,
  locationSubmitted: false,
  hasInteractedWithMap: false,
  currentStep: 1,
  uploading: false,
  error: null,
  lastAttemptTimestamp: null,

  // Actions
  setFiles: (files) => set({ files }),
  setLocation: (location) => set({ location }),
  setDetectedLocation: (location) => set({ detectedLocation: location }),
  setSelectedType: (type) =>
    set({ selectedType: type, selectedSubtype: undefined }),
  setSelectedSubtype: (subtype) => set({ selectedSubtype: subtype }),
  setDescription: (description) => set({ description }),
  setUserData: (userData) => set({ userData }),
  setCurrentStep: (step) => set({ currentStep: step }),
  setUploading: (uploading) => set({ uploading }),
  setError: (error) => set({ error }),
  setLocationSubmitted: (submitted) => set({ locationSubmitted: submitted }),
  setHasInteractedWithMap: (hasInteracted) =>
    set({ hasInteractedWithMap: hasInteracted }),

  handleError: (error) => {
    const timestamp = new Date().toISOString();
    set({
      error,
      uploading: false,
      lastAttemptTimestamp: timestamp,
    });
    console.error("Report submission error:", {
      ...error,
      timestamp,
      files: get().files.length,
      step: error.details?.step || "unknown",
    });
  },

  // Form Actions
  submitReport: async (locale) => {
    const state = get();
    if (!state.location || !state.selectedType || !state.userData) {
      state.handleError({
        code: "VALIDATION_ERROR",
        message: "Missing required fields",
        details: {
          step: "validation",
          technicalMessage: "One or more required fields are missing",
          timestamp: new Date().toISOString(),
        },
      });
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
      if (!result || !result.success) {
        state.handleError(
          result?.error || {
            code: "UNKNOWN_ERROR",
            message: "Failed to submit report",
            details: {
              step: "submission",
              technicalMessage: result
                ? "Submission failed"
                : "No response from server",
              timestamp: new Date().toISOString(),
            },
          }
        );
        return;
      }

      // Reset form after successful upload
      get().resetForm();
      set({ currentStep: 8 }); // Move to success step
    } catch (err) {
      state.handleError({
        code: "SUBMISSION_ERROR",
        message: "Failed to submit report",
        details: {
          step: "submission",
          technicalMessage: err instanceof Error ? err.message : String(err),
          timestamp: new Date().toISOString(),
        },
      });
    } finally {
      set({ uploading: false });
    }
  },

  resetForm: () =>
    set({
      files: [],
      location: null,
      detectedLocation: null,
      selectedType: undefined,
      selectedSubtype: undefined,
      description: undefined,
      userData: undefined,
      locationSubmitted: false,
      hasInteractedWithMap: false,
      currentStep: 1,
      uploading: false,
      error: null,
      lastAttemptTimestamp: null,
    }),
}));
