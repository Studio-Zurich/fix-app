// File upload constants
export const FILE_CONSTANTS = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ["image/jpeg", "image/png", "image/gif"] as const,
  ALLOWED_EXTENSIONS: ["jpg", "jpeg", "png", "gif"] as const,
  STORAGE_BUCKET: "report-images" as const,
};

// Email constants
export const EMAIL_CONSTANTS = {
  FROM_ADDRESS: "notifications@fixapp.ch" as const,
  TO_ADDRESS: "hello@studio-zurich.ch" as const,
};
