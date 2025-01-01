"use client";

import { useReportStore } from "@/lib/store";
import { Car, TrashSimple, Tree, Warning } from "@phosphor-icons/react";
import { Button } from "@repo/ui/button";
import { useTranslations } from "next-intl";

interface QuickAccessReportsProps {
  onStartReport: () => void;
}

const quickReports = [
  {
    id: "vehicles_illegal_parking",
    type: "vehicles",
    icon: Car,
    incidentTypeId: "vehicles",
  },
  {
    id: "waste_general",
    type: "waste",
    icon: TrashSimple,
    incidentTypeId: "waste",
  },
  {
    id: "vegetation_general",
    type: "vegetation",
    icon: Tree,
    incidentTypeId: "vegetation",
  },
  {
    id: "feedback_general",
    type: "feedback",
    icon: Warning,
    incidentTypeId: "feedback",
  },
];

const QuickAccessReports = ({ onStartReport }: QuickAccessReportsProps) => {
  const t = useTranslations("incidentTypes");

  const handleQuickReport = (incidentTypeId: string, subtypeId: string) => {
    // Set the incident type and subtype in store
    useReportStore.setState((state) => ({
      reportData: {
        ...state.reportData,
        incidentTypeId,
        incidentSubtypeId: subtypeId,
      },
    }));
    // Skip to location step since we have the type
    useReportStore.setState({ currentStep: 1 });
    // Open the drawer
    onStartReport();
  };

  return (
    <div className="grid grid-cols-2 gap-2">
      {quickReports.map((report) => (
        <Button
          key={report.id}
          variant="outline"
          className="flex-shrink-0 flex flex-col items-center gap-1 h-auto py-3 px-4"
          onClick={() => handleQuickReport(report.incidentTypeId, report.id)}
        >
          <report.icon className="w-5 h-5" />
          <span className="text-xs whitespace-nowrap">
            {t(`${report.type}.subtypes.${report.id}.name`)}
          </span>
        </Button>
      ))}
    </div>
  );
};

export default QuickAccessReports;
