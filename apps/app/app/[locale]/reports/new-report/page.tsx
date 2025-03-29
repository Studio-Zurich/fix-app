import PageHeader from "@/components/page-header";
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
    <>
      <PageHeader variant="flow" title={t("title")} />
      <ReportFlow />
    </>
  );
}
