import { Button } from "@repo/ui/button";
import imageCompression from "browser-image-compression";
import { useState } from "react";
import { uploadReportImage } from "../actions";
import StepContainer from "./step-container";

interface ImageUploadProps {
  onImageSelected?: (file: File) => void;
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (onImageSelected) {
        onImageSelected(file);
      }
    }
  };

  const handleNext = async () => {
    if (!selectedFile) return;

    try {
      setIsProcessing(true);

      // Compress the image using browser-image-compression
      const compressedFile = await imageCompression(selectedFile, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      });

      // Generate a unique filename
      const uniqueFilename = generateUniqueFilename(selectedFile.name);

      // Create a new File object with the unique filename
      const fileWithUniqueName = new File([compressedFile], uniqueFilename, {
        type: compressedFile.type,
      });

      // Create FormData and append the compressed file with unique name
      const formData = new FormData();
      formData.append("image", fileWithUniqueName);

      // Call the server action to upload the image
      await uploadReportImage(formData);
    } catch (error) {
      console.error("Error processing image:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <StepContainer>
      <input
        type="file"
        onChange={handleFileChange}
        accept="image/*"
        className="mb-4"
      />
      <Button
        type="button"
        onClick={handleNext}
        disabled={!selectedFile || isProcessing}
      >
        {isProcessing ? "Processing..." : "Next"}
      </Button>
    </StepContainer>
  );
};

export default ImageUpload;
