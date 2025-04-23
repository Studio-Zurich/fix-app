"use client";
import { log } from "@/lib/logger";
import { reportStore } from "@/lib/store";
import { IncidentTypeProps } from "@/lib/types";
import { MagnifyingGlass } from "@phosphor-icons/react";
import { Button } from "@repo/ui/button";
import { Checkbox } from "@repo/ui/checkbox";
import { CommandItem } from "@repo/ui/command";
import { Input } from "@repo/ui/input";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import StepContainer from "./step-container";

const IncidentType = ({
  incidentTypes,
  incidentSubtypes = [],
}: IncidentTypeProps) => {
  const t = useTranslations("components.incidentType");
  const tIncident = useTranslations("incidentTypes"); // For accessing incident type names
  const incidentTypesT = useTranslations("incidentTypes");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [validationError, setValidationError] = useState<string | undefined>();

  // Get functions from reportStore
  const setIncidentType = reportStore((state) => state.setIncidentType);
  const setStep = (step: number) => reportStore.setState({ step });

  // Load the selected type from store when component mounts
  useEffect(() => {
    const state = reportStore.getState();
    const incidentTypeId = state.incident_step.incident_type_id;
    const incidentTypeName = state.incident_step.incident_type_name;

    if (incidentTypeId && incidentTypeName) {
      setSelectedType({
        id: incidentTypeId,
        name: incidentTypeName,
      });
      log("Loaded selected incident type from store", {
        id: incidentTypeId,
        name: incidentTypeName,
      });
    }
  }, []);

  // Get the translated name for a type based on its UUID
  const getTranslatedType = (typeId: string) => {
    try {
      // Try to get translated name directly using the UUID
      const translatedName = tIncident.raw(`types.${typeId}.name`);
      const translatedDescription = tIncident.raw(
        `types.${typeId}.description`
      );

      if (translatedName) {
        return {
          name: translatedName as string,
          description: translatedDescription as string,
        };
      }
    } catch (error) {
      // If translation doesn't exist, fall back to database values
    }

    // Fall back to database name if no translation found
    const dbType = incidentTypes.find((type) => type.id === typeId);
    if (!dbType) return null;

    return {
      name: dbType.name,
      description: dbType.description,
    };
  };

  // Filter incident types based on search query
  const filteredTypes = incidentTypes.filter((type) => {
    const translatedType = getTranslatedType(type.id);
    if (!translatedType) return false;

    return translatedType.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
  });

  const handleSelect = (type: { id: string; name: string }) => {
    setSelectedType(type);
    setValidationError(undefined);
    log("Incident type selected", type);
  };

  const handleBack = () => {
    // Just go back to the previous step without validating or saving data
    setStep(1);
  };

  const handleNext = () => {
    // Only proceed if a type is selected
    if (selectedType) {
      // Save to store
      setIncidentType(selectedType);
      log("Incident type saved to store on Next click", selectedType);

      // Check if there are any subtypes for this incident type
      const hasSubtypes = incidentSubtypes.some(
        (subtype) => subtype.incident_type_id === selectedType.id
      );

      // Skip to description step (4) if there are no subtypes, otherwise go to subtype step (3)
      setStep(hasSubtypes ? 3 : 4);
      log(`Going to ${hasSubtypes ? "subtype" : "description"} step`);
    } else {
      // Show error if no type is selected
      setValidationError(t("validation.noTypeSelected"));
    }
  };

  // Get icon for a type
  const getTypeIcon = (typeId: string) => {
    try {
      const typeIcon = incidentTypesT.raw(`types.${typeId}.icon`);
      return (typeIcon as string) || "📍";
    } catch (error) {
      return "📍";
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
        <Button type="button" onClick={handleNext}>
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
        {filteredTypes.map((type) => {
          const translatedType = getTranslatedType(type.id);
          return (
            <div
              key={type.id}
              className="flex items-center space-x-3 p-4 border rounded-md hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSelect({
                  id: type.id,
                  name: translatedType?.name || type.name,
                });
              }}
            >
              <div onClick={(e) => e.stopPropagation()}>
                <Checkbox
                  id={type.id}
                  checked={selectedType?.id === type.id}
                  onCheckedChange={() =>
                    handleSelect({
                      id: type.id,
                      name: translatedType?.name || type.name,
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
                    id: type.id,
                    name: translatedType?.name || type.name,
                  });
                }}
              >
                <label
                  htmlFor={type.id}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  <CommandItem
                    value={type.name}
                    onSelect={() => handleSelect(type)}
                    className="flex items-center gap-2 px-4 py-2"
                  >
                    <span className="text-base">{getTypeIcon(type.id)}</span>
                    <span className="text-sm">
                      {translatedType?.name || type.name}
                    </span>
                  </CommandItem>
                </label>
                {translatedType?.description && (
                  <p className="text-sm text-muted-foreground">
                    {translatedType.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Hidden input to pass the selected incident type to the form */}
      {selectedType && (
        <input type="hidden" name="incident_type_id" value={selectedType.id} />
      )}
    </StepContainer>
  );
};

export default IncidentType;
