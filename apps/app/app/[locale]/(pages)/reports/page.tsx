import PageHeader from "@/components/page-header";
import ReportPreview from "@/components/report-preview";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { Metadata } from "next";

interface ReportsPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({
  params,
}: ReportsPageProps): Promise<Metadata> {
  await params;
  return {
    title: "Reports",
    description: "View all incident reports",
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
      incident_subtypes:incident_subtype_id (name)
    `
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching reports:", error);
    return <div>Error loading reports</div>;
  }

  return (
    <>
      <PageHeader
        title="Current Reports"
        description="View all incident reports"
      />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {reports.map((report) => (
          <Link
            href={`/reports/${report.id}`}
            key={report.id}
            className="h-full"
          >
            <ReportPreview report={report} />
          </Link>
        ))}
      </div>
    </>
  );
}
