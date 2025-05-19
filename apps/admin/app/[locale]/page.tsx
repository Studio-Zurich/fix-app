import { AppSidebar } from "@/components/app-sidebar";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import { SectionCards } from "@/components/section-cards";
import { SiteHeader } from "@/components/site-header";
import { createClient } from "@/lib/supabase/server";
import { SidebarInset, SidebarProvider } from "@repo/ui/sidebar";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import data from "./data.json";

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
  const {
    data:
      // reports,
      error,
  } = await supabase
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
              <DataTable data={data} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
