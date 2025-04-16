import { WarningCircle } from "@phosphor-icons/react";
import { Alert, AlertDescription, AlertTitle } from "@repo/ui/alert";

const StepContainer = ({
  children,
  prevButton,
  nextButton,
}: {
  children: React.ReactNode;
  prevButton?: React.ReactNode;
  nextButton: React.ReactNode;
}) => {
  return (
    <div className="flex-1 bg-blue-400 pb-[66px]">
      <Alert variant="destructive">
        <WarningCircle size={20} />
        <AlertTitle>Heads up!</AlertTitle>
        <AlertDescription>
          You can add components and dependencies to your app using the cli.
        </AlertDescription>
      </Alert>

      {children}
      <div className="fixed bottom-0 w-full bg-pink-400 h-min">
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
