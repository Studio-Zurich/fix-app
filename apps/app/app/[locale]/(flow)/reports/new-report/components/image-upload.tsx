import { log, logError, logSuccess } from "@/lib/logger";
import { reportStore, useLocationStore } from "@/lib/store";
import { Button } from "@repo/ui/button";
import imageCompression from "browser-image-compression";
import exifr from "exifr";
import { useState } from "react";
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

const ImageUpload = ({ onImageSelected }: ImageUploadProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedFilename, setUploadedFilename] = useState<string | null>(null);
  const [exifData, setExifData] = useState<ExifData | null>(null);
  const setDetectedLocation = useLocationStore(
    (state) => state.setDetectedLocation
  );

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      log("File selected", {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
      });
      setSelectedFile(file);

      // Extract EXIF data
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

      // Save location data to store if available
      if (exifData?.latitude && exifData?.longitude) {
        log("Saving detected location data to store", {
          latitude: exifData.latitude,
          longitude: exifData.longitude,
        });
        setDetectedLocation(exifData.latitude, exifData.longitude);
      }

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
      <input
        type="file"
        onChange={handleFileChange}
        accept="image/*"
        className="mb-4"
      />

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
