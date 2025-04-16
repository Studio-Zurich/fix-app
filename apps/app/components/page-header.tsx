import { TypographyH1 } from "@repo/ui/headline";
import { TypographyParagraph } from "@repo/ui/text";

interface PageHeaderProps {
  title: string;
  description: string;
}

const PageHeader = ({ title, description }: PageHeaderProps) => {
  return (
    <section className="space-y-2">
      <TypographyH1>{title}</TypographyH1>
      <TypographyParagraph className="text-muted-foreground">
        {description}
      </TypographyParagraph>
    </section>
  );
};

export default PageHeader;
