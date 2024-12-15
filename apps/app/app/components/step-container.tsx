"use client";

import { Button } from "@repo/ui/button";
import { Progress } from "@repo/ui/progress";
import { useState } from "react";
import ImageStep from "./image-step";
import LocationStep from "./location-step";

const steps = [
  { id: 0, component: <ImageStep /> },
  { id: 1, component: <LocationStep /> },
  { id: 2, component: <div>Incident Type Step</div> },
  { id: 3, component: <div>Incident Description Step</div> },
  { id: 4, component: <div>Summary Step</div> },
];

export default function StepContainer() {
  const [currentStep, setCurrentStep] = useState(0);

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen flex flex-col p-4">
      <header className="text-center mb-4">
        <h1 className="text-2xl font-bold">Fix App</h1>
      </header>

      <Progress value={progress} className="mb-6 w-full" />

      <div className="flex-1">
        {steps[currentStep]?.component || <div>Invalid step</div>}
      </div>

      <div className="mt-6 flex justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(currentStep - 1)}
          disabled={currentStep === 0}
        >
          Back
        </Button>

        <Button
          onClick={() => setCurrentStep(currentStep + 1)}
          disabled={currentStep === steps.length - 1}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
