"use client";

import { ReportDescription, SelectedIncidentType } from "@/lib/types";
import { Textarea } from "@repo/ui/textarea";
import { useTranslations } from "next-intl";
import { useState } from "react";

interface IncidentDescriptionStepProps {
  onNext: () => void;
  onBack: () => void;
  selectedType: SelectedIncidentType;
  onDescriptionChange: (description: ReportDescription) => void;
  initialDescription?: string;
}

const MAX_CHARS = 500;

export default function IncidentDescriptionStep({
  onNext,
  onBack,
  selectedType,
  onDescriptionChange,
  initialDescription = "",
}: IncidentDescriptionStepProps) {
  const [description, setDescription] = useState(initialDescription);
  const t = useTranslations("components.reportFlow");
  const tIncident = useTranslations("incidentTypes");

  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const value = e.target.value;
    if (value.length <= MAX_CHARS) {
      setDescription(value);
      onDescriptionChange({
        text: value,
        maxLength: MAX_CHARS,
      });
    }
  };

  const charactersLeft = MAX_CHARS - description.length;

  return (
    <div className="space-y-4">
      {selectedType && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            {/* <h3 className="font-medium">
              {tIncident(`${selectedType.type.name}.name`)}
            </h3> */}
          </div>
          {selectedType.subtype && (
            <p className="text-sm text-muted-foreground">
              {tIncident(
                `${selectedType.type.name}.subtypes.${selectedType.subtype.name}.name`
              )}
            </p>
          )}
        </div>
      )}

      <div className="space-y-2">
        <Textarea
          placeholder={t("descriptionPlaceholder")}
          value={description}
          onChange={handleDescriptionChange}
          rows={6}
          className="resize-none"
        />
        <p className="text-sm text-muted-foreground text-right">
          {t("charactersLeft", { count: charactersLeft })}
        </p>
      </div>

      <div className="text-sm text-muted-foreground space-y-1">
        <p>{t("descriptionGuidelines.title")}:</p>
        <ul className="list-disc list-inside pl-2">
          <li>{t("descriptionGuidelines.specific")}</li>
          <li>{t("descriptionGuidelines.noPersonalInfo")}</li>
          <li>{t("descriptionGuidelines.respectful")}</li>
          <li>{t("descriptionGuidelines.noOffensive")}</li>
        </ul>
      </div>

      <div className="flex justify-between mt-4">
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onNext}
          className="text-sm text-primary hover:text-primary/80"
        >
          Next
        </button>
      </div>
    </div>
  );
}
