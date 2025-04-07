import { Button } from "@repo/ui/button";
import ImageUpload from "./image-upload";

const ReportFlow = () => {
  return (
    <div>
      ReportFlow
      <form>
        <ImageUpload />
        <Button type="submit">Submit</Button>
      </form>
    </div>
  );
};

export default ReportFlow;
