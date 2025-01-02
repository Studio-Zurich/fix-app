"use client";

import { useReportStore } from "@/lib/store";
import { MagnifyingGlass } from "@phosphor-icons/react";
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
  const [isEditing, setIsEditing] = useState(false);

  const { setCurrentStep, setStepValidation, setIsSelectingSubtype } =
    useReportStore();
  const reportData = useReportStore((state) => state.reportData);
  const isSelectingSubtype = useReportStore(
    (state) => state.isSelectingSubtype
  );
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

        // If we have a pre-selected type (from quick access), load it
        if (reportData.incidentTypeId) {
          const selectedType = data.find(
            (type) => type.id === reportData.incidentTypeId
          );
          if (selectedType) {
            setSelectedType(selectedType);
            await fetchSubtypes(selectedType.id);
          }
        }
      } catch (err) {
        setError("Failed to load incident types");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTypes();
  }, [reportData.incidentTypeId]);

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

  const fetchSubtypes = useCallback(async (typeId: string) => {
    try {
      const { data, error } = await supabase
        .from("incident_subtypes")
        .select("*")
        .eq("incident_type_id", typeId)
        .eq("active", true);

      if (error) throw error;
      setSubtypes(data || []);
      return data;
    } catch (err) {
      setError("Failed to load subtypes");
      console.error(err);
      return null;
    }
  }, []);

  const handleTypeSelect = async (type: IncidentType) => {
    setSelectedType(type);
    setSubtypes([]);
    useReportStore.setState((state) => ({
      reportData: {
        ...state.reportData,
        incidentTypeId: type.id,
        incidentSubtypeId: undefined,
      },
    }));
    setStepValidation("incidentType", false);

    const subtypesResult = await fetchSubtypes(type.id);
    if (subtypesResult && subtypesResult.length > 0) {
      setIsSelectingSubtype(true);
    } else {
      // If no subtypes, proceed to next step
      setStepValidation("incidentType", true);
      setCurrentStep(3);
    }
  };

  const handleSubtypeSelect = (subtypeId: string) => {
    useReportStore.setState((state) => ({
      reportData: {
        ...state.reportData,
        incidentTypeId: selectedType?.id,
        incidentSubtypeId: subtypeId,
      },
    }));
    setStepValidation("incidentType", true);
    setCurrentStep(3);
  };

  const handleBackFromSubtypes = () => {
    setIsSelectingSubtype(false);
    setSelectedType(null);
    setSubtypes([]);
    useReportStore.setState((state) => ({
      reportData: {
        ...state.reportData,
        incidentTypeId: undefined,
        incidentSubtypeId: undefined,
      },
    }));
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  // If we have a selected type and there are subtypes, show subtype selection
  if (selectedType && subtypes.length > 0 && isSelectingSubtype) {
    return (
      <div className="space-y-4 px-5">
        <div className="bg-muted/50 p-4 rounded-lg space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">{t(`${selectedType.name}.name`)}</h3>
            <button
              onClick={handleBackFromSubtypes}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Change type
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Select subtype</h2>
          {subtypes.map((subtype) => (
            <button
              key={subtype.id}
              className="w-full justify-between flex p-4 border rounded-md hover:bg-muted/50 transition-colors"
              onClick={() => handleSubtypeSelect(subtype.id)}
            >
              <div className="text-left">
                <div className="font-medium">
                  {t(`${selectedType.name}.subtypes.${subtype.name}.name`)}
                </div>
                {subtype.description && (
                  <div className="text-sm text-muted-foreground">
                    {t(
                      `${selectedType.name}.subtypes.${subtype.name}.description`
                    )}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Show type selection
  return (
    <div className="space-y-4 px-5">
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
          </button>
        ))}
      </div>
    </div>
  );
}
