"use client";
import { log } from "@/lib/logger";
import { reportStore } from "@/lib/store";
import { Button } from "@repo/ui/button";
import { Checkbox } from "@repo/ui/checkbox";
import { Input } from "@repo/ui/input";
import { useEffect, useState } from "react";
import StepContainer from "./step-container";

interface IncidentTypeProps {
  incidentTypes: Array<{
    id: string;
    name: string;
    description: string;
    active: boolean;
  }>;
  incidentSubtypes?: Array<{
    id: string;
    name: string;
    description: string;
    active: boolean;
    incident_type_id: string;
  }>;
}

const IncidentType = ({
  incidentTypes,
  incidentSubtypes = [],
}: IncidentTypeProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<{
    id: string;
    name: string;
  } | null>(null);

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

  // Filter incident types based on search query
  const filteredTypes = incidentTypes.filter((type) =>
    type.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (type: { id: string; name: string }) => {
    setSelectedType(type);
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
    }
  };

  return (
    <StepContainer
      prevButton={
        <Button type="button" variant="outline" onClick={handleBack}>
          Back
        </Button>
      }
      nextButton={
        <Button type="button" onClick={handleNext} disabled={!selectedType}>
          Next
        </Button>
      }
    >
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground">
          glass
        </span>
        <Input
          placeholder="Search incident types..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="space-y-2">
        {filteredTypes.map((type) => (
          <div
            key={type.id}
            className="flex items-center space-x-3 p-4 border rounded-md hover:bg-muted/50 transition-colors cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleSelect(type);
            }}
          >
            <div onClick={(e) => e.stopPropagation()}>
              <Checkbox
                id={type.id}
                checked={selectedType?.id === type.id}
                onCheckedChange={() => handleSelect(type)}
                className="w-6 h-6"
              />
            </div>
            <div
              className="flex-1"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSelect(type);
              }}
            >
              <label
                htmlFor={type.id}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                {type.name}
              </label>
              {type.description && (
                <p className="text-sm text-muted-foreground">
                  {type.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Hidden input to pass the selected incident type to the form */}
      {selectedType && (
        <input type="hidden" name="incident_type_id" value={selectedType.id} />
      )}
    </StepContainer>
  );
};

export default IncidentType;
