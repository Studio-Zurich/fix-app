import { submitReport } from "@/app/actions";
import { incidentDescriptionSchema } from "@/lib/schemas";
import { useReportStore } from "@/lib/store";
import { Button } from "@repo/ui/button";
import { ReactNode, useState } from "react";
import { ConfirmStep } from "./confirm-step";
import StepHeader from "./header";
import { ImageStep } from "./image-step";
import { IncidentDescriptionStep } from "./incident-description";
import { LocationStep } from "./location-step";
import { SummaryStep } from "./summary-step";
import { UserDataStep } from "./user-data-step";

interface StepMetadata {
  title: string;
  description: string;
  banner?: ReactNode;
  component: ReactNode;
  isConfirm?: boolean;
}

const steps: StepMetadata[] = [
  {
    title: "Fotos hochladen",
    description:
      "Laden Sie bis zu 5 Bilder (JPEG, PNG) des Vorfalls hoch. Maximale Dateigröße: 5MB.",
    component: <ImageStep />,
  },
  {
    title: "Beschreibung",
    description: "Beschreiben Sie den Vorfall detailliert.",
    component: <IncidentDescriptionStep />,
  },
  {
    title: "Standort",
    description: "Markieren Sie den genauen Standort auf der Karte.",
    component: <LocationStep />,
  },
  {
    title: "Persönliche Daten",
    description: "Geben Sie Ihre Kontaktinformationen ein.",
    component: <UserDataStep />,
  },
  {
    title: "Zusammenfassung",
    description: "Überprüfen Sie alle Informationen vor dem Absenden.",
    component: <SummaryStep />,
    banner: (
      <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-md p-4">
        <p className="text-sm text-yellow-700">
          Bitte überprüfen Sie alle Angaben vor dem Absenden. Nach dem Absenden
          erhalten Sie eine Bestätigungs-E-Mail mit Ihren Meldungsdetails.
        </p>
      </div>
    ),
  },
  {
    title: "Bestätigung",
    description: "Ihre Meldung wurde erfolgreich übermittelt.",
    component: <ConfirmStep />,
    isConfirm: true,
  },
];

export const StepWrapper = () => {
  const { currentStep, setCurrentStep, reportData } = useReportStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validateCurrentStep = (): boolean => {
    switch (currentStep) {
      case 0: // Image Step
        return true; // Images are optional
      case 1: // Description Step
        try {
          const descriptionResult = incidentDescriptionSchema.safeParse({
            description: reportData.description || "",
          });
          return descriptionResult.success;
        } catch (error) {
          console.error("Validation error:", error);
          return false;
        }
      case 2: // Location Step
        return !!(
          reportData.location &&
          reportData.location.lng &&
          reportData.location.lat &&
          reportData.location.address
        );
      case 3: // Personal Data Step
        return !!(
          reportData.reporterFirstName &&
          reportData.reporterLastName &&
          reportData.reporterEmail
        );
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const result = await submitReport(reportData);

      if (result.success) {
        setCurrentStep(currentStep + 1); // Move to confirmation step
      } else {
        setSubmitError(result.error || "Ein Fehler ist aufgetreten");
      }
    } catch (error) {
      console.error("Error submitting report:", error);
      setSubmitError("Ein unerwarteter Fehler ist aufgetreten");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (currentStep === steps.length - 2) {
      // If on summary step
      handleSubmit();
      return;
    }

    if (currentStep === 1) {
      try {
        const descriptionResult = incidentDescriptionSchema.safeParse({
          description: reportData.description || "",
        });
        if (!descriptionResult.success) {
          const descriptionInput = document.getElementById("description");
          descriptionInput?.focus();
          descriptionInput?.blur();
          return;
        }
      } catch (error) {
        console.error("Validation error:", error);
        return;
      }
    }

    if (!validateCurrentStep()) {
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
        <div className="space-y-6 flex-1 flex flex-col">
          {!isConfirmStep && <StepHeader />}
          {!isConfirmStep && (
            <div>
              <h2 className="text-lg font-semibold block">
                {steps[currentStep]?.title}
              </h2>
              <p className="text-sm text-muted-foreground block">
                {steps[currentStep]?.description}
              </p>
              {steps[currentStep]?.banner && (
                <div className="mt-4">{steps[currentStep].banner}</div>
              )}
            </div>
          )}
          <div className="flex-1 flex flex-col h-full">
            {steps[currentStep]?.component}
          </div>

          {submitError && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{submitError}</p>
            </div>
          )}
        </div>
        <div>
          {!isConfirmStep && (
            <>
              <div className="flex items-center justify-center gap-2 my-8">
                {steps
                  .filter((step) => !step.isConfirm)
                  .map((_, index) => (
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
              <div className="flex justify-between mt-4">
                <Button
                  variant="ghost"
                  onClick={handleBack}
                  disabled={currentStep === 0 || isSubmitting}
                >
                  Zurück
                </Button>

                {isSummaryStep ? (
                  <Button
                    variant="default"
                    onClick={handleNext}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Wird gesendet..." : "Meldung absenden"}
                  </Button>
                ) : (
                  <Button
                    variant="default"
                    onClick={handleNext}
                    disabled={isSubmitting}
                  >
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
