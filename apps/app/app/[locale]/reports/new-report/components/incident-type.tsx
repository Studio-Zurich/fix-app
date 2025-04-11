"use client";
import { log } from "@/lib/logger";
import { Checkbox } from "@repo/ui/checkbox";
import { Input } from "@repo/ui/input";
import { useState } from "react";
import StepContainer from "./step-container";

interface IncidentTypeProps {
  incidentTypes: Array<{
    id: string;
    name: string;
    description: string;
    active: boolean;
  }>;
}

const IncidentType = ({ incidentTypes }: IncidentTypeProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Filter incident types based on search query
  const filteredTypes = incidentTypes.filter((type) =>
    type.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (type: { id: string; name: string }) => {
    setSelectedType(type);
    log("Incident type selected", type);
  };

  return (
    <StepContainer>
      <div className="space-y-4 incident-type-section">
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
          <input
            type="hidden"
            name="incident_type_id"
            value={selectedType.id}
          />
        )}
      </div>
    </StepContainer>
  );
};

export default IncidentType;
