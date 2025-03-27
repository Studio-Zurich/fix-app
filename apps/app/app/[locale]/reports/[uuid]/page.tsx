import { Metadata } from "next";
import { useTranslations } from "next-intl";

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

export default function ReportPage({ params }: ReportPageProps) {
  const t = useTranslations("Report");

  // TODO: Fetch report data using the UUID
  // If report not found, redirect to 404 -> then show that we do not have a report, yet

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">{t("reportDetails")}</h1>
      <div className="text-sm text-gray-500 mb-4">
        {t("reportId")}: {params.uuid}
      </div>
    </div>
  );
}
