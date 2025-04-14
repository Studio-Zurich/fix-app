"use client";
import { log } from "@/lib/logger";
import { reportStore } from "@/lib/store";
import { Button } from "@repo/ui/button";
import { Checkbox } from "@repo/ui/checkbox";
import { Input } from "@repo/ui/input";
import { useCallback, useEffect, useMemo, useState } from "react";
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

  // Get setIncidentSubtype function from store using direct method to avoid subscription issues
  const setIncidentSubtype = useCallback(
    (data: { id: string; name: string }) => {
      reportStore.getState().setIncidentSubtype(data);
    },
    []
  );

  // Get selected type ID from store
  const [selectedTypeId, setSelectedTypeId] = useState<string>("");

  // Load the selected type from store
  useEffect(() => {
    const state = reportStore.getState();
    if (state.incident_type_id) {
      setSelectedTypeId(state.incident_type_id);
      log("Selected incident type ID loaded from store", {
        typeId: state.incident_type_id,
        typeName: state.incident_type_name,
      });
    }
  }, []);

  // Filter subtypes based on search query and selected incident type
  const filteredSubtypes = useMemo(() => {
    return incidentSubtypes.filter((subtype) => {
      const matchesSearch = subtype.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesType =
        !selectedTypeId || subtype.incident_type_id === selectedTypeId;
      return matchesSearch && matchesType;
    });
  }, [incidentSubtypes, searchQuery, selectedTypeId]);

  const handleSelect = (subtype: { id: string; name: string }) => {
    setSelectedSubtype(subtype);
    log("Incident subtype selected", subtype);
  };

  const handleNext = () => {
    // Only proceed if a subtype is selected
    if (selectedSubtype) {
      // Save to store
      setIncidentSubtype(selectedSubtype);
      log("Incident subtype saved to store on Next click", selectedSubtype);

      // Go to description step
      reportStore.setState({ step: 4 });
    }
  };

  return (
    <StepContainer
      nextButton={
        <Button type="button" onClick={handleNext} disabled={!selectedSubtype}>
          Next
        </Button>
      }
    >
      <div className="space-y-4">
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

        {selectedTypeId ? (
          <div className="space-y-2">
            {filteredSubtypes.length > 0 ? (
              filteredSubtypes.map((subtype) => (
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
              ))
            ) : (
              <div className="p-4 text-center text-muted-foreground">
                No subtypes found. Please select an incident type first or try a
                different search.
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 text-center text-muted-foreground">
            Please select an incident type first.
          </div>
        )}

        {/* Hidden input to pass the selected incident subtype to the form */}
        {selectedSubtype && (
          <input
            type="hidden"
            name="incident_subtype_id"
            value={selectedSubtype.id}
          />
        )}
      </div>
    </StepContainer>
  );
};

export default IncidentSubtype;
