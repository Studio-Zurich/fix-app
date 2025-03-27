"use client";

import { ReportDescription, SelectedIncidentTypeType } from "@/lib/types";
import { Button } from "@repo/ui/button";
import { Textarea } from "@repo/ui/textarea";
import { useTranslations } from "next-intl";
import { useState } from "react";

interface IncidentDescriptionProps {
  onNext: () => void;
  onBack: () => void;
  selectedType: SelectedIncidentTypeType;
  onDescriptionChange: (description: ReportDescription) => void;
  initialDescription?: string;
}

const MAX_CHARS = 500;

export default function IncidentDescription({
  onNext,
  onBack,
  selectedType,
  onDescriptionChange,
  initialDescription = "",
}: IncidentDescriptionProps) {
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
            <h3 className="font-medium">
              {t("selectedIncidentType")}{" "}
              {tIncident(`${selectedType.type.name}.name`)}
            </h3>
          </div>
          {selectedType.subtype && (
            <p className="text-sm text-muted-foreground">
              {t("selectedIncidentSubtype")}{" "}
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
        <Button variant="outline" onClick={onBack}>
          {t("back")}
        </Button>
        <Button onClick={onNext}>{t("next")}</Button>
      </div>
    </div>
  );
}
