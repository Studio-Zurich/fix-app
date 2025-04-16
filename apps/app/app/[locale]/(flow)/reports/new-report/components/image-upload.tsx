import { GEOLOCATION_CONSTANTS, IMAGE_CONSTANTS } from "@/lib/constants";
import { log, logError, logSuccess } from "@/lib/logger";
import { imageUploadSchema } from "@/lib/schemas";
import { reportStore } from "@/lib/store";
import { ExifData, ImageUploadProps } from "@/lib/types";
import { Button } from "@repo/ui/button";
import { TypographyParagraph } from "@repo/ui/text";
import imageCompression from "browser-image-compression";
import exifr from "exifr";
import Image from "next/image";
import { useEffect, useState } from "react";
import { z } from "zod";
import { uploadReportImage } from "../actions";
import StepContainer from "./step-container";

// Function to generate a unique filename
const generateUniqueFilename = (originalFilename: string): string => {
  const timestamp = new Date().getTime();
  const randomString = Math.random().toString(36).substring(2, 15);
  const fileExtension = originalFilename.split(".").pop();
  return `${timestamp}-${randomString}.${fileExtension}`;
};

// Function to get current location using browser geolocation API
const getLocation = async (): Promise<GeolocationCoordinates | null> => {
  try {
    const position = await new Promise<GeolocationPosition>(
      (resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: GEOLOCATION_CONSTANTS.ENABLE_HIGH_ACCURACY,
          timeout: GEOLOCATION_CONSTANTS.TIMEOUT,
          maximumAge: GEOLOCATION_CONSTANTS.MAXIMUM_AGE,
        });
      }
    );
    return position.coords;
  } catch (err) {
    // Don't log this as an error since it's expected behavior when geolocation is denied or unavailable
    log("Geolocation not available", { reason: String(err) });
    return null;
  }
};

// Function to get address from coordinates using reverse geocoding
const getAddressFromCoordinates = async (
  latitude: number,
  longitude: number
): Promise<string> => {
  try {
    // Use Nominatim OpenStreetMap API for reverse geocoding
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
      {
        headers: {
          "Accept-Language": "en", // Request English results
          "User-Agent": "Report-App", // Identify your application
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data && data.display_name) {
      return data.display_name;
    } else {
      return "Unknown location";
    }
  } catch (error) {
    logError("Error getting address from coordinates", error);
    return "Address lookup failed";
  }
};

// Function to read image location from EXIF data
const readImageLocation = async (
  file: File
): Promise<{ latitude: number; longitude: number } | null> => {
  try {
    const buffer = await file.arrayBuffer();
    const exif = await exifr.parse(buffer);

    if (exif?.latitude && exif?.longitude) {
      return {
        latitude: exif.latitude,
        longitude: exif.longitude,
      };
    }
    // This is normal behavior for images without location data
    log("No location data found in image");
    return null;
  } catch (error) {
    // Only log actual parsing errors as errors
    logError("Error parsing EXIF data", error);
    return null;
  }
};

const ImageUpload = ({ onImageSelected }: ImageUploadProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadedFilename, setUploadedFilename] = useState<string | null>(null);
  const [exifData, setExifData] = useState<ExifData | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [locationSource, setLocationSource] = useState<
    "image" | "browser" | "store" | null
  >(null);
  const [detectedLocation, setDetectedLocation] = useState<{
    latitude: number | null;
    longitude: number | null;
    address: string;
  }>({
    latitude: null,
    longitude: null,
    address: "",
  });
  const [previouslyUploaded, setPreviouslyUploaded] = useState(false);

  // Access store
  const storeImageUrl = reportStore((state) => state.image_step.imageUrl);
  const storeDetectedLocation = reportStore(
    (state) => state.image_step.detected_location
  );
  const setImageUrl = reportStore((state) => state.setImageUrl);
  const setReportDetectedLocation = reportStore(
    (state) => state.setDetectedLocation
  );
  const setStep = (step: number) => reportStore.setState({ step });

  // Check for existing data in store when component mounts
  useEffect(() => {
    if (storeImageUrl) {
      log("Found previously uploaded image in store", { url: storeImageUrl });
      setPreviouslyUploaded(true);

      // Extract filename from URL to display in UI
      const filename = storeImageUrl.split("/").pop() || "";
      setUploadedFilename(filename);

      // If we have location data in the store, use it
      if (
        storeDetectedLocation &&
        storeDetectedLocation.latitude !== null &&
        storeDetectedLocation.longitude !== null
      ) {
        log("Found location data in store", storeDetectedLocation);
        setDetectedLocation({
          latitude: storeDetectedLocation.latitude,
          longitude: storeDetectedLocation.longitude,
          address: storeDetectedLocation.address || "",
        });
        setLocationSource("store");
      }
    }
  }, [storeImageUrl, storeDetectedLocation]);

  // Fetch address when coordinates change (only if no address already)
  useEffect(() => {
    const fetchAddress = async () => {
      if (
        detectedLocation.latitude &&
        detectedLocation.longitude &&
        !detectedLocation.address
      ) {
        try {
          const address = await getAddressFromCoordinates(
            detectedLocation.latitude,
            detectedLocation.longitude
          );
          log("Address fetched", { address });
          setDetectedLocation((prev) => ({
            ...prev,
            address,
          }));
        } catch (error) {
          logError("Error fetching address", error);
        }
      }
    };

    fetchAddress();
  }, [
    detectedLocation.latitude,
    detectedLocation.longitude,
    detectedLocation.address,
  ]);

  // Check for location when file changes
  useEffect(() => {
    const checkLocation = async () => {
      if (selectedFile) {
        try {
          // Try to get location from image
          const location = await readImageLocation(selectedFile);
          if (location) {
            log("Location found in image", location);
            setExifData((prev) => ({ ...prev, ...location }));
            setDetectedLocation({
              latitude: location.latitude,
              longitude: location.longitude,
              address: "", // Will be populated by the address effect
            });
            setLocationSource("image");
          } else {
            // If no EXIF location, try to get current location
            const coords = await getLocation();
            if (coords) {
              log("Using browser location", {
                latitude: coords.latitude,
                longitude: coords.longitude,
              });
              setExifData((prev) => ({
                ...prev,
                latitude: coords.latitude,
                longitude: coords.longitude,
              }));
              setDetectedLocation({
                latitude: coords.latitude,
                longitude: coords.longitude,
                address: "", // Will be populated by the address effect
              });
              setLocationSource("browser");
            } else {
              log("No location available from image or browser");
              setLocationSource(null);
            }
          }
        } catch (error) {
          logError("Unexpected error checking location", error);
          setLocationSource(null);
        }
      }
    };

    checkLocation();
  }, [selectedFile]);

  // Cleanup preview URL when component unmounts or when file changes
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const validateFile = (file: File): string | null => {
    try {
      imageUploadSchema.parse({ image: file });
      return null;
    } catch (error) {
      if (error instanceof z.ZodError) {
        return error.errors[0].message;
      }
      return "Invalid file";
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validationResult = validateFile(file);
      if (validationResult) {
        setValidationError(validationResult);
        return;
      }

      setValidationError(null);
      log("File selected", {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
      });

      // Create preview URL for the selected file
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      const newPreviewUrl = URL.createObjectURL(file);
      setPreviewUrl(newPreviewUrl);

      // Reset previous image info
      setPreviouslyUploaded(false);
      setSelectedFile(file);

      // Extract general EXIF data for display
      try {
        const exif = await exifr.parse(file);
        if (exif) {
          log("EXIF data extracted", { exif });
          setExifData(exif);
        } else {
          log("No EXIF data found in image");
          setExifData(null);
        }
      } catch (error) {
        logError("Error extracting EXIF data", error);
        setExifData(null);
      }

      if (onImageSelected) {
        onImageSelected(file);
      }
    }
  };

  const handleNext = async () => {
    // If using previously uploaded image, just move to the next step
    if (previouslyUploaded && storeImageUrl) {
      log("Using previously uploaded image, skipping upload", {
        url: storeImageUrl,
      });
      setStep(1);
      return;
    }

    // If no image is selected, just move to the next step without uploading
    if (!selectedFile) {
      setStep(1);
      setImageUrl("");
      return;
    }

    try {
      setIsProcessing(true);
      log("Starting image processing", {
        fileName: selectedFile?.name || "unknown",
      });

      // Compress the image using browser-image-compression
      const compressedFile = await imageCompression(selectedFile!, {
        maxSizeMB: IMAGE_CONSTANTS.COMPRESSION.MAX_SIZE_MB,
        maxWidthOrHeight: IMAGE_CONSTANTS.COMPRESSION.MAX_WIDTH_OR_HEIGHT,
        useWebWorker: IMAGE_CONSTANTS.COMPRESSION.USE_WEB_WORKER,
      });

      log("Image compressed", {
        originalSize: selectedFile!.size,
        compressedSize: compressedFile.size,
        compressionRatio:
          ((compressedFile.size / selectedFile!.size) * 100).toFixed(2) + "%",
      });

      // Generate a unique filename
      const uniqueFilename = generateUniqueFilename(selectedFile!.name);
      log("Generated unique filename", { uniqueFilename });

      // Create a new File object with the unique filename
      const fileWithUniqueName = new File([compressedFile], uniqueFilename, {
        type: compressedFile.type,
      });

      // Create FormData and append the compressed file with unique name
      const formData = new FormData();
      formData.append("image", fileWithUniqueName);

      // Call the server action to upload the image
      const result = await uploadReportImage(formData);

      if (result.filename && result.url) {
        logSuccess("Image uploaded successfully", {
          filename: result.filename,
        });
        setUploadedFilename(result.filename);

        // Save the detected location to the report store if available
        if (
          detectedLocation.latitude !== null &&
          detectedLocation.longitude !== null
        ) {
          log("Saving detected location to report store", detectedLocation);
          setReportDetectedLocation({
            latitude: detectedLocation.latitude,
            longitude: detectedLocation.longitude,
            address:
              detectedLocation.address ||
              (locationSource === "image"
                ? "Location from image"
                : "Current location"),
          });
        }

        // Update the store with the image URL and move to next step
        setImageUrl(result.url);
        setStep(1);
      } else if (result.error) {
        logError("Image upload failed", result.error);
        setValidationError(result.error);
      }
    } catch (error) {
      logError("Error processing image", error);
      setValidationError("Error processing image");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setExifData(null);
    setLocationSource(null);
    setDetectedLocation({
      latitude: null,
      longitude: null,
      address: "",
    });
  };

  return (
    <StepContainer
      title="Upload Image"
      description="Upload an image to help us understand the incident better."
      nextButton={
        <Button type="button" onClick={handleNext} disabled={isProcessing}>
          {isProcessing
            ? "Processing..."
            : previouslyUploaded || selectedFile
              ? "Continue"
              : "Skip Upload"}
        </Button>
      }
    >
      <div className="grid gap-2 mb-4">
        {/* Camera input with capture attribute for direct camera access */}
        <div>
          <input
            type="file"
            onChange={handleFileChange}
            accept={IMAGE_CONSTANTS.ALLOWED_TYPES.join(",")}
            capture="environment"
            className="hidden"
            id="camera-input"
          />
          <Button asChild className="w-full">
            <label htmlFor="camera-input" className="cursor-pointer w-full">
              {previouslyUploaded ? "Take New Photo" : "Take Photo"}
            </label>
          </Button>
        </div>

        {/* Library input without capture attribute for gallery access */}
        <div>
          <input
            type="file"
            onChange={handleFileChange}
            accept={IMAGE_CONSTANTS.ALLOWED_TYPES.join(",")}
            className="hidden"
            id="library-input"
          />
          <Button asChild className="w-full" variant="outline">
            <label htmlFor="library-input" className="cursor-pointer w-full">
              Choose from library
            </label>
          </Button>
        </div>
      </div>

      {/* Validation error message */}
      {validationError && (
        <div className="mt-2 text-red-500 text-sm">{validationError}</div>
      )}

      {/* Display previously uploaded image */}
      {previouslyUploaded && storeImageUrl && !selectedFile && (
        <div className="relative aspect-video w-full">
          <Image
            src={storeImageUrl}
            alt="Uploaded image"
            fill
            className="object-contain rounded-md"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      )}

      {/* Display selected file if any */}
      {selectedFile && previewUrl && (
        <>
          <div className="flex items-center justify-between mb-2">
            <TypographyParagraph size="text-sm">
              1 file selected
            </TypographyParagraph>
            <button
              onClick={handleRemoveFile}
              className="text-muted-foreground text-sm"
            >
              Clear all
            </button>
          </div>

          <div className="relative">
            <div className="relative aspect-square w-full mb-2">
              <Image
                src={previewUrl}
                alt="Selected image preview"
                fill
                className="object-cover rounded-md"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <button
                onClick={handleRemoveFile}
                className="absolute top-2 right-2 w-8 h-8 bg-black bg-opacity-50 rounded-full flex items-center justify-center hover:bg-opacity-70 transition-colors"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <TypographyParagraph
              size="text-xs"
              className="text-muted-foreground"
            >
              {selectedFile.name}
              <br />({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
            </TypographyParagraph>
          </div>
        </>
      )}

      {/* Debug metadata section */}
      {process.env.NEXT_PUBLIC_ENABLE_LOGGING === "true" && (
        <>
          {exifData && (
            <div className="mt-4 p-4 border rounded-md bg-gray-50">
              <h3 className="text-lg font-medium mb-2">Image Metadata</h3>

              {exifData.latitude && exifData.longitude ? (
                <div className="mb-2">
                  <h4 className="font-medium">Location:</h4>
                  <p>Latitude: {exifData.latitude}</p>
                  <p>Longitude: {exifData.longitude}</p>
                  {locationSource === "browser" && (
                    <p className="text-sm">(from browser location)</p>
                  )}
                  {detectedLocation.address && (
                    <p className="text-sm mt-1">
                      Address: {detectedLocation.address}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-gray-500">No location data found in image</p>
              )}

              {exifData.DateTimeOriginal && (
                <div className="mb-2">
                  <h4 className="font-medium">Date Taken:</h4>
                  <p>{new Date(exifData.DateTimeOriginal).toLocaleString()}</p>
                </div>
              )}

              {exifData.Make && (
                <div className="mb-2">
                  <h4 className="font-medium">Camera:</h4>
                  <p>
                    {exifData.Make} {exifData.Model}
                  </p>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Hidden input to pass the filename to the form submission */}
      {uploadedFilename && (
        <input type="hidden" name="image-filename" value={uploadedFilename} />
      )}
    </StepContainer>
  );
};

export default ImageUpload;
