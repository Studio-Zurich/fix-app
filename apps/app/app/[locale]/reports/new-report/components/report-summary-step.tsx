"use client";

import { Location, ReportDescription, SelectedIncidentType } from "@/lib/types";
import { Button } from "@repo/ui/button";
import { useTranslations } from "next-intl";

interface ReportSummaryStepProps {
  files: File[];
  location: Location;
  selectedType: SelectedIncidentType;
  description?: ReportDescription;
  onBack: () => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
}

export default function ReportSummaryStep({
  files,
  location,
  selectedType,
  description,
  onBack,
  onSubmit,
  isSubmitting,
}: ReportSummaryStepProps) {
  const t = useTranslations("components.reportFlow");

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{t("summary.title")}</h3>

        {/* Images Summary */}
        <div className="space-y-2">
          <h4 className="font-medium">{t("summary.images")}</h4>
          <div className="space-y-1">
            {files.map((file, index) => (
              <div key={index} className="text-sm text-muted-foreground">
                {file.name} ({formatFileSize(file.size)})
              </div>
            ))}
          </div>
        </div>

        {/* Location Summary */}
        <div className="space-y-2">
          <h4 className="font-medium">{t("summary.location")}</h4>
          <p className="text-sm text-muted-foreground">{location.address}</p>
        </div>

        {/* Incident Type Summary */}
        <div className="space-y-2">
          <h4 className="font-medium">{t("summary.incidentType")}</h4>
          <div className="text-sm text-muted-foreground">
            <p>{selectedType.type.name}</p>
            {selectedType.subtype && (
              <p className="mt-1">{selectedType.subtype.name}</p>
            )}
          </div>
        </div>

        {/* Description Summary */}
        {description && (
          <div className="space-y-2">
            <h4 className="font-medium">{t("summary.description")}</h4>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {description.text}
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-between mt-6">
        <Button type="button" variant="outline" onClick={onBack}>
          {t("back")}
        </Button>
        <Button type="submit" onClick={onSubmit} disabled={isSubmitting}>
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              {t("uploading")}
            </div>
          ) : (
            t("submit")
          )}
        </Button>
      </div>
    </div>
  );
}
