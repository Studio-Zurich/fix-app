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
  // Swiss boundaries (bounding box)
  SWITZERLAND_BOUNDS: {
    minLat: 45.8,
    maxLat: 47.8,
    minLng: 5.9,
    maxLng: 10.5,
  },
  // Error message for locations outside Switzerland
  OUTSIDE_SWITZERLAND_ERROR: "Location must be within Switzerland",
} as const;

// Default location
export const DEFAULT_LOCATION = {
  latitude: 47.1661,
  longitude: 8.5159,
  zoom: 13,
  address: "Postplatz, 6300 Zug, Switzerland",
} as const;

// Image upload constants
export const IMAGE_CONSTANTS = {
  MAX_SIZE_MB: 15,
  COMPRESSION: {
    MAX_SIZE_MB: 1,
    MAX_WIDTH_OR_HEIGHT: 1920,
    USE_WEB_WORKER: true,
  },
  ALLOWED_TYPES: ["image/jpeg", "image/png", "image/gif", "image/webp"],
  FILE_TYPE_ERROR: "Only JPG, PNG, GIF, and WEBP images are allowed",
  FILE_SIZE_ERROR: "Image must be smaller than 15MB",
} as const;

// Geolocation constants
export const GEOLOCATION_CONSTANTS = {
  ENABLE_HIGH_ACCURACY: true,
  TIMEOUT: 5000,
  MAXIMUM_AGE: 0,
} as const;
