import { Link } from "@/i18n/routing";
import { Button } from "@repo/ui/button";
import { getTranslations } from "next-intl/server";

export default async function DashboardPage() {
  const t = await getTranslations();
  return (
    <div>
      <h1>{t("pages.dashboard.title")}</h1>
      <Link href="/reports/new-report">
        <Button>{t("ui.newReportButton")}</Button>
      </Link>
    </div>
  );
}
