"use client";

import { submitReport } from "@/app/[locale]/actions";
import { useRouter } from "@/i18n/routing";
import { useReportStore } from "@/lib/store";
import { createClient } from "@/lib/supabase/client";
import {
  Camera,
  EnvelopeSimple,
  MapPin,
  Phone,
  TextT,
  User,
} from "@phosphor-icons/react";
import { Button } from "@repo/ui/button";
import { Separator } from "@repo/ui/separator";
import { useEffect, useState } from "react";

interface IncidentTypeInfo {
  name: string;
  subtype?: string;
}

export default function SummaryStep() {
  const reportData = useReportStore((state) => state.reportData);
  const location = useReportStore((state) => state.location);
  const images = useReportStore((state) => state.images);
  const imagesMetadata = useReportStore((state) => state.imagesMetadata);
  const setCurrentStep = useReportStore((state) => state.setCurrentStep);
  const [incidentInfo, setIncidentInfo] = useState<IncidentTypeInfo | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Fetch incident type and subtype names
  useEffect(() => {
    const fetchIncidentInfo = async () => {
      if (!reportData.incidentTypeId) return;

      const supabase = createClient();

      try {
        // Fetch incident type
        const { data: typeData } = await supabase
          .from("incident_types")
          .select("name")
          .eq("id", reportData.incidentTypeId)
          .single();

        // Fetch subtype if it exists
        let subtypeName;
        if (reportData.incidentSubtypeId) {
          const { data: subtypeData } = await supabase
            .from("incident_subtypes")
            .select("name")
            .eq("id", reportData.incidentSubtypeId)
            .single();
          subtypeName = subtypeData?.name;
        }

        setIncidentInfo({
          name: typeData?.name || "Unknown Type",
          subtype: subtypeName,
        });
      } catch (error) {
        console.error("Error fetching incident info:", error);
      }
    };

    fetchIncidentInfo();
  }, [reportData.incidentTypeId, reportData.incidentSubtypeId]);

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
            blob, // Pass the blob to the server action
          };
        })
      );

      // Submit report with image data
      const result = await submitReport({
        ...reportData,
        location: location!,
        images: imageData.map(({ blob, ...rest }) => rest), // Remove blob before sending to server
        incidentTypeId: reportData.incidentTypeId!,
        incidentSubtypeId: reportData.incidentSubtypeId!,
        reporterFirstName: reportData.reporterFirstName || "",
        reporterLastName: reportData.reporterLastName || "",
        reporterEmail: reportData.reporterEmail || "",
        reporterPhone: reportData.reporterPhone || "",
      });

      if (!result.success || !result.reportId) {
        throw new Error(result.error || "Failed to get report ID");
      }

      // Move to confirm step
      setCurrentStep(6);
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
    <div className="space-y-6 pb-24">
      <div>
        <h2 className="text-lg font-semibold">Summary</h2>
        <p className="text-sm text-muted-foreground">
          Please review your report before submitting
        </p>
      </div>

      <div className="space-y-6">
        {/* Images Section */}
        {images.length > 0 && (
          <>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Camera className="w-4 h-4 text-primary" weight="fill" />
                <h3 className="font-medium">Images</h3>
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
            <h3 className="font-medium">Location</h3>
          </div>
          <p className="text-sm text-muted-foreground pl-6">
            {location?.address || "No location provided"}
          </p>
        </div>

        <Separator />

        {/* Incident Type Section */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <TextT className="w-4 h-4 text-primary" weight="fill" />
            <h3 className="font-medium">Incident Type</h3>
          </div>
          <div className="pl-6 space-y-1">
            <p className="text-sm">{incidentInfo?.name}</p>
            {incidentInfo?.subtype && (
              <p className="text-sm text-muted-foreground">
                Subtype: {incidentInfo.subtype}
              </p>
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
                <h3 className="font-medium">Description</h3>
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
              <h3 className="font-medium">Contact Information</h3>
            </div>
            <div className="pl-6 space-y-2">
              {reportData.reporterFirstName && (
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <p className="text-sm">
                    First Name: {reportData.reporterFirstName}
                  </p>
                </div>
              )}
              {reportData.reporterLastName && (
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <p className="text-sm">
                    Last Name: {reportData.reporterLastName}
                  </p>
                </div>
              )}
              {reportData.reporterEmail && (
                <div className="flex items-center space-x-2">
                  <EnvelopeSimple
                    className="w-4 h-4 text-muted-foreground"
                    weight="fill"
                  />
                  <p className="text-sm">Email: {reportData.reporterEmail}</p>
                </div>
              )}
              {reportData.reporterPhone && (
                <div className="flex items-center space-x-2">
                  <Phone
                    className="w-4 h-4 text-muted-foreground"
                    weight="fill"
                  />
                  <p className="text-sm">Phone: {reportData.reporterPhone}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {error && <div className="text-sm text-destructive">Error: {error}</div>}

      <div className="fixed bottom-4 left-4 right-4">
        <Button
          className="w-full"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Submit Report"}
        </Button>
      </div>
    </div>
  );
}
