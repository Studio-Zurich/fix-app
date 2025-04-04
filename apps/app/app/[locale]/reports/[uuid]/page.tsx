import { createClient } from "@/lib/supabase/server";
import { Metadata } from "next";

interface ReportPageProps {
  params: {
    uuid: string;
  };
}

export async function generateMetadata({
  params,
}: ReportPageProps): Promise<Metadata> {
  return {
    title: `Report ${params.uuid}`,
    description: "View or edit incident report",
  };
}

export default async function ReportPage({ params }: ReportPageProps) {
  const supabase = await createClient();

  const { data: report, error } = await supabase
    .from("reports")
    .select("id")
    .eq("id", params.uuid)
    .single();

  if (error) {
    console.error("Error fetching report:", error);
    return <div>Report not found</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Report Details</h1>
      <div className="text-sm text-gray-500 mb-4">Report ID: {report.id}</div>
    </div>
  );
}
