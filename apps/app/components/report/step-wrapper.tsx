import { useReportStore } from "@/lib/store";
import { ReactNode } from "react";

interface StepWrapperProps {
  steps: ReactNode[];
}

export const StepWrapper = ({ steps }: StepWrapperProps) => {
  const { currentStep, setCurrentStep } = useReportStore();

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isConfirmStep = currentStep === steps.length - 1;
  const isSummaryStep = currentStep === steps.length - 2;

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex justify-between">
          {steps.map((_, index) => (
            <div key={index} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  index === currentStep
                    ? "bg-blue-600 text-white"
                    : index < currentStep
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 text-gray-600"
                }`}
              >
                {index + 1}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-20 h-1 ${
                    index < currentStep ? "bg-green-500" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Current step content */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="mb-6">{steps[currentStep]}</div>

        {/* Navigation buttons - hidden in confirm step */}
        {!isConfirmStep && (
          <div className="flex justify-between mt-8">
            <button
              onClick={handleBack}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              disabled={currentStep === 0}
            >
              Back
            </button>

            {!isSummaryStep && (
              <button
                onClick={handleNext}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Next
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
