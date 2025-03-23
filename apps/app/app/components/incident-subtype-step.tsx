"use client";

import { useReportStore } from "@/lib/store";
import { Checkbox } from "@repo/ui/checkbox";
import { createClient } from "@supabase/supabase-js";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

interface IncidentSubtype {
  id: string;
  incident_type_id: string;
  name: string;
  description: string | null;
}

interface IncidentType {
  id: string;
  name: string;
  description: string | null;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function IncidentSubtypeStep() {
  const [subtypes, setSubtypes] = useState<IncidentSubtype[]>([]);
  const [selectedType, setSelectedType] = useState<IncidentType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const selectedTypeId = useReportStore((state) => state.selectedTypeId);
  const selectedSubtypeId = useReportStore((state) => state.selectedSubtypeId);
  const setSelectedSubtypeId = useReportStore(
    (state) => state.setSelectedSubtypeId
  );
  const { setStepValidation } = useReportStore();
  const t = useTranslations("incidentTypes");
  const tSummary = useTranslations("summary");

  // Fetch selected type and subtypes
  useEffect(() => {
    const fetchTypeAndSubtypes = async () => {
      if (!selectedTypeId) {
        setSubtypes([]);
        return;
      }

      try {
        // First fetch the incident type
        const { data: typeData, error: typeError } = await supabase
          .from("incident_types")
          .select("*")
          .eq("id", selectedTypeId)
          .single();

        if (typeError) throw typeError;
        setSelectedType(typeData);

        // Then fetch subtypes
        const { data: subtypesData, error: subtypesError } = await supabase
          .from("incident_subtypes")
          .select("*")
          .eq("incident_type_id", selectedTypeId)
          .eq("active", true);

        if (subtypesError) throw subtypesError;
        setSubtypes(subtypesData || []);
      } catch (err) {
        setError("Failed to load type and subtypes");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTypeAndSubtypes();
  }, [selectedTypeId]);

  // Update validation when subtype selection changes
  useEffect(() => {
    // If there are no subtypes, validate immediately
    if (subtypes.length === 0) {
      setStepValidation("incidentType", true);
      return;
    }
    // Otherwise validate based on selection
    setStepValidation("incidentType", !!selectedSubtypeId);
  }, [selectedSubtypeId, setStepValidation, subtypes.length]);

  const handleSubtypeSelect = (subtypeId: string) => {
    setSelectedSubtypeId(selectedSubtypeId === subtypeId ? null : subtypeId);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  // If there are no subtypes, show a message and auto-validate
  if (subtypes.length === 0) {
    return (
      <div className="space-y-4 px-5">
        {selectedType && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">{t(`${selectedType.name}.name`)}</h3>
            </div>
          </div>
        )}
        <p className="text-sm text-muted-foreground">
          {tSummary("noSubtypesAvailable")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 px-5">
      {selectedType && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">{t(`${selectedType.name}.name`)}</h3>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {subtypes.map((subtype) => (
          <div
            key={subtype.id}
            className="flex items-center space-x-3 p-4 border rounded-md hover:bg-muted/50 transition-colors"
          >
            <Checkbox
              id={subtype.id}
              checked={selectedSubtypeId === subtype.id}
              onCheckedChange={() => handleSubtypeSelect(subtype.id)}
              className="w-6 h-6"
            />
            <div className="flex-1">
              <label
                htmlFor={subtype.id}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {selectedType &&
                  t(`${selectedType.name}.subtypes.${subtype.name}.name`)}
              </label>
              {subtype.description && selectedType && (
                <p className="text-sm text-muted-foreground">
                  {t(
                    `${selectedType.name}.subtypes.${subtype.name}.description`
                  )}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
