import { StepHeaderProps } from "@/lib/types";
import { TypographyH2 } from "@repo/ui/headline";
import { TypographyParagraph } from "@repo/ui/text";

const StepHeader = ({ step, description }: StepHeaderProps) => {
  return (
    <div>
      <TypographyH2 className="font">{step}</TypographyH2>
      <TypographyParagraph>{description}</TypographyParagraph>
    </div>
  );
};

export default StepHeader;
