import PageHeader from "@/components/page-header";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@repo/ui/badge";

import { reportStore } from "@/lib/store";
import { GearFine } from "@phosphor-icons/react/dist/ssr";
import { TypographyH2 } from "@repo/ui/headline";
import { Popover, PopoverContent, PopoverTrigger } from "@repo/ui/popover";
import { TypographyParagraph } from "@repo/ui/text";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import Notification from "./components/notification";

interface ReportPageProps {
  params: Promise<{
    locale: string;
    uuid: string;
  }>;
}

export async function generateMetadata({
  params,
}: ReportPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const t = await getTranslations("pages.reports.detail");
  return {
    title: `${t("title")} ${resolvedParams.uuid}`,
    description: t("title"),
  };
}

export default async function ReportPage({ params }: ReportPageProps) {
  const resolvedParams = await params;
  const supabase = await createClient();
  const t = await getTranslations("pages.reports.detail");
  const tIncidentTypes = await getTranslations("incidentTypes");

  const { data: report, error } = await supabase
    .from("reports")
    .select(
      `
      *,
      incident_types:incident_type_id (id, name),
      incident_subtypes:incident_subtype_id (id, name)
    `
    )
    .eq("id", resolvedParams.uuid)
    .single();

  if (error) {
    console.error("Error fetching report:", error);
    return <div>Report not found</div>;
  }

  // Get translated type name
  const getTranslatedType = (typeId: string) => {
    try {
      // Try to get translated name from translations
      const translatedName = tIncidentTypes.raw(`types.${typeId}.name`);
      return translatedName as string;
    } catch (error) {
      // Fall back to database name if translation not found
      return report.incident_types?.name || "Unknown Type";
    }
  };

  // Get translated subtype name
  const getTranslatedSubtype = (typeId: string, subtypeId: string) => {
    try {
      // Try to get translated name from translations
      const translatedName = tIncidentTypes.raw(
        `types.${typeId}.subtypes.${subtypeId}.name`
      );
      return translatedName as string;
    } catch (error) {
      // Fall back to database name if translation not found
      return report.incident_subtypes?.name || "Unknown Subtype";
    }
  };

  // Get the list of images for this report
  const { data: imageList, error: imageError } = await supabase.storage
    .from("report-images")
    .list(resolvedParams.uuid);

  if (imageError) {
    console.error("Error fetching images:", imageError);
  }

  // Generate public URLs for the images
  const imageUrls =
    imageList?.map((file) => {
      const { data } = supabase.storage
        .from("report-images")
        .getPublicUrl(`${resolvedParams.uuid}/${file.name}`);
      return data.publicUrl;
    }) || [];

  // Get status color based on status value
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "open":
        return "bg-green-100 text-green-800";
      case "in progress":
        return "bg-blue-100 text-blue-800";
      case "closed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Format date for display in Swiss German format (HH:MM, DD.MM.YYYY)
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const timeFormat = new Intl.DateTimeFormat("de-CH", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);

    const dateFormat = new Intl.DateTimeFormat("de-CH", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);

    return `${timeFormat}, ${dateFormat}`;
  };

  return (
    <>
      <PageHeader title={t("title")} description="" />
      <Notification />

      <div className="bg-white rounded-lg shadow p-4 space-y-4 mb-8">
        <TypographyH2>{t("sections.reportInfo.title")}</TypographyH2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Badge className={`${getStatusColor(report.status)} w-max`}>
            {report.status}
          </Badge>

          <div>
            <TypographyParagraph
              size="text-sm"
              className="text-muted-foreground"
            >
              {t("sections.reportInfo.createdAt")}
            </TypographyParagraph>
            <TypographyParagraph size="text-sm">
              {formatDate(report.created_at)}
            </TypographyParagraph>
          </div>
          <div>
            <TypographyParagraph
              size="text-sm"
              className="text-muted-foreground"
            >
              ID
            </TypographyParagraph>
            <TypographyParagraph size="text-sm">
              {report.id}
            </TypographyParagraph>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4 space-y-4 mb-8">
        <TypographyH2>{t("sections.images.title")}</TypographyH2>
        {imageUrls.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {imageUrls.map((url, index) => (
              <div
                key={index}
                className="relative aspect-square border rounded-md overflow-hidden"
              >
                <Image
                  src={url}
                  alt={`Report image ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  priority={index === 0}
                />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">{t("sections.images.noImages")}</p>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-4 space-y-4 mb-8">
        <TypographyH2>{t("sections.location.title")}</TypographyH2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <TypographyParagraph
              size="text-sm"
              className="text-muted-foreground"
            >
              {t("sections.location.address")}
            </TypographyParagraph>
            <TypographyParagraph size="text-sm">
              {report.location_address}
            </TypographyParagraph>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4 space-y-4 mb-8">
        <TypographyH2>{t("sections.incident.title")}</TypographyH2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {report.incident_type_id && (
            <div>
              <TypographyParagraph
                size="text-sm"
                className="text-muted-foreground"
              >
                {t("sections.incident.type")}
              </TypographyParagraph>
              <TypographyParagraph size="text-sm">
                {getTranslatedType(report.incident_type_id)}
              </TypographyParagraph>
            </div>
          )}
          {report.incident_type_id && report.incident_subtype_id && (
            <div>
              <TypographyParagraph
                size="text-sm"
                className="text-muted-foreground"
              >
                {t("sections.incident.subtype")}
              </TypographyParagraph>
              <TypographyParagraph size="text-sm">
                {getTranslatedSubtype(
                  report.incident_type_id,
                  report.incident_subtype_id
                )}
              </TypographyParagraph>
            </div>
          )}
          <div className="md:col-span-2">
            <TypographyParagraph
              size="text-sm"
              className="text-muted-foreground"
            >
              {t("sections.incident.description")}
            </TypographyParagraph>
            <TypographyParagraph className="whitespace-pre-wrap" size="text-sm">
              {report.description}
            </TypographyParagraph>
          </div>
        </div>
      </div>
      {process.env.NEXT_PUBLIC_ENABLE_LOGGING === "true" && (
        <Popover>
          <PopoverTrigger className="fixed bottom-1/3 right-0 bg-background rounded-l-md p-1">
            <GearFine size={32} />
          </PopoverTrigger>
          <PopoverContent>
            <div className="text-sm font-mono">
              <div className="mt-4">
                <p className="font-bold mb-2">Debug</p>
                <pre className="text-xs overflow-auto max-h-[300px] p-2 bg-gray-100 rounded">
                  {JSON.stringify(reportStore.getState(), null, 2)}
                </pre>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </>
  );
}
