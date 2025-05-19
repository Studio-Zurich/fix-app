import { AppSidebar } from "@/components/app-sidebar";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import { SectionCards } from "@/components/section-cards";
import { SiteHeader } from "@/components/site-header";
import { createClient } from "@/lib/supabase/server";
import { SidebarInset, SidebarProvider } from "@repo/ui/sidebar";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";

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
  const tIncidentTypes = await getTranslations("incidentTypes");

  // Fetch reports with their incident types and subtypes
  const { data: reports, error } = await supabase
    .from("reports")
    .select(
      `
      id,
      incident_type_id,
      incident_subtype_id,
      status,
      location_address,
      created_at,
      reporter_first_name,
      reporter_last_name,
      reporter_email
    `
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching reports:", error);
    return <div>Error loading reports</div>;
  }

  // Get translated type name
  const getTranslatedType = (typeId: string) => {
    try {
      // Try to get translated name from translations
      return tIncidentTypes.raw(`types.${typeId}.name`) as string;
    } catch (error) {
      // Fall back if translation not found
      return "Unknown Type";
    }
  };

  // Get translated subtype name
  const getTranslatedSubtype = (typeId: string, subtypeId: string) => {
    try {
      // Try to get translated name from translations
      return tIncidentTypes.raw(
        `types.${typeId}.subtypes.${subtypeId}.name`
      ) as string;
    } catch (error) {
      // Fall back if translation not found
      return "Unknown Subtype";
    }
  };

  // Transform the data to match the DataTable expected format
  const tableData =
    reports?.map((report, index) => ({
      id: index + 1,
      header: getTranslatedType(report.incident_type_id),
      type: report.incident_subtype_id
        ? getTranslatedSubtype(
            report.incident_type_id,
            report.incident_subtype_id
          )
        : "None",
      status: report.status,
      target: report.location_address,
      limit: new Date(report.created_at).toLocaleDateString(),
      reviewer: `${report.reporter_first_name} ${report.reporter_last_name} (${report.reporter_email})`,
    })) || [];

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SectionCards />
              <div className="px-4 lg:px-6">
                <ChartAreaInteractive />
              </div>
              <DataTable data={tableData} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
