import { useReportStore } from "@/lib/store";

export const ConfirmStep = () => {
  const { reportData, reset, setCurrentStep } = useReportStore();

  const handleSubmitAnother = () => {
    reset(); // Reset all form data
    setCurrentStep(0); // Go back to first step
  };

  return (
    <div className="text-center space-y-6 py-8">
      <div className="flex justify-center">CHECK</div>

      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-gray-900">
          Report Submitted Successfully
        </h2>
        <p className="text-gray-600">
          Thank you for submitting your report. We have sent a confirmation
          email to {reportData.reporterEmail}.
        </p>
      </div>

      <div className="bg-gray-50 rounded-lg p-6 mt-6 text-left">
        <h3 className="text-sm font-medium text-gray-900 mb-2">
          What happens next?
        </h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li>• Your report has been logged in our system</li>
          <li>• You will receive updates via email about your report status</li>
          <li>• Our team will review your report within 24-48 hours</li>
          <li>• You can track your report using the ID sent to your email</li>
        </ul>
      </div>

      <div className="flex justify-center gap-4 pt-4">
        <button
          onClick={handleSubmitAnother}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Submit Another Report
        </button>
      </div>
    </div>
  );
};
