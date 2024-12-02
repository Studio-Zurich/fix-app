"use client";

import { ConfirmStep } from "@/components/report/confirm-step";
import { ImageStep } from "@/components/report/image-step";
import { IncidentDescriptionStep } from "@/components/report/incident-description";
import { IncidentTypeStep } from "@/components/report/incident-type";
import { LocationStep } from "@/components/report/location-step";
import { StepWrapper } from "@/components/report/step-wrapper";
import { SummaryStep } from "@/components/report/summary-step";
import { UserDataStep } from "@/components/report/user-data-step";

export default function ReportPage() {
  const steps = [
    <ImageStep key="image" />,
    <LocationStep key="location" />,
    <IncidentTypeStep key="incident-type" />,
    <IncidentDescriptionStep key="incident-description" />,
    <UserDataStep key="user-data" />,
    <SummaryStep key="summary" />,
    <ConfirmStep key="confirm" />,
  ];

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <StepWrapper steps={steps} />
      </div>
    </main>
  );
}
