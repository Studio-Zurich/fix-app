import { useReportStore } from "@/lib/store";

export const IncidentDescriptionStep = () => {
  const { reportData, updateReportData } = useReportStore();

  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    updateReportData({ description: e.target.value });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Incident Description</h2>
      <p className="text-gray-600">
        Please provide a detailed description of the incident.
      </p>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          value={reportData.description || ""}
          onChange={handleDescriptionChange}
          rows={5}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder="Enter the incident description here..."
        />
      </div>
    </div>
  );
};
