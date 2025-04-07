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

  const { data: reports, error } = await supabase.from("reports").select("id");

  if (error) {
    console.error("Error fetching report:", error);
    return <div>Report not found</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Reports</h1>
      <div className="text-sm text-gray-500 mb-4">
        {reports.map((report) => (
          <div key={report.id}>
            <span>{report.id}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
