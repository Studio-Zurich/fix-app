import { WarningCircle } from "@phosphor-icons/react";
import { Alert, AlertDescription, AlertTitle } from "@repo/ui/alert";
import { TypographyH2 } from "@repo/ui/headline";
import { cn } from "@repo/ui/lib/utils";
import { TypographyParagraph } from "@repo/ui/text";

const StepContainer = ({
  children,
  prevButton,
  nextButton,
  error,
  title,
  description,
  className,
  hideHeader = false,
}: {
  children: React.ReactNode;
  prevButton?: React.ReactNode;
  nextButton: React.ReactNode;
  error?: string;
  title: string;
  description: string;
  className?: string;
  hideHeader?: boolean;
}) => {
  return (
    <div
      className={cn(
        "flex-1 bg-blue-400 pb-[66px] relative space-y-8",
        hideHeader ? "" : "px-[5vw] lg:px-6",
        className
      )}
    >
      {!hideHeader && (
        <>
          <div className="space-y-2 mt-4">
            <TypographyH2>{title}</TypographyH2>
            <TypographyParagraph className="text-muted-foreground">
              {description}
            </TypographyParagraph>
          </div>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <WarningCircle size={20} />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </>
      )}

      {children}
      <div className="fixed bottom-0 left-0 w-full bg-pink-400 h-min">
        <div
          className={`px-[5vw] md:px-6 py-2 flex items-center ${
            prevButton && nextButton ? "justify-between" : "justify-end"
          }`}
        >
          {prevButton}
          {nextButton}
        </div>
      </div>
    </div>
  );
};

export default StepContainer;
