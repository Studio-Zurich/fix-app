/**
 * Logger utility that only logs when NEXT_PUBLIC_ENABLE_LOGGING is true
 */

// Check if logging is enabled
const isLoggingEnabled = process.env.NEXT_PUBLIC_ENABLE_LOGGING === "true";

/**
 * Log a message with optional data
 * @param message The message to log
 * @param data Optional data to log
 */
export function log(message: string, data?: unknown) {
  if (isLoggingEnabled) {
    if (data) {
      console.log(`[DEBUG] ${message}`, data);
    } else {
      console.log(`[DEBUG] ${message}`);
    }
  }
}

/**
 * Log an error with optional data
 * @param message The error message to log
 * @param error Optional error object to log
 */
export function logError(message: string, error?: unknown) {
  if (isLoggingEnabled) {
    if (error) {
      console.error(`[ERROR] ${message}`, error);
    } else {
      console.error(`[ERROR] ${message}`);
    }
  }
}

/**
 * Log a warning with optional data
 * @param message The warning message to log
 * @param data Optional data to log
 */
export function logWarning(message: string, data?: unknown) {
  if (isLoggingEnabled) {
    if (data) {
      console.warn(`[WARN] ${message}`, data);
    } else {
      console.warn(`[WARN] ${message}`);
    }
  }
}

/**
 * Log a success message with optional data
 * @param message The success message to log
 * @param data Optional data to log
 */
export function logSuccess(message: string, data?: unknown) {
  if (isLoggingEnabled) {
    if (data) {
      console.log(`[SUCCESS] ${message}`, data);
    } else {
      console.log(`[SUCCESS] ${message}`);
    }
  }
}
