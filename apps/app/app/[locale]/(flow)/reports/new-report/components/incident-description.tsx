"use client";
import { log } from "@/lib/logger";
import { incidentDescriptionSchema } from "@/lib/schemas";
import { reportStore } from "@/lib/store";
import { IncidentDescriptionProps } from "@/lib/types";
import { Button } from "@repo/ui/button";
import { TypographyH3 } from "@repo/ui/headline";
import { TypographyParagraph } from "@repo/ui/text";
import { Textarea } from "@repo/ui/textarea";
import { useEffect, useState } from "react";
import { z } from "zod";
import StepContainer from "./step-container";

const IncidentDescription = ({
  maxCharacters = 500,
}: IncidentDescriptionProps) => {
  const [description, setDescription] = useState("");
  const [charactersLeft, setCharactersLeft] = useState(maxCharacters);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Get functions from reportStore
  const setStoreDescription = reportStore((state) => state.setDescription);
  const setStep = (step: number) => reportStore.setState({ step });

  // Load the description from store when component mounts
  useEffect(() => {
    const state = reportStore.getState();
    const storeDescription = state.incident_step.description;

    if (storeDescription) {
      setDescription(storeDescription);
      log("Description loaded from store", { description: storeDescription });
    }
  }, []);

  // Update character count when description changes
  useEffect(() => {
    setCharactersLeft(maxCharacters - description.length);
  }, [description, maxCharacters]);

  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const newDescription = e.target.value;
    if (newDescription.length <= maxCharacters) {
      setDescription(newDescription);
      setValidationError(null);
      log("Description updated", { length: newDescription.length });
    }
  };

  const validateDescription = (): boolean => {
    try {
      incidentDescriptionSchema.parse({ description });
      setValidationError(null);
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        setValidationError(error.errors[0].message);
      } else {
        setValidationError("An unknown error occurred");
      }
      return false;
    }
  };

  const handleBack = () => {
    // Check if we had a subtype selected to determine which step to go back to
    const state = reportStore.getState();
    const previousStep = state.incident_step.incident_subtype_id ? 3 : 2;

    // Just go back to the previous step without validating or saving data
    setStep(previousStep);
  };

  const handleNext = () => {
    // Validate description before proceeding
    if (!validateDescription()) {
      return;
    }

    // Save description to store
    setStoreDescription(description);
    log("Description saved to store on Next click", { description });

    // Go to user data step (step 5)
    setStep(5);
  };

  // Get the selected incident type and subtype from store
  const incidentTypeName = reportStore(
    (state) => state.incident_step.incident_type_name
  );
  const incidentSubtypeName = reportStore(
    (state) => state.incident_step.incident_subtype_name
  );

  return (
    <StepContainer
      title="Describe the Incident"
      description="Provide a detailed description of the incident."
      prevButton={
        <Button type="button" variant="outline" onClick={handleBack}>
          Back
        </Button>
      }
      nextButton={
        <Button type="button" onClick={handleNext}>
          Next
        </Button>
      }
      error={validationError || undefined}
    >
      <div className="space-y-4 flex-1">
        {incidentTypeName && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <TypographyH3 size="text-base">
                {incidentTypeName}
                {incidentSubtypeName && <> – {incidentSubtypeName}</>}
              </TypographyH3>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Textarea
            placeholder="Describe what happened in detail..."
            value={description}
            onChange={handleDescriptionChange}
            rows={6}
            className="resize-none"
          />
          <div className="flex justify-end">
            <TypographyParagraph
              className="text-muted-foreground"
              size="text-sm"
            >
              {charactersLeft} characters left
            </TypographyParagraph>
          </div>
        </div>

        <div className="space-y-1">
          <TypographyParagraph className="text-muted-foreground">
            Guidelines:
          </TypographyParagraph>
          <ul className="list-disc list-inside pl-2 text-sm text-muted-foreground">
            <li>Be specific about what you observed</li>
            <li>Do not include personal information</li>
            <li>Be respectful and professional</li>
            <li>Avoid offensive or inappropriate language</li>
          </ul>
        </div>

        {/* Hidden input to pass the description to the form */}
        <input type="hidden" name="description" value={description} />
      </div>
    </StepContainer>
  );
};

export default IncidentDescription;
