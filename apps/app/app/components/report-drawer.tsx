"use client";

import { useReportStore } from "@/lib/store";
import { X } from "@phosphor-icons/react";
import { Vaul } from "@repo/ui/drawer";
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
  const currentStep = useReportStore((state) => state.currentStep);
  const setCurrentStep = useReportStore((state) => state.setCurrentStep);

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      onOpenChange(false);
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

  return (
    <Vaul.Root open={open} onOpenChange={handleOpenChange} dismissible={false}>
      <Vaul.Portal>
        <Vaul.Overlay className="fixed inset-0 bg-black/40 z-40" />
        <Vaul.Content className="fixed bottom-0 left-0 right-0 mt-24 h-[90%] rounded-t-[10px] bg-background z-50">
          <div className="flex flex-col px-5 pt-16 pb-8 relative">
            <button
              onClick={handleBack}
              className="absolute z-10 right-5 top-4 bg-background rounded"
            >
              <X className="text-muted-foreground" size={24} />
            </button>

            <div className="flex-1 relative overflow-y-auto">
              {steps[currentStep]?.component || <div>Invalid step</div>}
            </div>
            <div className="fixed bottom-0 left-0 right-0 bg-background">
              Button bottom
            </div>
          </div>
        </Vaul.Content>
      </Vaul.Portal>
    </Vaul.Root>
  );
}
