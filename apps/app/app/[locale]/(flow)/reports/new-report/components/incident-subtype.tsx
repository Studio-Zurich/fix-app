"use client";
import { log } from "@/lib/logger";
import { reportStore } from "@/lib/store";
import { IncidentSubtypeProps } from "@/lib/types";
import { MagnifyingGlass } from "@phosphor-icons/react";
import { Button } from "@repo/ui/button";
import { Checkbox } from "@repo/ui/checkbox";
import { Input } from "@repo/ui/input";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import StepContainer from "./step-container";

const IncidentSubtype = ({ incidentSubtypes }: IncidentSubtypeProps) => {
  const t = useTranslations("components.incidentSubtype");
  const tIncident = useTranslations("incidentTypes"); // For accessing incident type names
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubtype, setSelectedSubtype] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [validationError, setValidationError] = useState<string | undefined>();

  // Get functions from reportStore
  const setIncidentSubtype = reportStore((state) => state.setIncidentSubtype);
  const setStep = (step: number) => reportStore.setState({ step });

  // Load the selected incident type and subtype from store when component mounts
  useEffect(() => {
    const state = reportStore.getState();
    const incidentSubtypeId = state.incident_step.incident_subtype_id;
    const incidentSubtypeName = state.incident_step.incident_subtype_name;

    if (incidentSubtypeId && incidentSubtypeName) {
      setSelectedSubtype({
        id: incidentSubtypeId,
        name: incidentSubtypeName,
      });
      log("Loaded selected incident subtype from store", {
        id: incidentSubtypeId,
        name: incidentSubtypeName,
      });
    }
  }, []);

  // Get the selected incident type from store
  const selectedIncidentTypeId = reportStore(
    (state) => state.incident_step.incident_type_id
  );

  // Get the translated name for a subtype based on its UUID
  const getTranslatedSubtype = (subtypeId: string) => {
    try {
      // First, try to find the subtype under its parent type
      const parentType = incidentSubtypes.find(
        (subtype) => subtype.id === subtypeId
      )?.incident_type_id;

      if (parentType) {
        // Try to get the translation from the parent type's subtypes
        const translatedName = tIncident.raw(
          `types.${parentType}.subtypes.${subtypeId}.name`
        );
        const translatedDescription = tIncident.raw(
          `types.${parentType}.subtypes.${subtypeId}.description`
        );

        if (translatedName) {
          return {
            name: translatedName as string,
            description: translatedDescription as string,
          };
        }
      }
    } catch (error) {
      // If translation doesn't exist, fall back to database values
    }

    // Fall back to database name if no translation found
    const dbSubtype = incidentSubtypes.find(
      (subtype) => subtype.id === subtypeId
    );
    if (!dbSubtype) return null;

    return {
      name: dbSubtype.name,
      description: dbSubtype.description,
    };
  };

  // Filter subtypes based on the selected incident type and search query
  const filteredSubtypes = incidentSubtypes.filter((subtype) => {
    const translatedSubtype = getTranslatedSubtype(subtype.id);
    return (
      subtype.incident_type_id === selectedIncidentTypeId &&
      translatedSubtype &&
      translatedSubtype.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleSelect = (subtype: { id: string; name: string }) => {
    setSelectedSubtype(subtype);
    setValidationError(undefined); // Clear validation error on select
    log("Incident subtype selected", subtype);
  };

  const handleBack = () => {
    // Go back to the incident type step
    setStep(2);
  };

  const handleNext = () => {
    // Only proceed if a subtype is selected
    if (selectedSubtype) {
      // Save to store
      setIncidentSubtype(selectedSubtype);
      log("Incident subtype saved to store on Next click", selectedSubtype);

      // Move to the description step
      setStep(4);
    } else {
      // Show error if no subtype is selected
      setValidationError(t("validation.noSubtypeSelected"));
    }
  };

  return (
    <StepContainer
      title={t("title")}
      description={t("description")}
      prevButton={
        <Button type="button" variant="outline" onClick={handleBack}>
          {t("buttons.back")}
        </Button>
      }
      nextButton={
        <Button
          type="button"
          onClick={handleNext}
          disabled={!selectedSubtype} // Disable if no subtype is selected
        >
          {t("buttons.next")}
        </Button>
      }
      error={validationError}
    >
      <div className="relative">
        <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />

        <Input
          placeholder={tIncident("searchIncidentTypes")} // Use tIncident for this specific key
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="space-y-2 pb-[66px] overflow-y-auto">
        {filteredSubtypes.map((subtype) => {
          const translatedSubtype = getTranslatedSubtype(subtype.id);
          return (
            <div
              key={subtype.id}
              className="flex items-center space-x-3 p-4 border rounded-md hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSelect({
                  id: subtype.id,
                  name: translatedSubtype?.name || subtype.name,
                });
              }}
            >
              <div onClick={(e) => e.stopPropagation()}>
                <Checkbox
                  id={subtype.id}
                  checked={selectedSubtype?.id === subtype.id}
                  onCheckedChange={() =>
                    handleSelect({
                      id: subtype.id,
                      name: translatedSubtype?.name || subtype.name,
                    })
                  }
                  className="w-6 h-6"
                />
              </div>
              <div
                className="flex-1"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSelect({
                    id: subtype.id,
                    name: translatedSubtype?.name || subtype.name,
                  });
                }}
              >
                <label
                  htmlFor={subtype.id}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {translatedSubtype?.name || subtype.name}
                </label>
                {translatedSubtype?.description && (
                  <p className="text-sm text-muted-foreground">
                    {translatedSubtype.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Hidden input to pass the selected incident subtype to the form */}
      {selectedSubtype && (
        <input
          type="hidden"
          name="incident_subtype_id"
          value={selectedSubtype.id}
        />
      )}
    </StepContainer>
  );
};

export default IncidentSubtype;
