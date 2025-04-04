"use client";

import { IncidentSubtypeType, IncidentTypeType } from "@/lib/types";
import { Checkbox } from "@repo/ui/checkbox";
import { Skeleton } from "@repo/ui/skeleton";
import { createClient } from "@supabase/supabase-js";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import StepHeader from "./step-header";
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface IncidentSubtypeProps {
  selectedType: IncidentTypeType;
  onSelect: (subtype: IncidentSubtypeType) => void;
  selectedSubtype?: IncidentSubtypeType;
}

export default function IncidentSubtype({
  selectedType,
  onSelect,
  selectedSubtype,
}: IncidentSubtypeProps) {
  const [subtypes, setSubtypes] = useState<IncidentSubtypeType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations("incidentTypes");
  const tReport = useTranslations("components.reportFlow");

  // Fetch subtypes
  useEffect(() => {
    const fetchSubtypes = async () => {
      try {
        const { data, error } = await supabase
          .from("incident_subtypes")
          .select("*")
          .eq("incident_type_id", selectedType.id)
          .eq("active", true);

        if (error) throw error;
        setSubtypes(data || []);
      } catch (err) {
        setError(t("errors.loadFailed"));
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubtypes();
  }, [selectedType.id, t]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-4 w-3/4" />
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="flex items-center space-x-3 p-4 border rounded-md"
            >
              <Skeleton className="w-6 h-6" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (error) return <div className="text-red-500">{error}</div>;

  // If there are no subtypes, don't render anything as we'll automatically proceed
  if (subtypes.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 flex-1">
      <StepHeader
        step={tReport("incidentSubtype.step")}
        description={tReport("incidentSubtype.description")}
      />
      <div className="text-sm text-muted-foreground">
        {t(`${selectedType.name}.name`)}
      </div>

      <div className="space-y-2">
        {subtypes.map((subtype) => (
          <div
            key={subtype.id}
            className="flex items-center space-x-3 p-4 border rounded-md hover:bg-muted/50 transition-colors cursor-pointer"
            onClick={() => onSelect(subtype)}
          >
            <Checkbox
              id={subtype.id}
              checked={selectedSubtype?.id === subtype.id}
              onCheckedChange={() => onSelect(subtype)}
              className="w-6 h-6"
            />
            <div className="flex-1">
              <label
                htmlFor={subtype.id}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                {t(`${selectedType.name}.subtypes.${subtype.name}.name`)}
              </label>
              {subtype.description && (
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
