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
  incident_type_id: string;
  incident_type_name: string;
  incident_subtype_id: string;
  incident_subtype_name: string;
  description: string;
  location_lat: number | null;
  location_lng: number | null;
  location_address: string;
  setImageUrl: (url: string) => void;
  setUserData: (userData: {
    reporter_first_name?: string;
    reporter_last_name?: string;
    reporter_email?: string;
    reporter_phone?: string;
  }) => void;
  setIncidentType: (incidentType: { id: string; name: string }) => void;
  setIncidentSubtype: (incidentSubtype: { id: string; name: string }) => void;
  setDescription: (description: string) => void;
  setLocation: (location: {
    lat: number;
    lng: number;
    address: string;
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
  incident_type_id: "",
  incident_type_name: "",
  incident_subtype_id: "",
  incident_subtype_name: "",
  description: "",
  location_lat: null,
  location_lng: null,
  location_address: "",
  setImageUrl: (url) => set({ imageUrl: url }),
  setUserData: (userData) => set((state) => ({ ...state, ...userData })),
  setIncidentType: (incidentType) =>
    set({
      incident_type_id: incidentType.id,
      incident_type_name: incidentType.name,
    }),
  setIncidentSubtype: (incidentSubtype) =>
    set({
      incident_subtype_id: incidentSubtype.id,
      incident_subtype_name: incidentSubtype.name,
    }),
  setDescription: (description) => set({ description }),
  setLocation: (location) =>
    set({
      location_lat: location.lat,
      location_lng: location.lng,
      location_address: location.address,
    }),
}));
