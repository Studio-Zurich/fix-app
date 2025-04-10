import { Button } from "@repo/ui/button";
import StepContainer from "./step-container";

interface ImageUploadProps {
  onImageSelected?: (file: File) => void;
}

const ImageUpload = ({ onImageSelected }: ImageUploadProps) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImageSelected) {
      onImageSelected(file);
    }
  };

  return (
    <StepContainer>
      <input type="file" onChange={handleFileChange} />
      <Button type="button">Next</Button>
    </StepContainer>
  );
};

export default ImageUpload;
