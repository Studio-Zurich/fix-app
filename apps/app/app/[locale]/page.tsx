import { Link } from "@/i18n/routing";
import { Button } from "@repo/ui/button";
import { getTranslations } from "next-intl/server";
import Greeting from "./components/greeting";

export default async function DashboardPage() {
  const t = await getTranslations();
  return (
    <>
      <Greeting />

      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <Link href="/reports/new-report">
            <Button>{t("ui.newReportButton")}</Button>
          </Link>
        </div>
      </div>
    </>
  );
}
