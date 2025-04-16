"use client";
import { log } from "@/lib/logger";
import { reportStore } from "@/lib/store";
import { Button } from "@repo/ui/button";
import { Checkbox } from "@repo/ui/checkbox";
import { Input } from "@repo/ui/input";
import { useEffect, useState } from "react";
import StepContainer from "./step-container";

interface IncidentSubtypeProps {
  incidentSubtypes: Array<{
    id: string;
    name: string;
    description: string;
    active: boolean;
    incident_type_id: string;
  }>;
}

const IncidentSubtype = ({ incidentSubtypes }: IncidentSubtypeProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubtype, setSelectedSubtype] = useState<{
    id: string;
    name: string;
  } | null>(null);

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

  // Filter subtypes based on the selected incident type and search query
  const filteredSubtypes = incidentSubtypes.filter(
    (subtype) =>
      subtype.incident_type_id === selectedIncidentTypeId &&
      subtype.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (subtype: { id: string; name: string }) => {
    setSelectedSubtype(subtype);
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
        <Button type="button" onClick={handleNext} disabled={!selectedSubtype}>
          Next
        </Button>
      }
    >
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground">
          glass
        </span>
        <Input
          placeholder="Search incident subtypes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="space-y-2">
        {filteredSubtypes.map((subtype) => (
          <div
            key={subtype.id}
            className="flex items-center space-x-3 p-4 border rounded-md hover:bg-muted/50 transition-colors cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleSelect(subtype);
            }}
          >
            <div onClick={(e) => e.stopPropagation()}>
              <Checkbox
                id={subtype.id}
                checked={selectedSubtype?.id === subtype.id}
                onCheckedChange={() => handleSelect(subtype)}
                className="w-6 h-6"
              />
            </div>
            <div
              className="flex-1"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSelect(subtype);
              }}
            >
              <label
                htmlFor={subtype.id}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                {subtype.name}
              </label>
              {subtype.description && (
                <p className="text-sm text-muted-foreground">
                  {subtype.description}
                </p>
              )}
            </div>
          </div>
        ))}
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
