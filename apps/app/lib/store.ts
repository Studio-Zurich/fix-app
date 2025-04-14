import { create } from "zustand";

interface LocationState {
  detectedLocation: {
    latitude: number | null;
    longitude: number | null;
  };
  setDetectedLocation: (latitude: number, longitude: number) => void;
  clearDetectedLocation: () => void;
}

interface ReportState {
  step: number;
  imageUrl: string | null;
  reporter_first_name: string;
  reporter_last_name: string;
  reporter_email: string;
  reporter_phone: string;
  setImageUrl: (url: string) => void;
  setUserData: (userData: {
    reporter_first_name?: string;
    reporter_last_name?: string;
    reporter_email?: string;
    reporter_phone?: string;
  }) => void;
}

export const useLocationStore = create<LocationState>((set) => ({
  detectedLocation: {
    latitude: null,
    longitude: null,
  },
  setDetectedLocation: (latitude, longitude) =>
    set({ detectedLocation: { latitude, longitude } }),
  clearDetectedLocation: () =>
    set({ detectedLocation: { latitude: null, longitude: null } }),
}));

export const reportStore = create<ReportState>((set) => ({
  step: 0,
  imageUrl: null,
  reporter_first_name: "",
  reporter_last_name: "",
  reporter_email: "",
  reporter_phone: "",
  setImageUrl: (url) => set({ imageUrl: url }),
  setUserData: (userData) => set((state) => ({ ...state, ...userData })),
}));
