import { useReportStore } from "@/lib/store";
import { Button } from "@repo/ui/button";
import { ReactNode } from "react";
import StepHeader from "./header";

interface StepMetadata {
  title: string;
  description: string;
  banner?: ReactNode;
}

interface StepWrapperProps {
  steps: ReactNode[];
}

const stepMetadata: StepMetadata[] = [
  {
    title: "Fotos hochladen",
    description:
      "Laden Sie bis zu 5 Bilder (JPEG, PNG) des Vorfalls hoch. Maximale Dateigröße: 5MB",
  },
  {
    title: "Beschreibung",
    description: "Beschreiben Sie den Vorfall detailliert",
  },
  {
    title: "Standort",
    description: "Markieren Sie den genauen Standort auf der Karte",
  },
  {
    title: "Persönliche Daten",
    description: "Geben Sie Ihre Kontaktinformationen ein",
  },
  {
    title: "Zusammenfassung",
    description: "Überprüfen Sie alle Informationen vor dem Absenden",
    banner: (
      <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-md p-4">
        <p className="text-sm text-yellow-700">
          Bitte überprüfen Sie alle Angaben vor dem Absenden. Nach dem Absenden
          erhalten Sie eine Bestätigungs-E-Mail mit Ihren Meldungsdetails.
        </p>
      </div>
    ),
  },
];

export const StepWrapper = ({ steps }: StepWrapperProps) => {
  const { currentStep, setCurrentStep, reportData } = useReportStore();

  const validateCurrentStep = (): boolean => {
    switch (currentStep) {
      case 3: // Personal Data Step
        return !!(
          reportData.reporterFirstName &&
          reportData.reporterLastName &&
          reportData.reporterEmail
        );
      case 1: // Description Step
        return !!(reportData.description && reportData.description.trim());
      case 2: // Location Step
        return !!(
          reportData.location?.lng &&
          reportData.location?.lat &&
          reportData.location?.address
        );
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (!validateCurrentStep()) {
      // Let the individual components handle their error states
      return;
    }

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
    <>
      <section className="m-2 w-[calc(100vw-1rem)] rounded-xl h-full flex-1 flex flex-col justify-between bg-gray-100 p-5">
        <div className="space-y-6">
          <StepHeader />
          <div>
            <h2 className="text-lg font-semibold">
              {stepMetadata[currentStep]?.title}
            </h2>
            <p className="text-sm text-muted-foreground">
              {stepMetadata[currentStep]?.description}
            </p>
            {stepMetadata[currentStep]?.banner && (
              <div className="mt-4">{stepMetadata[currentStep].banner}</div>
            )}
          </div>
          <div className="">{steps[currentStep]}</div>
        </div>
        <div>
          {!isConfirmStep && (
            <>
              <div className="flex items-center justify-center gap-2 my-4">
                {stepMetadata.map((_, index) => (
                  <div
                    key={index}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === currentStep
                        ? "w-8 bg-primary"
                        : "w-2 bg-gray-300"
                    }`}
                  />
                ))}
              </div>
              <div className="flex justify-between mt-8">
                <Button
                  variant="ghost"
                  onClick={handleBack}
                  disabled={currentStep === 0}
                >
                  Zurück
                </Button>

                {isSummaryStep ? (
                  <Button variant="default" onClick={handleNext}>
                    Meldung absenden
                  </Button>
                ) : (
                  <Button variant="default" onClick={handleNext}>
                    Weiter
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
};
