"use client";

import { useReportStore } from "@/lib/store";
import { Textarea } from "@repo/ui/textarea";
import { createClient } from "@supabase/supabase-js";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const MAX_CHARS = 500;

export default function IncidentDescriptionStep() {
  const [description, setDescription] = useState(
    useReportStore.getState().reportData.description || ""
  );
  const [typeInfo, setTypeInfo] = useState<{
    typeName: string;
    subtypeName?: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const reportData = useReportStore((state) => state.reportData);
  const setCurrentStep = useReportStore((state) => state.setCurrentStep);
  const t = useTranslations("reportDrawer");
  const tIncident = useTranslations("incidentTypes");

  useEffect(() => {
    const fetchTypeInfo = async () => {
      console.log("Current reportData:", reportData); // Debug log

      if (!reportData.incidentTypeId) {
        console.log("No incident type ID found"); // Debug log
        setIsLoading(false);
        return;
      }

      try {
        console.log("Fetching type info for ID:", reportData.incidentTypeId); // Debug log

        // First fetch the incident type
        const { data: typeData, error: typeError } = await supabase
          .from("incident_types")
          .select("name")
          .eq("id", reportData.incidentTypeId)
          .single();

        console.log("Type Data Response:", typeData, "Error:", typeError); // Debug log

        if (typeError) throw typeError;

        // Then fetch the subtype if it exists
        let subtypeData = null;
        if (reportData.incidentSubtypeId) {
          console.log(
            "Fetching subtype info for ID:",
            reportData.incidentSubtypeId
          ); // Debug log

          const { data: subtype, error: subtypeError } = await supabase
            .from("incident_subtypes")
            .select("name")
            .eq("id", reportData.incidentSubtypeId)
            .single();

          console.log(
            "Subtype Data Response:",
            subtype,
            "Error:",
            subtypeError
          ); // Debug log

          if (subtypeError) throw subtypeError;
          subtypeData = subtype;
        }

        if (typeData) {
          console.log("Setting type info:", {
            typeName: typeData.name,
            subtypeName: subtypeData?.name,
          });

          setTypeInfo({
            typeName: typeData.name,
            subtypeName: subtypeData?.name,
          });
        }
      } catch (error) {
        console.error("Error fetching type info:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTypeInfo();
  }, [reportData.incidentTypeId, reportData.incidentSubtypeId]);

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

  const handleEditType = () => {
    setCurrentStep(2);
  };

  const charactersLeft = MAX_CHARS - description.length;

  if (isLoading) {
    return <div className="p-5">Loading...</div>;
  }

  return (
    <div className="space-y-4 px-5">
      {typeInfo && (
        <div className="bg-muted/50 p-4 rounded-lg space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">
              {tIncident(`${typeInfo.typeName}.name`)}
            </h3>
          </div>
          {typeInfo.subtypeName && (
            <p className="text-sm text-muted-foreground">
              {tIncident(
                `${typeInfo.typeName}.subtypes.${typeInfo.subtypeName}.name`
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
