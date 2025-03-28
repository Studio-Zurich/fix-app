// File upload constants
export const FILE_CONSTANTS = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ["image/jpeg", "image/png", "image/gif"] as const,
  ALLOWED_EXTENSIONS: ["jpg", "jpeg", "png", "gif"] as const,
  STORAGE_BUCKET: "report-images" as const,
};

// Map related constants
export const MAP_CONSTANTS = {
  MIN_SEARCH_LENGTH: 3,
  DEFAULT_ZOOM: 15,
  FLY_TO_DURATION: 2000,
  GEOLOCATION_OPTIONS: {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0,
  },
} as const;

// Default location
export const DEFAULT_LOCATION = {
  latitude: 47.1661,
  longitude: 8.5159,
  zoom: 13,
  address: "Postplatz, 6300 Zug, Switzerland",
} as const;

// Email constants
export const EMAIL_CONSTANTS = {
  FROM_ADDRESS: "notifications@fixapp.ch" as const,
  TO_ADDRESS: "reports@fixapp.ch" as const,
  BCC_ADDRESSES: ["hello@studio-zurich.ch"],
};
