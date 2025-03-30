"use client";

import { IncidentTypeType } from "@/lib/types";
import { MagnifyingGlass } from "@phosphor-icons/react";
import { Checkbox } from "@repo/ui/checkbox";
import { Input } from "@repo/ui/input";
import { Skeleton } from "@repo/ui/skeleton";
import { createClient } from "@supabase/supabase-js";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import StepHeader from "./step-header";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface IncidentTypeProps {
  onSelect: (type: IncidentTypeType) => void;
  selectedType?: IncidentTypeType;
  onSubtypesLoaded?: (hasSubtypes: boolean) => void;
}

export default function IncidentType({
  onSelect,
  selectedType,
  onSubtypesLoaded,
}: IncidentTypeProps) {
  const [types, setTypes] = useState<IncidentTypeType[]>([]);
  const [filteredTypes, setFilteredTypes] = useState<IncidentTypeType[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations("incidentTypes");
  const tReport = useTranslations("components.reportFlow");

  // Fetch incident types and their subtypes
  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const { data: typesData, error: typesError } = await supabase
          .from("incident_types")
          .select("*")
          .eq("active", true);

        if (typesError) throw typesError;

        // Fetch subtypes for each type
        const typesWithSubtypes = await Promise.all(
          typesData.map(async (type) => {
            const { data: subtypesData, error: subtypesError } = await supabase
              .from("incident_subtypes")
              .select("id")
              .eq("incident_type_id", type.id)
              .eq("active", true)
              .limit(1);

            if (subtypesError) throw subtypesError;

            return {
              ...type,
              has_subtypes: subtypesData && subtypesData.length > 0,
            };
          })
        );

        setTypes(typesWithSubtypes);
        setFilteredTypes(typesWithSubtypes);
      } catch (err) {
        setError(t("errors.loadFailed"));
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTypes();
  }, [t]);

  // Notify parent about subtypes when a type is selected
  useEffect(() => {
    if (selectedType && onSubtypesLoaded) {
      onSubtypesLoaded(selectedType.has_subtypes);
    }
  }, [selectedType, onSubtypesLoaded]);

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

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="relative">
          <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Skeleton className="h-10 w-full" />
        </div>
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

  return (
    <div className="space-y-4">
      <StepHeader
        step={tReport("incidentType.step")}
        description={tReport("incidentType.description")}
      />
      <div className="relative">
        <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder={t("searchIncidentTypes")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="space-y-2 h-[calc(100svh-258px)] overflow-y-auto pb-[33px]">
        {filteredTypes.map((type) => (
          <div
            key={type.id}
            className="flex items-center space-x-3 p-4 border rounded-md hover:bg-muted/50 transition-colors cursor-pointer"
            onClick={() => onSelect(type)}
          >
            <Checkbox
              id={type.id}
              checked={selectedType?.id === type.id}
              onCheckedChange={() => onSelect(type)}
              className="w-6 h-6"
            />
            <div className="flex-1">
              <label
                htmlFor={type.id}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                {t(`${type.name}.name`)}
              </label>
              {type.description && (
                <p className="text-sm text-muted-foreground">
                  {t(`${type.name}.description`)}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
