import { Button } from "@repo/ui/button";
import { useState } from "react";
import { uploadReportImage } from "../actions";
import StepContainer from "./step-container";

interface ImageUploadProps {
  onImageSelected?: (file: File) => void;
}

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

      // Create FormData and append the file
      const formData = new FormData();
      formData.append("image", selectedFile);

      // Call the server action to process and upload the image
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
