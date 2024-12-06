import { useReportStore } from "@/lib/store";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

interface IncidentTypeInfo {
  name: string;
  subtype?: string;
}

export const SummaryStep = () => {
  const { reportData } = useReportStore();
  const [incidentTypeInfo, setIncidentTypeInfo] = useState<IncidentTypeInfo>();

  useEffect(() => {
    const fetchIncidentTypeInfo = async () => {
      if (!reportData.incidentTypeId) return;

      const supabase = createClient();
      try {
        // Fetch incident type
        const { data: typeData } = await supabase
          .from("incident_types")
          .select("name")
          .eq("id", reportData.incidentTypeId)
          .single();

        // Fetch subtype if exists
        let subtypeName;
        if (reportData.incidentSubtypeId) {
          const { data: subtypeData } = await supabase
            .from("incident_subtypes")
            .select("name")
            .eq("id", reportData.incidentSubtypeId)
            .single();
          subtypeName = subtypeData?.name;
        }

        setIncidentTypeInfo({
          name: typeData?.name || "Unknown",
          subtype: subtypeName,
        });
      } catch (err) {
        console.error("Error fetching incident type info:", err);
      }
    };

    fetchIncidentTypeInfo();
  }, [reportData.incidentTypeId, reportData.incidentSubtypeId]);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {/* Images */}
        <div>
          <h3 className="text-sm font-medium text-gray-700">Bilder</h3>
          {reportData.images.length > 0 ? (
            <div className="mt-2 grid grid-cols-4 gap-2">
              {reportData.images.map((image, index) => (
                <img
                  key={index}
                  src={image.previewUrl}
                  alt={`Upload ${index + 1}`}
                  className="h-20 w-20 object-cover rounded-md"
                />
              ))}
            </div>
          ) : (
            <p className="mt-2 text-sm text-gray-500 italic">
              Keine Bilder ausgewählt
            </p>
          )}
        </div>

        {/* Description */}
        {reportData.description && (
          <div>
            <h3 className="text-sm font-medium text-gray-700">Beschreibung</h3>
            <p className="mt-1 text-sm text-gray-600">
              {reportData.description}
            </p>
          </div>
        )}

        {/* Location */}
        {reportData.location && (
          <div>
            <h3 className="text-sm font-medium text-gray-700">Standort</h3>
            <p className="mt-1 text-sm text-gray-600">
              {reportData.location.address}
            </p>
          </div>
        )}

        {/* Reporter Information */}
        <div>
          <h3 className="text-sm font-medium text-gray-700">
            Kontaktinformationen
          </h3>
          <div className="mt-1 text-sm text-gray-600">
            <p>{`${reportData.reporterFirstName} ${reportData.reporterLastName}`}</p>
            <p>{reportData.reporterEmail}</p>
            {reportData.reporterPhone && <p>{reportData.reporterPhone}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};
