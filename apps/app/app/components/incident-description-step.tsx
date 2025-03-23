"use client";

import { useReportStore } from "@/lib/store";
import { Textarea } from "@repo/ui/textarea";
import { createClient } from "@supabase/supabase-js";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

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

const MAX_CHARS = 500;

export default function IncidentDescriptionStep() {
  const [description, setDescription] = useState(
    useReportStore.getState().reportData.description || ""
  );
  const [selectedType, setSelectedType] = useState<IncidentType | null>(null);
  const [selectedSubtype, setSelectedSubtype] =
    useState<IncidentSubtype | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const selectedTypeId = useReportStore((state) => state.selectedTypeId);
  const selectedSubtypeId = useReportStore((state) => state.selectedSubtypeId);
  const t = useTranslations("reportDrawer");
  const tIncident = useTranslations("incidentTypes");

  useEffect(() => {
    const fetchTypeAndSubtype = async () => {
      if (!selectedTypeId) {
        setIsLoading(false);
        return;
      }

      try {
        // Fetch type
        const { data: typeData, error: typeError } = await supabase
          .from("incident_types")
          .select("*")
          .eq("id", selectedTypeId)
          .single();

        if (typeError) throw typeError;
        setSelectedType(typeData);

        // Fetch subtype if exists
        if (selectedSubtypeId) {
          const { data: subtypeData, error: subtypeError } = await supabase
            .from("incident_subtypes")
            .select("*")
            .eq("id", selectedSubtypeId)
            .single();

          if (subtypeError) throw subtypeError;
          setSelectedSubtype(subtypeData);
        }
      } catch (error) {
        console.error("Error fetching type/subtype:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTypeAndSubtype();
  }, [selectedTypeId, selectedSubtypeId]);

  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const value = e.target.value;
    if (value.length <= MAX_CHARS) {
      setDescription(value);
      useReportStore.setState((state) => ({
        reportData: {
          ...state.reportData,
          description: value,
        },
      }));
    }
  };

  const charactersLeft = MAX_CHARS - description.length;

  if (isLoading) {
    return <div className="p-5">Loading...</div>;
  }

  return (
    <div className="space-y-4 px-5">
      {selectedType && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">
              {tIncident(`${selectedType.name}.name`)}
            </h3>
          </div>
          {selectedSubtype && (
            <p className="text-sm text-muted-foreground">
              {tIncident(
                `${selectedType.name}.subtypes.${selectedSubtype.name}.name`
              )}
            </p>
          )}
        </div>
      )}

      <div className="space-y-2">
        <Textarea
          placeholder={t("steps.description.placeholder")}
          value={description}
          onChange={handleDescriptionChange}
          rows={6}
          className="resize-none"
        />
        <p className="text-sm text-muted-foreground text-right">
          {charactersLeft} {t("steps.description.charactersLeft")}
        </p>
      </div>

      <div className="text-sm text-muted-foreground space-y-1">
        <p>{t("steps.description.guidelines.title")}:</p>
        <ul className="list-disc list-inside pl-2">
          <li>{t("steps.description.guidelines.specific")}</li>
          <li>{t("steps.description.guidelines.noPersonalInfo")}</li>
          <li>{t("steps.description.guidelines.respectful")}</li>
          <li>{t("steps.description.guidelines.noOffensive")}</li>
        </ul>
      </div>
    </div>
  );
}
