"use client";

import { submitReport } from "@/app/[locale]/actions";
import { useRouter } from "@/i18n/routing";
import { useReportStore } from "@/lib/store";
import { createClient } from "@/lib/supabase/client";
import {
  Buildings,
  Camera,
  EnvelopeSimple,
  MapPin,
  Phone,
  TextT,
  User,
} from "@phosphor-icons/react";
import { Separator } from "@repo/ui/separator";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import SummaryMapPreview from "./summary-map-preview";

interface IncidentType {
  id: string;
  name: string;
  description: string | null;
}

interface IncidentSubtype {
  id: string;
  incident_type_id: string;
  name: string;
  description: string | null;
}

interface DepartmentInfo {
  departmentName: string;
  email: string;
  phone?: string;
}

export default function SummaryStep() {
  const [selectedType, setSelectedType] = useState<IncidentType | null>(null);
  const [selectedSubtype, setSelectedSubtype] =
    useState<IncidentSubtype | null>(null);
  const [departmentInfo, setDepartmentInfo] = useState<DepartmentInfo | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reportData = useReportStore((state) => state.reportData);
  const location = useReportStore((state) => state.location);
  const images = useReportStore((state) => state.images);
  const imagesMetadata = useReportStore((state) => state.imagesMetadata);
  const selectedTypeId = useReportStore((state) => state.selectedTypeId);
  const selectedSubtypeId = useReportStore((state) => state.selectedSubtypeId);
  const setCurrentStep = useReportStore((state) => state.setCurrentStep);

  const router = useRouter();
  const t = useTranslations("incidentTypes");
  const tSummary = useTranslations("summaryStepComponent");

  // Fetch incident type, subtype, and department info
  useEffect(() => {
    const fetchInfo = async () => {
      if (!selectedTypeId || !location) return;

      const supabase = createClient();

      try {
        // Fetch incident type
        const { data: typeData, error: typeError } = await supabase
          .from("incident_types")
          .select("*")
          .eq("id", selectedTypeId)
          .single();

        if (typeError) throw typeError;
        setSelectedType(typeData);

        // Fetch subtype if exists
        if (selectedSubtypeId) {
          const { data: subtypeData, error: subtypeError } = await supabase
            .from("incident_subtypes")
            .select("*")
            .eq("id", selectedSubtypeId)
            .single();

          if (subtypeError) throw subtypeError;
          setSelectedSubtype(subtypeData);
        }

        // Fetch department info based on incident mapping
        const { data: mappingData } = await supabase
          .from("incident_mapping")
          .select(
            `
            government_departments (
              department_name,
              email,
              phone,
              description
            )
          `
          )
          .eq("canton", "Zug")
          .eq("incident_type_id", selectedTypeId)
          .eq(
            selectedSubtypeId ? "incident_subtype_id" : "is_default",
            selectedSubtypeId || true
          )
          .single();

        if (mappingData?.government_departments?.[0]) {
          const dept = mappingData.government_departments[0];
          setDepartmentInfo({
            departmentName: dept.department_name,
            email: dept.email,
            phone: dept.phone,
          });
        }
      } catch (error) {
        console.error("Error fetching info:", error);
      }
    };

    fetchInfo();
  }, [selectedTypeId, selectedSubtypeId, location]);

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      // Convert blob URLs to actual blobs first
      const imageData = await Promise.all(
        images.map(async (imageUrl, index) => {
          const metadata = imagesMetadata[imageUrl];
          if (!metadata?.fileInfo) {
            throw new Error(`Missing metadata for image ${index + 1}`);
          }

          // Get the actual blob from the blob URL
          const response = await fetch(imageUrl);
          if (!response.ok) {
            throw new Error(`Failed to fetch image ${index + 1}`);
          }
          const blob = await response.blob();

          return {
            previewUrl: imageUrl,
            storagePath: `reports/${Date.now()}-${index}`,
            fileName: `image-${index + 1}.${metadata.fileInfo.format.toLowerCase()}`,
            fileType:
              metadata.fileInfo.format.toLowerCase() === "png"
                ? "image/png"
                : "image/jpeg",
            fileSize: blob.size,
            blob,
          };
        })
      );

      // Submit report with image data
      const result = await submitReport({
        ...reportData,
        location: location!,
        images: imageData.map(({ blob, ...rest }) => rest),
        incidentTypeId: selectedTypeId!,
        incidentSubtypeId: selectedSubtypeId || undefined,
        reporterFirstName: reportData.reporterFirstName || "",
        reporterLastName: reportData.reporterLastName || "",
        reporterEmail: reportData.reporterEmail || "",
        reporterPhone: reportData.reporterPhone || "",
      });

      if (!result.success || !result.reportId) {
        throw new Error(result.error || "Failed to get report ID");
      }

      setCurrentStep(7);
    } catch (error) {
      console.error("Error submitting report:", error);
      setError(
        error instanceof Error ? error.message : "Failed to submit report"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 px-5">
      <div className="space-y-6">
        {/* Images Section */}
        {images.length > 0 && (
          <>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Camera className="w-4 h-4 text-primary" weight="fill" />
                <h3 className="font-medium">{tSummary("images")}</h3>
              </div>
              <div className="pl-6 flex gap-2">
                {images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Report image ${index + 1}`}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                ))}
              </div>
            </div>
            <Separator />
          </>
        )}

        {/* Location Section */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-primary" weight="fill" />
            <h3 className="font-medium">{tSummary("location")}</h3>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground pl-6">
              {location?.address || tSummary("noLocationProvided")}
            </p>
            {location && (
              <div className="pl-6">
                <SummaryMapPreview location={location} />
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Incident Type Section */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <TextT className="w-4 h-4 text-primary" weight="fill" />
            <h3 className="font-medium">{tSummary("incidentType")}</h3>
          </div>
          <div className="pl-6 space-y-1">
            {selectedType && (
              <>
                <p className="text-sm font-medium">
                  {t(`${selectedType.name}.name`)}
                </p>
                {selectedSubtype && (
                  <p className="text-sm text-muted-foreground">
                    {t(
                      `${selectedType.name}.subtypes.${selectedSubtype.name}.name`
                    )}
                  </p>
                )}
              </>
            )}
          </div>
        </div>

        <Separator />

        {/* Description Section */}
        {reportData.description && (
          <>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <TextT className="w-4 h-4 text-primary" weight="fill" />
                <h3 className="font-medium">{tSummary("description")}</h3>
              </div>
              <p className="text-sm text-muted-foreground pl-6 whitespace-pre-line">
                {reportData.description}
              </p>
            </div>
            <Separator />
          </>
        )}

        {/* Contact Information Section */}
        {(reportData.reporterFirstName ||
          reportData.reporterLastName ||
          reportData.reporterEmail ||
          reportData.reporterPhone) && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-primary" weight="fill" />
              <h3 className="font-medium">{tSummary("contactInformation")}</h3>
            </div>
            <div className="pl-6 space-y-2">
              {reportData.reporterFirstName && (
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <p className="text-sm">
                    {tSummary("firstName")}: {reportData.reporterFirstName}
                  </p>
                </div>
              )}
              {reportData.reporterLastName && (
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <p className="text-sm">
                    {tSummary("lastName")}: {reportData.reporterLastName}
                  </p>
                </div>
              )}
              {reportData.reporterEmail && (
                <div className="flex items-center space-x-2">
                  <EnvelopeSimple
                    className="w-4 h-4 text-muted-foreground"
                    weight="fill"
                  />
                  <p className="text-sm">
                    {tSummary("email")}: {reportData.reporterEmail}
                  </p>
                </div>
              )}
              {reportData.reporterPhone && (
                <div className="flex items-center space-x-2">
                  <Phone
                    className="w-4 h-4 text-muted-foreground"
                    weight="fill"
                  />
                  <p className="text-sm">
                    {tSummary("phone")}: {reportData.reporterPhone}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Department Section - Show only if department info is available */}
        {departmentInfo && (
          <>
            <Separator />
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Buildings className="w-4 h-4 text-primary" weight="fill" />
                <h3 className="font-medium">
                  {tSummary("responsibleDepartment")}
                </h3>
              </div>
              <div className="pl-6 space-y-1">
                <p className="text-sm font-medium">
                  {departmentInfo.departmentName}
                </p>
                <p className="text-sm text-muted-foreground">
                  Email: {departmentInfo.email}
                </p>
                {departmentInfo.phone && (
                  <p className="text-sm text-muted-foreground">
                    Phone: {departmentInfo.phone}
                  </p>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {error && (
        <div className="text-sm text-destructive">
          {tSummary("error")}: {error}
        </div>
      )}
    </div>
  );
}
