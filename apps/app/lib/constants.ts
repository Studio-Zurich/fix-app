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
