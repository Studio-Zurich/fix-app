import { Button } from "@repo/ui/button";
import StepContainer from "./step-container";

const ImageUpload = () => {
  return (
    <StepContainer>
      <input type="file" />
      <Button type="button">Next</Button>
    </StepContainer>
  );
};

export default ImageUpload;
