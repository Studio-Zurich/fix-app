"use client";

import { submitReport } from "@/app/[locale]/actions";
import { useReportStore } from "@/lib/store";
import { ReportData } from "@/lib/types";
import { ArrowCircleRight } from "@phosphor-icons/react";
import { Button } from "@repo/ui/button";
import { Sheet, SheetContent } from "@repo/ui/sheet";
import { useTranslations } from "next-intl";
import { useState } from "react";
import ConfirmStep from "./confirm-step";
import ImageStep from "./image-step";
import IncidentDescriptionStep from "./incident-description-step";
import IncidentTypeStep from "./incident-type-step";
import LocationStep from "./location-step";
import StepHeader from "./step-header";
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
  const t = useTranslations("reportDrawer");
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

  // Get step title and description based on current step
  const getStepContent = () => {
    switch (currentStep) {
      case 0:
        return {
          title: t("steps.images.title"),
          description: t("steps.images.description"),
        };
      case 1:
        return {
          title: t("steps.location.title"),
          description: t("steps.location.description"),
        };
      case 2:
        return {
          title: t("steps.incidentType.title"),
          description: t("steps.incidentType.description"),
        };
      case 3:
        return {
          title: t("steps.description.title"),
          description: t("steps.description.description"),
        };
      case 4:
        return {
          title: t("steps.userData.title"),
          description: t("steps.userData.description"),
        };
      case 5:
        return {
          title: t("steps.summary.title"),
          description: t("steps.summary.description"),
        };
      default:
        return { title: "", description: "" };
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="bottom">
        <StepHeader
          title={getStepContent().title}
          description={getStepContent().description}
        />
        <div className="flex-1 overflow-y-auto">
          {steps[currentStep]?.component || <div>Invalid step</div>}
        </div>

        {!isConfirmStep && (
          <div className="px-5 py-4 flex justify-between items-center space-x-6">
            <Button
              disabled={currentStep === 0}
              variant="link"
              className="flex-1"
              onClick={handleBack}
            >
              {t("buttons.back")}
            </Button>
            <Button
              variant={currentStep === 5 ? "default" : "icon"}
              size={currentStep === 5 ? "default" : "icon"}
              className={`w-[65%] ${currentStep === 5 ? "bg-primary" : ""}`}
              onClick={handleNext}
              disabled={!isNextEnabled()}
            >
              {currentStep === 5
                ? isSubmitting
                  ? t("buttons.submitting")
                  : t("buttons.submit")
                : t("buttons.next")}{" "}
              <ArrowCircleRight className="flex-shrink-0 w-20" />
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
