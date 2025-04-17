import { log } from "@/lib/logger";
import { createClient } from "@/lib/supabase/server";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import ReportFlow from "./components/report-flow";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("pages.reports.newReport");
  return {
    title: t("title"),
    description: t("title"),
  };
}

export default async function NewReportPage() {
  const supabase = await createClient();

  // Fetch incident types
  const { data: incidentTypes, error: incidentTypesError } = await supabase
    .from("incident_types")
    .select("*")
    .eq("active", true)
    .order("name");

  if (incidentTypesError) {
    log("Error fetching incident types", incidentTypesError);
  }

  // Fetch incident subtypes
  const { data: incidentSubtypes, error: incidentSubtypesError } =
    await supabase
      .from("incident_subtypes")
      .select("*")
      .eq("active", true)
      .order("name");

  if (incidentSubtypesError) {
    log("Error fetching incident subtypes", incidentSubtypesError);
  }

  log("Fetched data for report form", {
    incidentTypesCount: incidentTypes?.length || 0,
    incidentSubtypesCount: incidentSubtypes?.length || 0,
  });

  return (
    <ReportFlow
      incidentTypes={incidentTypes || []}
      incidentSubtypes={incidentSubtypes || []}
    />
  );
}
