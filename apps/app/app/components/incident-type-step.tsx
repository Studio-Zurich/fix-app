"use client";

import { useReportStore } from "@/lib/store";
import { CaretRight } from "@phosphor-icons/react";
import { Button } from "@repo/ui/button";
import { createClient } from "@supabase/supabase-js";
import { useCallback, useEffect, useState } from "react";

interface IncidentType {
  id: string;
  name: string;
  description: string | null;
}

interface IncidentSubtype {
  id: string;
  incident_type_id: string;
  name: string;
  description: string | null;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function IncidentTypeStep() {
  const [types, setTypes] = useState<IncidentType[]>([]);
  const [subtypes, setSubtypes] = useState<IncidentSubtype[]>([]);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { setCurrentStep } = useReportStore();

  // Fetch incident types
  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const { data, error } = await supabase
          .from("incident_types")
          .select("*")
          .eq("active", true);

        if (error) throw error;
        setTypes(data);
      } catch (err) {
        setError("Failed to load incident types");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTypes();
  }, []);

  // Fetch subtypes when a type is selected
  const fetchSubtypes = useCallback(async (typeId: string) => {
    try {
      const { data, error } = await supabase
        .from("incident_subtypes")
        .select("*")
        .eq("incident_type_id", typeId)
        .eq("active", true);

      if (error) throw error;
      setSubtypes(data);
    } catch (err) {
      setError("Failed to load subtypes");
      console.error(err);
    }
  }, []);

  const handleTypeSelect = async (typeId: string) => {
    setSelectedType(typeId);
    setSubtypes([]);
    await fetchSubtypes(typeId);
  };

  const handleSubtypeSelect = (subtypeId: string) => {
    useReportStore.setState((state) => ({
      reportData: {
        ...state.reportData,
        incidentTypeId: selectedType || undefined,
        incidentSubtypeId: subtypeId,
      },
    }));
    setCurrentStep(3);
  };

  const handleTypeOnlySelect = (typeId: string) => {
    useReportStore.setState((state) => ({
      reportData: {
        ...state.reportData,
        incidentTypeId: typeId,
        incidentSubtypeId: undefined,
      },
    }));
    setCurrentStep(3);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="space-y-4">
      {!selectedType ? (
        // Show main incident types
        <div className="space-y-2">
          <h2 className="text-lg font-semibold mb-4">Select incident type</h2>
          {types.map((type) => (
            <Button
              key={type.id}
              variant="outline"
              className="w-full justify-between"
              onClick={() => handleTypeSelect(type.id)}
            >
              <span>{type.name}</span>
              <CaretRight className="w-4 h-4" />
            </Button>
          ))}
        </div>
      ) : (
        // Show subtypes if available
        <div className="space-y-2">
          <Button
            variant="ghost"
            className="mb-4"
            onClick={() => setSelectedType(null)}
          >
            ← Back to types
          </Button>
          <h2 className="text-lg font-semibold mb-4">Select subtype</h2>
          {subtypes.length > 0 ? (
            subtypes.map((subtype) => (
              <Button
                key={subtype.id}
                variant="outline"
                className="w-full justify-between"
                onClick={() => handleSubtypeSelect(subtype.id)}
              >
                <span>{subtype.name}</span>
                <CaretRight className="w-4 h-4" />
              </Button>
            ))
          ) : (
            <Button
              className="w-full justify-between"
              onClick={() => handleTypeOnlySelect(selectedType)}
            >
              Continue without subtype
              <CaretRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
