"use client";

import {
  Location,
  ReportDescription,
  SelectedIncidentTypeType,
  UserData,
} from "@/lib/types";
import { Pencil } from "@phosphor-icons/react";
import { Button } from "@repo/ui/button";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

interface ReportSummaryProps {
  files: File[];
  location: Location;
  selectedType: SelectedIncidentTypeType;
  description?: ReportDescription;
  onBack: () => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  userData: UserData;
  onEditImages: () => void;
  onEditLocation: () => void;
  onEditType: () => void;
  onEditDescription: () => void;
  onEditUserData: () => void;
}

export default function ReportSummary({
  files,
  location,
  selectedType,
  description,
  onBack,
  onSubmit,
  isSubmitting,
  userData,
  onEditImages,
  onEditLocation,
  onEditType,
  onEditDescription,
  onEditUserData,
}: ReportSummaryProps) {
  const t = useTranslations("components.reportFlow");
  const [previews, setPreviews] = useState<string[]>([]);

  // Generate previews when files change
  useEffect(() => {
    const generatePreviews = async () => {
      const newPreviews = await Promise.all(
        files.map((file) => {
          return new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              resolve(reader.result as string);
            };
            reader.readAsDataURL(file);
          });
        })
      );
      setPreviews(newPreviews);
    };

    generatePreviews();
  }, [files]);

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
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-medium">{t("summary.images")}</h4>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onEditImages}
              className="h-8 w-8 p-0"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {previews.map((preview, index) => (
              <div key={index} className="relative">
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <div className="mt-1 text-sm text-muted-foreground">
                  {files[index]?.name} (
                  {formatFileSize(files[index]?.size || 0)})
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Location Summary */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h4 className="font-medium">{t("summary.location")}</h4>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onEditLocation}
              className="h-8 w-8 p-0"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">{location.address}</p>
        </div>

        {/* Incident Type Summary */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h4 className="font-medium">{t("summary.incidentType")}</h4>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onEditType}
              className="h-8 w-8 p-0"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
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
            <div className="flex justify-between items-center">
              <h4 className="font-medium">{t("summary.description")}</h4>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onEditDescription}
                className="h-8 w-8 p-0"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {description.text}
            </p>
          </div>
        )}

        {/* User Data Summary */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h4 className="font-medium">{t("summary.contactInfo")}</h4>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onEditUserData}
              className="h-8 w-8 p-0"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>
              {userData.firstName} {userData.lastName}
            </p>
            <p>{userData.email}</p>
            {userData.phone && <p>{userData.phone}</p>}
          </div>
        </div>
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
