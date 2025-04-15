import { log, logError, logSuccess } from "@/lib/logger";
import { reportStore, useLocationStore } from "@/lib/store";
import { Button } from "@repo/ui/button";
import imageCompression from "browser-image-compression";
import exifr from "exifr";
import { useEffect, useState } from "react";
import { uploadReportImage } from "../actions";
import StepContainer from "./step-container";
interface ImageUploadProps {
  onImageSelected?: (file: File) => void;
}

// Interface for EXIF data
interface ExifData {
  latitude?: number;
  longitude?: number;
  DateTimeOriginal?: string;
  Make?: string;
  Model?: string;
  [key: string]: string | number | undefined; // For other potential EXIF properties
}

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
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        });
      }
    );
    return position.coords;
  } catch (err) {
    logError("Error getting location", { error: String(err) });
    return null;
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
    return null;
  } catch (error) {
    logError("Error reading image location", error);
    return null;
  }
};

const ImageUpload = ({ onImageSelected }: ImageUploadProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedFilename, setUploadedFilename] = useState<string | null>(null);
  const [exifData, setExifData] = useState<ExifData | null>(null);
  const setDetectedLocation = useLocationStore(
    (state) => state.setDetectedLocation
  );

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
            setDetectedLocation(location.latitude, location.longitude);
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
                source: "browser",
              }));
              setDetectedLocation(coords.latitude, coords.longitude);
            }
          }
        } catch (error) {
          logError("Error checking location", error);
        }
      }
    };

    checkLocation();
  }, [selectedFile, setDetectedLocation]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      log("File selected", {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
      });
      setSelectedFile(file);

      // Extract general EXIF data for display
      try {
        const exif = await exifr.parse(file);
        log("EXIF data extracted", { exif });
        setExifData(exif);
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
    // If no image is selected, just move to the next step without uploading
    if (!selectedFile) {
      reportStore.setState({
        step: 1,
        imageUrl: null, // Make sure imageUrl is explicitly null when skipping
      });
      return;
    }

    try {
      setIsProcessing(true);
      log("Starting image processing", { fileName: selectedFile.name });

      // Compress the image using browser-image-compression
      const compressedFile = await imageCompression(selectedFile, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      });

      log("Image compressed", {
        originalSize: selectedFile.size,
        compressedSize: compressedFile.size,
        compressionRatio:
          ((compressedFile.size / selectedFile.size) * 100).toFixed(2) + "%",
      });

      // Generate a unique filename
      const uniqueFilename = generateUniqueFilename(selectedFile.name);
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

      if (result.filename) {
        logSuccess("Image uploaded successfully", {
          filename: result.filename,
        });
        setUploadedFilename(result.filename);

        // Use a direct update to avoid potential rerender issues
        reportStore.setState({
          step: 1,
          imageUrl: result.url,
        });
      } else if (result.error) {
        logError("Image upload failed", result.error);
      }
    } catch (error) {
      logError("Error processing image", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <StepContainer
      nextButton={
        <Button type="button" onClick={handleNext} disabled={isProcessing}>
          {isProcessing
            ? "Processing..."
            : selectedFile
              ? "Verify"
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
            accept="image/*"
            capture="environment"
            className="hidden"
            id="camera-input"
          />
          <Button asChild className="w-full">
            <label htmlFor="camera-input" className="cursor-pointer w-full">
              Take Photo
            </label>
          </Button>
        </div>

        {/* Library input without capture attribute for gallery access */}
        <div>
          <input
            type="file"
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
            id="library-input"
          />
          <Button asChild className="w-full" variant="outline">
            <label htmlFor="library-input" className="cursor-pointer w-full">
              Choose from Library
            </label>
          </Button>
        </div>
      </div>

      {/* Display selected file if any */}
      {selectedFile && (
        <div className="mt-4 p-4 border rounded-md bg-gray-50">
          <h3 className="text-lg font-medium mb-2">Selected Image</h3>
          <p>
            {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)}{" "}
            MB)
          </p>
        </div>
      )}

      {/* Display EXIF metadata */}
      {/* DELETE LATER IN PRODUCTION */}
      {exifData && (
        <div className="mt-4 p-4 border rounded-md bg-gray-50">
          <h3 className="text-lg font-medium mb-2">Image Metadata</h3>

          {exifData.latitude && exifData.longitude ? (
            <div className="mb-2">
              <h4 className="font-medium">Location:</h4>
              <p>Latitude: {exifData.latitude}</p>
              <p>Longitude: {exifData.longitude}</p>
              {exifData.source === "browser" && (
                <p className="text-sm">(from browser location)</p>
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

      {/* Hidden input to pass the filename to the form submission */}
      {uploadedFilename && (
        <input type="hidden" name="image-filename" value={uploadedFilename} />
      )}
    </StepContainer>
  );
};

export default ImageUpload;
