import { createClient } from "@/lib/supabase/server";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import OverviewMap from "./components/overview-map";

interface ReportsPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({
  params,
}: ReportsPageProps): Promise<Metadata> {
  await params;
  const t = await getTranslations("pages.reports.list");
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function ReportsPage({ params }: ReportsPageProps) {
  await params;
  const supabase = await createClient();

  // Fetch reports with their incident types and subtypes
  const { data: reports, error } = await supabase
    .from("reports")
    .select(
      `
      *,
      incident_types:incident_type_id (name),
      incident_subtypes:incident_subtype_id (name),
      description
    `
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching reports:", error);
    return <div>Error loading reports</div>;
  }

  return (
    <>
      <OverviewMap reports={reports || []} />
    </>
  );
}
