import { create } from "zustand";

interface LocationState {
  detectedLocation: {
    latitude: number | null;
    longitude: number | null;
  };
  setDetectedLocation: (latitude: number, longitude: number) => void;
  clearDetectedLocation: () => void;
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
