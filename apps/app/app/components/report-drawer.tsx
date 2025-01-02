"use client";

import { submitReport } from "@/app/[locale]/actions";
import { useReportStore } from "@/lib/store";
import { ReportData } from "@/lib/types";
import { Button } from "@repo/ui/button";
import { Sheet, SheetContent } from "@repo/ui/sheet";
import { useState } from "react";
import ConfirmStep from "./confirm-step";
import ImageStep from "./image-step";
import IncidentDescriptionStep from "./incident-description-step";
import IncidentTypeStep from "./incident-type-step";
import LocationStep from "./location-step";
import SummaryStep from "./summary-step";
import UserDataStep from "./user-data-step";

const steps = [
  { id: 0, component: <ImageStep /> },
  { id: 1, component: <LocationStep /> },
  { id: 2, component: <IncidentTypeStep /> },
  { id: 3, component: <IncidentDescriptionStep /> },
  { id: 4, component: <UserDataStep /> },
  { id: 5, component: <SummaryStep /> },
  { id: 6, component: <ConfirmStep /> },
];

interface ReportDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ReportDrawer({
  open,
  onOpenChange,
}: ReportDrawerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const currentStep = useReportStore((state) => state.currentStep);
  const stepValidation = useReportStore((state) => state.stepValidation);
  const setCurrentStep = useReportStore((state) => state.setCurrentStep);
  const reportData = useReportStore((state) => state.reportData);
  const location = useReportStore((state) => state.location);

  const isNextEnabled = () => {
    switch (currentStep) {
      case 0: // Image step - always enabled since images are optional
        return true;
      case 1: // Location step
        return stepValidation.location === true;
      case 2: // Incident type step
        return stepValidation.incidentType === true;
      case 3: // Description step - always enabled since description is optional
        return true;
      case 4: // User data step
        return stepValidation.userData === true;
      case 5: // Summary step
        return !isSubmitting;
      default:
        return false;
    }
  };

  const handleNext = async () => {
    if (currentStep === 5) {
      // Validate required fields before submission
      if (!location || !reportData.incidentTypeId) {
        console.error("Missing required fields");
        return;
      }

      setIsSubmitting(true);
      try {
        const result = await submitReport({
          ...reportData,
          location,
          images: reportData.images || [],
          incidentTypeId: reportData.incidentTypeId,
        } as ReportData); // Type assertion here is safe because we validated required fields

        if (!result.success) {
          throw new Error(result.error || "Failed to submit report");
        }

        setCurrentStep(6);
      } catch (error) {
        console.error("Error submitting report:", error);
      } finally {
        setIsSubmitting(false);
      }
    } else if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Reset the flow when closing
      setCurrentStep(0);
      useReportStore.getState().reset();
    }
    onOpenChange(open);
  };

  const isLastStep = currentStep === steps.length - 1;
  const isConfirmStep = currentStep === 6;

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="bottom" className="h-[90%] p-0 pt-16 pb-8">
        <div className="flex flex-col h-full relative px-5">
          {/* <button
            onClick={() => handleOpenChange(false)}
            className="absolute z-10 right-5 top-4 bg-background rounded"
          >
            <X className="text-muted-foreground" size={24} />
          </button> */}

          <div className="flex-1 relative overflow-y-auto ">
            {steps[currentStep]?.component || <div>Invalid step</div>}
          </div>

          {!isConfirmStep && (
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t">
              <div className="grid gap-2 max-w-md mx-auto">
                <Button
                  className="flex-1"
                  onClick={handleNext}
                  disabled={!isNextEnabled()}
                >
                  {currentStep === 5
                    ? isSubmitting
                      ? "Submitting..."
                      : "Submit"
                    : "Next"}
                </Button>

                <Button
                  disabled={currentStep === 0}
                  variant="outline"
                  className="flex-1"
                  onClick={handleBack}
                >
                  Back
                </Button>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
