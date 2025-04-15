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
