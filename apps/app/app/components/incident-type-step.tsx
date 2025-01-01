"use client";

import { useReportStore } from "@/lib/store";
import { CaretRight, MagnifyingGlass } from "@phosphor-icons/react";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { createClient } from "@supabase/supabase-js";
import { useTranslations } from "next-intl";
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
  const [filteredTypes, setFilteredTypes] = useState<IncidentType[]>([]);
  const [subtypes, setSubtypes] = useState<IncidentSubtype[]>([]);
  const [selectedType, setSelectedType] = useState<IncidentType | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { setCurrentStep } = useReportStore();
  const t = useTranslations("incidentTypes");

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
        setFilteredTypes(data);
      } catch (err) {
        setError("Failed to load incident types");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTypes();
  }, []);

  // Handle search
  useEffect(() => {
    const query = searchQuery.toLowerCase();
    const filtered = types.filter(
      (type) =>
        type.name.toLowerCase().includes(query) ||
        type.description?.toLowerCase().includes(query)
    );
    setFilteredTypes(filtered);
  }, [searchQuery, types]);

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

  const handleTypeSelect = async (type: IncidentType) => {
    setSelectedType(type);
    setSubtypes([]);
    await fetchSubtypes(type.id);
  };

  const handleSubtypeSelect = (subtypeId: string) => {
    useReportStore.setState((state) => ({
      reportData: {
        ...state.reportData,
        incidentTypeId: selectedType?.id,
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
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Select incident type</h2>

          <div className="relative">
            <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search incident types..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="space-y-2">
            {filteredTypes.map((type) => (
              <button
                key={type.id}
                className="w-full justify-between flex p-4 border rounded-md hover:bg-muted/50 transition-colors"
                onClick={() => handleTypeSelect(type)}
              >
                <div className="text-left">
                  <div className="font-medium">{t(`${type.name}.name`)}</div>
                  {type.description && (
                    <div className="text-sm text-muted-foreground">
                      {t(`${type.name}.description`)}
                    </div>
                  )}
                </div>
                <CaretRight className="w-4 h-4 flex-shrink-0 my-auto" />
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <Button
            variant="ghost"
            className="mb-4"
            onClick={() => setSelectedType(null)}
          >
            ← Back to types
          </Button>

          <div className="bg-muted/50 p-4 rounded-lg">
            <h3 className="font-medium text-sm text-muted-foreground">
              Selected Type
            </h3>
            <p className="font-medium">{t(`${selectedType.name}.name`)}</p>
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Select subtype</h2>
            {subtypes.length > 0 ? (
              <div className="space-y-2">
                {subtypes.map((subtype) => (
                  <button
                    key={subtype.id}
                    className="w-full justify-between flex p-4 border rounded-md hover:bg-muted/50 transition-colors"
                    onClick={() => handleSubtypeSelect(subtype.id)}
                  >
                    <div className="text-left">
                      <div className="font-medium">
                        {t(
                          `${selectedType.name}.subtypes.${subtype.name}.name`
                        )}
                      </div>
                      {subtype.description && (
                        <div className="text-sm text-muted-foreground">
                          {t(
                            `${selectedType.name}.subtypes.${subtype.name}.description`
                          )}
                        </div>
                      )}
                    </div>
                    <CaretRight className="w-4 h-4 flex-shrink-0 my-auto" />
                  </button>
                ))}
              </div>
            ) : (
              <button
                className="w-full justify-between flex p-4 border rounded-md hover:bg-muted/50 transition-colors"
                onClick={() => handleTypeOnlySelect(selectedType.id)}
              >
                <div className="text-left">
                  <div className="font-medium">Continue without subtype</div>
                </div>
                <CaretRight className="w-4 h-4 flex-shrink-0 my-auto" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
