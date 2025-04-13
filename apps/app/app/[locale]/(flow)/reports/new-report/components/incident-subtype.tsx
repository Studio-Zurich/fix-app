"use client";
import { log } from "@/lib/logger";
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

  // Get the selected incident type from the form
  const [selectedTypeId, setSelectedTypeId] = useState<string | null>(null);

  // Update selected type ID when the form changes
  useEffect(() => {
    // Function to check for the selected incident type
    const checkSelectedType = () => {
      // First try to find the hidden input
      const typeInput = document.querySelector(
        'input[name="incident_type_id"]'
      ) as HTMLInputElement;

      if (typeInput && typeInput.value) {
        setSelectedTypeId(typeInput.value);
        log("Selected incident type ID updated from hidden input", {
          typeId: typeInput.value,
        });
        return;
      }

      // If no hidden input or it's empty, try to find the checked checkbox
      const checkedCheckbox = document.querySelector(
        'input[name="incident_type_id"]:checked'
      ) as HTMLInputElement;
      if (checkedCheckbox) {
        setSelectedTypeId(checkedCheckbox.value);
        log("Selected incident type ID updated from checkbox", {
          typeId: checkedCheckbox.value,
        });
        return;
      }

      // If still no selection, try to find any checked checkbox in the incident type section
      const incidentTypeSection = document.querySelector(
        ".incident-type-section"
      );
      if (incidentTypeSection) {
        const checkedBox = incidentTypeSection.querySelector(
          'input[type="checkbox"]:checked'
        ) as HTMLInputElement;
        if (checkedBox) {
          setSelectedTypeId(checkedBox.id);
          log("Selected incident type ID updated from section checkbox", {
            typeId: checkedBox.id,
          });
          return;
        }
      }
    };

    // Initial check
    checkSelectedType();

    // Set up a more frequent interval to check for changes
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

  // Filter subtypes based on search query and selected incident type
  const filteredSubtypes = incidentSubtypes.filter((subtype) => {
    const matchesSearch = subtype.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesType =
      !selectedTypeId || subtype.incident_type_id === selectedTypeId;
    return matchesSearch && matchesType;
  });

  const handleSelect = (subtype: { id: string; name: string }) => {
    setSelectedSubtype(subtype);
    log("Incident subtype selected", subtype);
  };

  return (
    <StepContainer>
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
