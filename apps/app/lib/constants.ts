// File upload constants
export const FILE_CONSTANTS = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ["image/jpeg", "image/png", "image/gif"] as const,
  ALLOWED_EXTENSIONS: ["jpg", "jpeg", "png", "gif"] as const,
  STORAGE_BUCKET: "report-images" as const,
};

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
