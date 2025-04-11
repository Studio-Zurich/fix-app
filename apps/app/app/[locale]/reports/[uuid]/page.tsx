import { createClient } from "@/lib/supabase/server";
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
    .select("*")
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

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Report Details</h1>
      <div className="text-sm text-gray-500 mb-4">Report ID: {report.id}</div>

      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Report Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <p className="font-medium">{report.status}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Locale</p>
            <p className="font-medium">{report.locale}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Created At</p>
            <p className="font-medium">
              {new Date(report.created_at).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Updated At</p>
            <p className="font-medium">
              {new Date(report.updated_at).toLocaleString()}
            </p>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm text-gray-500">Description</p>
            <p className="font-medium whitespace-pre-wrap">
              {report.description}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Location Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Address</p>
            <p className="font-medium">{report.location_address}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Coordinates</p>
            <p className="font-medium">
              {report.location_lat}, {report.location_lng}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Reporter Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Name</p>
            <p className="font-medium">
              {report.reporter_first_name} {report.reporter_last_name}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="font-medium">{report.reporter_email}</p>
          </div>
          {report.reporter_phone && (
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p className="font-medium">{report.reporter_phone}</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Report Images</h2>
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
    </div>
  );
}
