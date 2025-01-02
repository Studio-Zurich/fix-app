import { TypographyH2 } from "@repo/ui/headline";
import { TypographyParagraph } from "@repo/ui/text";

const StepHeader = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => {
  return (
    <div className="px-5 pt-6 pb-4 space-y-2 bg-transparent min-h-[120px]">
      <TypographyH2 weight="medium">{title}</TypographyH2>
      <TypographyParagraph className="text-muted-foreground">
        {description}
      </TypographyParagraph>
    </div>
  );
};

export default StepHeader;
