"use client";

import { useReportStore } from "@/lib/store";
import { CaretLeft } from "@phosphor-icons/react";
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
];

export default function StepContainer() {
  const currentStep = useReportStore((state) => state.currentStep);
  const setCurrentStep = useReportStore((state) => state.setCurrentStep);

  const progress = ((currentStep + 1) / steps.length) * 100;
  const showBackButton = currentStep > 0;

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="flex flex-col h-svh">
      <header className="grid grid-cols-3 items-center px-5 h-16">
        {showBackButton && (
          <button className="col-span-1" onClick={handleBack}>
            <CaretLeft />
          </button>
        )}
        <h1
          className={`text-2xl font-bold flex-1 text-center ${
            showBackButton ? "col-span-1" : "col-span-3"
          }`}
        >
          Fix App
        </h1>
      </header>

      {/* <Progress value={progress} className="mb-6 w-full" /> */}

      <div className="flex-1">
        {steps[currentStep]?.component || <div>Invalid step</div>}
      </div>
    </div>
  );
}
