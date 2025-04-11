"use client";
import { log } from "@/lib/logger";
import { Textarea } from "@repo/ui/textarea";
import { useEffect, useState } from "react";
import StepContainer from "./step-container";

interface IncidentDescriptionProps {
  maxCharacters?: number;
}

const IncidentDescription = ({
  maxCharacters = 500,
}: IncidentDescriptionProps) => {
  const [description, setDescription] = useState("");
  const [charactersLeft, setCharactersLeft] = useState(maxCharacters);
  const [selectedType, setSelectedType] = useState<{
    type: { id: string; name: string };
    subtype?: { id: string; name: string };
  } | null>(null);

  // Update selected type when the form changes
  useEffect(() => {
    // Function to check for the selected incident type and subtype
    const checkSelectedType = () => {
      // Get the selected incident type
      const typeInput = document.querySelector(
        'input[name="incident_type_id"]'
      ) as HTMLInputElement;

      // Get the selected incident subtype
      const subtypeInput = document.querySelector(
        'input[name="incident_subtype_id"]'
      ) as HTMLInputElement;

      if (typeInput && typeInput.value) {
        // Find the type name from the checkbox
        const typeCheckbox = document.querySelector(
          `input[id="${typeInput.value}"]`
        ) as HTMLInputElement;

        const typeName = typeCheckbox?.id || "";

        // Find the subtype name if it exists
        let subtypeName = "";
        if (subtypeInput && subtypeInput.value) {
          const subtypeCheckbox = document.querySelector(
            `input[id="${subtypeInput.value}"]`
          ) as HTMLInputElement;
          subtypeName = subtypeCheckbox?.id || "";
        }

        setSelectedType({
          type: { id: typeInput.value, name: typeName },
          subtype: subtypeName
            ? { id: subtypeInput.value, name: subtypeName }
            : undefined,
        });

        log("Selected incident type and subtype updated", {
          typeId: typeInput.value,
          typeName,
          subtypeId: subtypeInput?.value,
          subtypeName,
        });
      }
    };

    // Initial check
    checkSelectedType();

    // Set up an interval to check for changes
    const intervalId = setInterval(checkSelectedType, 500);

    // Also listen for form changes
    const handleFormChange = () => {
      checkSelectedType();
    };

    document.addEventListener("change", handleFormChange);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener("change", handleFormChange);
    };
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

  return (
    <StepContainer>
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
