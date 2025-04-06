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
  error: string | null;

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
  setError: (error: string | null) => void;
  setLocationSubmitted: (submitted: boolean) => void;
  setHasInteractedWithMap: (hasInteracted: boolean) => void;

  // Form Actions
  resetForm: () => void;
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

  // Form Actions
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
    }),
}));
