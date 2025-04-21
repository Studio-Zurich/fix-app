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
  isSubmitted: boolean;

  // Step 1: Image Upload
  image_step: {
    imageUrl: string | null;
    detected_location: {
      latitude: number | null;
      longitude: number | null;
      address: string;
    };
  };

  // Step 2: User Information
  user_step: {
    reporter_first_name: string;
    reporter_last_name: string;
    reporter_email: string;
    reporter_phone: string;
  };

  // Step 3: Incident Information
  incident_step: {
    incident_type_id: string;
    incident_type_name: string;
    incident_subtype_id: string;
    incident_subtype_name: string;
    description: string;
  };

  // Step 4: Location Information
  location_step: {
    set_location: {
      latitude: number | null;
      longitude: number | null;
      address: string;
    };
    hasUsedAlertDialog: boolean;
  };

  // Actions
  setIsSubmitted: (isSubmitted: boolean) => void;
  setImageUrl: (url: string) => void;
  setDetectedLocation: (location: {
    latitude: number;
    longitude: number;
    address?: string;
  }) => void;
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
  resetReport: () => void;
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

// Initial state for the report store
const initialReportState = {
  step: 0,
  isSubmitted: false,

  image_step: {
    imageUrl: null,
    detected_location: {
      latitude: null,
      longitude: null,
      address: "",
    },
  },

  user_step: {
    reporter_first_name: "",
    reporter_last_name: "",
    reporter_email: "",
    reporter_phone: "",
  },

  incident_step: {
    incident_type_id: "",
    incident_type_name: "",
    incident_subtype_id: "",
    incident_subtype_name: "",
    description: "",
  },

  location_step: {
    set_location: {
      latitude: null,
      longitude: null,
      address: "",
    },
    hasUsedAlertDialog: false,
  },
};

export const reportStore = create<ReportState>((set) => ({
  ...initialReportState,

  // Actions
  setIsSubmitted: (isSubmitted: boolean) =>
    set((state) => ({
      ...state,
      isSubmitted,
    })),

  setImageUrl: (url: string) =>
    set((state) => ({
      image_step: {
        ...state.image_step,
        imageUrl: url,
      },
    })),

  setDetectedLocation: (location: {
    latitude: number;
    longitude: number;
    address?: string;
  }) =>
    set((state) => ({
      image_step: {
        ...state.image_step,
        detected_location: {
          latitude: location.latitude,
          longitude: location.longitude,
          address: location.address || "",
        },
      },
    })),

  setUserData: (userData: {
    reporter_first_name?: string;
    reporter_last_name?: string;
    reporter_email?: string;
    reporter_phone?: string;
  }) =>
    set((state) => ({
      user_step: {
        ...state.user_step,
        ...userData,
      },
    })),

  setIncidentType: (incidentType: { id: string; name: string }) =>
    set((state) => ({
      incident_step: {
        ...state.incident_step,
        incident_type_id: incidentType.id,
        incident_type_name: incidentType.name,
      },
    })),

  setIncidentSubtype: (incidentSubtype: { id: string; name: string }) =>
    set((state) => ({
      incident_step: {
        ...state.incident_step,
        incident_subtype_id: incidentSubtype.id,
        incident_subtype_name: incidentSubtype.name,
      },
    })),

  setDescription: (description: string) =>
    set((state) => ({
      incident_step: {
        ...state.incident_step,
        description,
      },
    })),

  setLocation: (location: { lat: number; lng: number; address: string }) =>
    set((state) => ({
      location_step: {
        ...state.location_step,
        set_location: {
          latitude: location.lat,
          longitude: location.lng,
          address: location.address,
        },
      },
    })),

  // Reset function to clear all report data
  resetReport: () => set(initialReportState),
}));
