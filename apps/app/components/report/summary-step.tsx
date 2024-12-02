import { submitReport } from "@/app/actions";
import { useReportStore } from "@/lib/store";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";

export const SummaryStep = () => {
  const { reportData, reset, setCurrentStep } = useReportStore();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>();

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
      setError(result.error);
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
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-700">{error}</p>
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
