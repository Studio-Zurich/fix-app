import { submitReport } from "@/app/actions";
import { useReportStore } from "@/lib/store";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

interface IncidentTypeInfo {
  name: string;
  subtype?: string;
}

interface SubmitError {
  error: string;
  details?: {
    type: string;
    message: string;
    validation?: Array<{
      code: string;
      message: string;
      path: (string | number)[];
    }>;
  };
}

export const SummaryStep = () => {
  const { reportData, reset, setCurrentStep } = useReportStore();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<SubmitError>();
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

  const cleanupTempFiles = async () => {
    const tempPaths = reportData.images
      .filter((img) => img.storagePath.startsWith("temp/"))
      .map((img) => img.storagePath);

    if (tempPaths.length === 0) return;

    try {
      const supabase = createClient();
      const { error: removeError } = await supabase.storage
        .from("report-images")
        .remove(tempPaths);

      if (removeError) {
        console.error("Error cleaning up temp files:", removeError);
      }
    } catch (err) {
      console.error("Error in cleanup:", err);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(undefined);

    const result = await submitReport(reportData);

    if (result.success) {
      await cleanupTempFiles();
      setCurrentStep(6); // Move to confirmation step
    } else {
      setError({
        error: result.error || "An unknown error occurred",
        details: result.details,
      });
    }

    setSubmitting(false);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Summary</h2>
      <p className="text-gray-600">
        Please review your report details before submitting.
      </p>

      <div className="space-y-4">
        {/* Images */}
        <div>
          <h3 className="text-sm font-medium text-gray-700">Images</h3>
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
        </div>

        {/* Location */}
        {reportData.location && (
          <div>
            <h3 className="text-sm font-medium text-gray-700">Location</h3>
            <p className="mt-1 text-sm text-gray-600">
              {reportData.location.address}
            </p>
          </div>
        )}

        {/* Incident Type */}
        {incidentTypeInfo && (
          <div>
            <h3 className="text-sm font-medium text-gray-700">Incident Type</h3>
            <div className="mt-1 text-sm text-gray-600">
              <p>{incidentTypeInfo.name}</p>
              {incidentTypeInfo.subtype && (
                <p className="text-gray-500">{incidentTypeInfo.subtype}</p>
              )}
            </div>
          </div>
        )}

        {/* Description */}
        {reportData.description && (
          <div>
            <h3 className="text-sm font-medium text-gray-700">Description</h3>
            <p className="mt-1 text-sm text-gray-600">
              {reportData.description}
            </p>
          </div>
        )}

        {/* Reporter Information */}
        <div>
          <h3 className="text-sm font-medium text-gray-700">
            Contact Information
          </h3>
          <div className="mt-1 text-sm text-gray-600">
            <p>{`${reportData.reporterFirstName} ${reportData.reporterLastName}`}</p>
            <p>{reportData.reporterEmail}</p>
            {reportData.reporterPhone && <p>{reportData.reporterPhone}</p>}
          </div>
        </div>
      </div>

      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-md p-4">
        <p className="text-sm text-yellow-700">
          Please verify that all information is correct before submitting. Once
          submitted, you will receive a confirmation email with your report
          details.
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-4">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md space-y-2">
            <p className="text-sm font-medium text-red-700">{error.error}</p>
            {error.details && process.env.NODE_ENV === "development" && (
              <div className="text-xs text-red-600 space-y-1">
                <p>Type: {error.details.type}</p>
                <p>Message: {error.details.message}</p>
                {error.details.validation && (
                  <div>
                    <p>Validation Errors:</p>
                    <ul className="list-disc pl-4">
                      {error.details.validation.map((err, idx) => (
                        <li key={idx}>
                          {err.path.join(".")} - {err.message}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
        >
          {submitting ? "Submitting..." : "Submit Report"}
        </button>
      </div>
    </div>
  );
};
