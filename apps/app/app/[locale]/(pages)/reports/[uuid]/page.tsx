import PageHeader from "@/components/page-header";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@repo/ui/badge";
import { TypographyH2 } from "@repo/ui/headline";
import { TypographyParagraph } from "@repo/ui/text";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Image from "next/image";

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
  return {
    title: `Report ${resolvedParams.uuid}`,
    description: "View or edit incident report",
  };
}

export default async function ReportPage({ params }: ReportPageProps) {
  const resolvedParams = await params;
  const supabase = await createClient();
  const t = await getTranslations("incidentTypes");

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
      const translatedName = t.raw(`types.${typeId}.name`);
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
      const translatedName = t.raw(
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
      <PageHeader title="Report Details" description={report.id} />

      <div className="bg-white rounded-lg shadow p-4 space-y-4 mb-8">
        <TypographyH2>Report Information</TypographyH2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Badge className={`${getStatusColor(report.status)} w-max`}>
            {report.status}
          </Badge>

          <div>
            <TypographyParagraph
              size="text-sm"
              className="text-muted-foreground"
            >
              Created At
            </TypographyParagraph>
            <TypographyParagraph size="text-sm">
              {formatDate(report.created_at)}
            </TypographyParagraph>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4 space-y-4 mb-8">
        <TypographyH2>Report Images</TypographyH2>
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
          <p className="text-gray-500">No images uploaded for this report.</p>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-4 space-y-4 mb-8">
        <TypographyH2>Location Information</TypographyH2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <TypographyParagraph
              size="text-sm"
              className="text-muted-foreground"
            >
              Address
            </TypographyParagraph>
            <TypographyParagraph size="text-sm">
              {report.location_address}
            </TypographyParagraph>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4 space-y-4 mb-8">
        <TypographyH2>Incident Information</TypographyH2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {report.incident_type_id && (
            <div>
              <TypographyParagraph
                size="text-sm"
                className="text-muted-foreground"
              >
                Incident Type
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
                Incident Subtype
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
              Description
            </TypographyParagraph>
            <TypographyParagraph className="whitespace-pre-wrap" size="text-sm">
              {report.description}
            </TypographyParagraph>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4 space-y-4">
        <TypographyH2>Reporter Information</TypographyH2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <TypographyParagraph
              size="text-sm"
              className="text-muted-foreground"
            >
              Name
            </TypographyParagraph>
            <TypographyParagraph size="text-sm">
              {report.reporter_first_name} {report.reporter_last_name}
            </TypographyParagraph>
          </div>
          <div>
            <TypographyParagraph
              size="text-sm"
              className="text-muted-foreground"
            >
              Email
            </TypographyParagraph>
            <TypographyParagraph size="text-sm">
              {report.reporter_email}
            </TypographyParagraph>
          </div>
          {report.reporter_phone && (
            <div>
              <TypographyParagraph
                size="text-sm"
                className="text-muted-foreground"
              >
                Phone
              </TypographyParagraph>
              <TypographyParagraph size="text-sm">
                {report.reporter_phone}
              </TypographyParagraph>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
