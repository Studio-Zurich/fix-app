"use client";
import { log } from "@/lib/logger";
import { reportStore } from "@/lib/store";
import { Button } from "@repo/ui/button";
import { Textarea } from "@repo/ui/textarea";
import { useCallback, useEffect, useState } from "react";
import StepContainer from "./step-container";

interface IncidentDescriptionProps {
  maxCharacters?: number;
}

interface SelectedTypeInfo {
  type: { id: string; name: string };
  subtype?: { id: string; name: string };
}

const IncidentDescription = ({
  maxCharacters = 500,
}: IncidentDescriptionProps) => {
  const [description, setDescription] = useState("");
  const [charactersLeft, setCharactersLeft] = useState(maxCharacters);

  // Get setDescription function from store using direct method to avoid subscription issues
  const setStoreDescription = useCallback((desc: string) => {
    reportStore.getState().setDescription(desc);
  }, []);

  const [selectedType, setSelectedType] = useState<SelectedTypeInfo | null>(
    null
  );

  // Load the selected type and subtype from store
  useEffect(() => {
    const state = reportStore.getState();
    if (state.incident_type_id) {
      const newSelectedType: SelectedTypeInfo = {
        type: {
          id: state.incident_type_id,
          name: state.incident_type_name,
        },
      };

      if (state.incident_subtype_id) {
        newSelectedType.subtype = {
          id: state.incident_subtype_id,
          name: state.incident_subtype_name,
        };
      }

      setSelectedType(newSelectedType);
      log(
        "Selected incident type and subtype loaded from store",
        newSelectedType
      );
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
      log("Description updated", { length: newDescription.length });
    }
  };

  const handleBack = () => {
    // Check if we had a subtype selected to determine which step to go back to
    const state = reportStore.getState();
    const previousStep = state.incident_subtype_id ? 3 : 2;

    // Just go back to the previous step without validating or saving data
    reportStore.setState({ step: previousStep });
  };

  const handleNext = () => {
    // Save description to store
    setStoreDescription(description);
    log("Description saved to store on Next click", { description });

    // Go to user data step (step 5)
    reportStore.setState({ step: 5 });
  };

  return (
    <StepContainer
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
    >
      <div className="space-y-4 flex-1">
        {selectedType && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">
                {selectedType.type.name}
                {selectedType.subtype && <> – {selectedType.subtype.name}</>}
              </h3>
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
          <p className="text-sm text-muted-foreground text-right">
            {charactersLeft} characters left
          </p>
        </div>

        <div className="text-sm text-muted-foreground space-y-1">
          <p>Guidelines:</p>
          <ul className="list-disc list-inside pl-2">
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
