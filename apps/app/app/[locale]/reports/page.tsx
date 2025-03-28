import { Link } from "@/i18n/routing";
import { Metadata } from "next";
import { useTranslations } from "next-intl";

export const metadata: Metadata = {
  title: "Reports",
  description: "View all incident reports",
};

export default function ReportsPage() {
  const t = useTranslations("pages.reports");

  return (
    <>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">{t("title")}</h1>
          <Link
            href="/reports/new-report"
            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90"
          >
            {t("title")}
          </Link>
        </div>
        {/* Report list will go here */}
        <div className="grid gap-4">
          {/* TODO: Add report list component */}
        </div>
      </div>
    </>
  );
}
