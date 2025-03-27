import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import ReportFlow from "./components/report-flow";

export const metadata: Metadata = {
  title: "New Report",
  description: "Create a new incident report",
};

export default async function NewReportPage() {
  const t = await getTranslations("pages.newReport");

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">{t("takePhotoOrChooseImage")}</h1>
      <ReportFlow />
    </div>
  );
}
