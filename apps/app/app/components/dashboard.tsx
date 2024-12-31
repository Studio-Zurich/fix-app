"use client";

import { useRouter } from "@/i18n/routing";
import { Plus } from "@phosphor-icons/react";
import { Button } from "@repo/ui/button";
import { useTranslations } from "next-intl";
import MapOverview from "./map-overview";
import QuickAccessReports from "./quick-access-reports";

const Dashboard = () => {
  const router = useRouter();
  const t = useTranslations("DashboardPage");

  return (
    <div className="space-y-6 p-4">
      <Button
        className="w-full h-auto py-6 flex flex-col items-center gap-2"
        onClick={() => router.push(`/report`)}
      >
        <Plus className="w-6 h-6" />
        <span>{t("newReport")}</span>
      </Button>

      <div className="space-y-2">
        <h2 className="text-lg font-semibold">{t("overview")}</h2>
        <MapOverview />
      </div>

      <div className="space-y-2">
        <h2 className="text-lg font-semibold">{t("quickReports")}</h2>
        <QuickAccessReports />
      </div>
    </div>
  );
};

export default Dashboard;
