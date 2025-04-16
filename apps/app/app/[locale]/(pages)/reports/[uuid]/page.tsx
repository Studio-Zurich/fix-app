import PageHeader from "@/components/page-header";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@repo/ui/badge";
import { TypographyH2 } from "@repo/ui/headline";
import { TypographyParagraph } from "@repo/ui/text";
import { Metadata } from "next";
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

  return (
    <>
      <PageHeader title="Report Details" description={report.id} />

      {/* Images Section (Moved to top) */}
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
          <div>
            <TypographyParagraph
              size="text-sm"
              className="text-muted-foreground"
            >
              Coordinates
            </TypographyParagraph>
            <TypographyParagraph size="text-sm">
              {report.location_lat}, {report.location_lng}
            </TypographyParagraph>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4 space-y-4 mb-8">
        <TypographyH2>Report Information</TypographyH2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <TypographyParagraph
              size="text-sm"
              className="text-muted-foreground"
            >
              Status
            </TypographyParagraph>
            <Badge className={getStatusColor(report.status)}>
              {report.status}
            </Badge>
          </div>
          <div>
            <TypographyParagraph
              size="text-sm"
              className="text-muted-foreground"
            >
              Locale
            </TypographyParagraph>
            <TypographyParagraph size="text-sm">
              {report.locale}
            </TypographyParagraph>
          </div>
          <div>
            <TypographyParagraph
              size="text-sm"
              className="text-muted-foreground"
            >
              Created At
            </TypographyParagraph>
            <TypographyParagraph size="text-sm">
              {new Date(report.created_at).toLocaleString()}
            </TypographyParagraph>
          </div>
          <div>
            <TypographyParagraph
              size="text-sm"
              className="text-muted-foreground"
            >
              Updated At
            </TypographyParagraph>
            <TypographyParagraph size="text-sm">
              {new Date(report.updated_at).toLocaleString()}
            </TypographyParagraph>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4 space-y-4 mb-8">
        <TypographyH2>Incident Information</TypographyH2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {report.incident_types && (
            <div>
              <TypographyParagraph
                size="text-sm"
                className="text-muted-foreground"
              >
                Incident Type
              </TypographyParagraph>
              <TypographyParagraph size="text-sm">
                {report.incident_types.name}
              </TypographyParagraph>
            </div>
          )}
          {report.incident_subtypes && (
            <div>
              <TypographyParagraph
                size="text-sm"
                className="text-muted-foreground"
              >
                Incident Subtype
              </TypographyParagraph>
              <TypographyParagraph size="text-sm">
                {report.incident_subtypes.name}
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
