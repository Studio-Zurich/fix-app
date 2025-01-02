"use client";

import { useReportStore } from "@/lib/store";
import { PencilSimple } from "@phosphor-icons/react";
import { Button } from "@repo/ui/button";
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

  const reportData = useReportStore((state) => state.reportData);
  const setCurrentStep = useReportStore((state) => state.setCurrentStep);
  const t = useTranslations("incidentTypes");

  useEffect(() => {
    const fetchTypeInfo = async () => {
      if (!reportData.incidentTypeId) return;

      try {
        const { data: typeData } = await supabase
          .from("incident_types")
          .select("name")
          .eq("id", reportData.incidentTypeId)
          .single();

        let subtypeName;
        if (reportData.incidentSubtypeId) {
          const { data: subtypeData } = await supabase
            .from("incident_subtypes")
            .select("name")
            .eq("id", reportData.incidentSubtypeId)
            .single();
          subtypeName = subtypeData?.name;
        }

        setTypeInfo({
          typeName: typeData?.name || "",
          subtypeName,
        });
      } catch (error) {
        console.error("Error fetching type info:", error);
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
    setCurrentStep(2); // Go back to incident type step
  };

  const charactersLeft = MAX_CHARS - description.length;

  return (
    <div className="space-y-4 px-5">
      {typeInfo && (
        <div className="bg-muted/50 p-4 rounded-lg space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">{t(`${typeInfo.typeName}.name`)}</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEditType}
              className="h-auto p-2"
            >
              <PencilSimple className="w-4 h-4" />
            </Button>
          </div>
          {typeInfo.subtypeName && (
            <p className="text-sm text-muted-foreground">
              {t(`${typeInfo.typeName}.subtypes.${typeInfo.subtypeName}.name`)}
            </p>
          )}
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold mb-2">Additional Details</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Please provide more information about the{" "}
          {typeInfo?.typeName.toLowerCase()}
        </p>
      </div>

      <div className="space-y-2">
        <Textarea
          placeholder="Describe the incident in more detail..."
          value={description}
          onChange={handleDescriptionChange}
          rows={6}
          className="resize-none"
        />
        <p className="text-sm text-muted-foreground text-right">
          {charactersLeft} characters remaining
        </p>
      </div>

      <div className="text-sm text-muted-foreground space-y-1">
        <p>Guidelines:</p>
        <ul className="list-disc list-inside pl-2">
          <li>Be specific and clear</li>
          <li>Avoid personal information</li>
          <li>Keep it respectful</li>
          <li>No swear words or offensive language</li>
        </ul>
      </div>
    </div>
  );
}
