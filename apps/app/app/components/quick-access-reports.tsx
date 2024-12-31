"use client";

import { useRouter } from "@/i18n/routing";
import { Car, TrashSimple, Tree, Warning } from "@phosphor-icons/react";
import { Button } from "@repo/ui/button";
import { useTranslations } from "next-intl";

const quickReports = [
  {
    id: "parking",
    icon: Car,
    translationKey: "quickReports.parking",
    incidentTypeId: "some-uuid-1",
  },
  {
    id: "littering",
    icon: TrashSimple,
    translationKey: "quickReports.littering",
    incidentTypeId: "some-uuid-2",
  },
  {
    id: "vegetation",
    icon: Tree,
    translationKey: "quickReports.vegetation",
    incidentTypeId: "some-uuid-3",
  },
  {
    id: "other",
    icon: Warning,
    translationKey: "quickReports.other",
    incidentTypeId: "some-uuid-4",
  },
];

const QuickAccessReports = () => {
  const router = useRouter();
  const t = useTranslations();

  const handleQuickReport = (incidentTypeId: string) => {
    // Here you would typically set the incident type in your store
    router.push(`/report`);
  };

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
      {quickReports.map((report) => (
        <Button
          key={report.id}
          variant="outline"
          className="flex-shrink-0 flex flex-col items-center gap-1 h-auto py-3 px-4"
          onClick={() => handleQuickReport(report.incidentTypeId)}
        >
          <report.icon className="w-5 h-5" />
          <span className="text-xs whitespace-nowrap">
            {t(report.translationKey)}
          </span>
        </Button>
      ))}
    </div>
  );
};

export default QuickAccessReports;
