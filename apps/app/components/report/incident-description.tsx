import { useReportStore } from "@/lib/store";
import { useState } from "react";

export const IncidentDescriptionStep = () => {
  const { reportData, updateReportData } = useReportStore();
  const [error, setError] = useState<string>("");

  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const value = e.target.value;
    updateReportData({ description: value });
    if (error && value.trim()) {
      setError("");
    }
  };

  const handleBlur = () => {
    if (!reportData.description?.trim()) {
      setError("Bitte geben Sie eine Beschreibung ein");
    }
  };

  return (
    <div>
      <label
        className={`block text-sm font-medium mb-2 ${error ? "text-red-600" : "text-gray-700"}`}
      >
        Beschreibung *
      </label>
      <textarea
        value={reportData.description || ""}
        onChange={handleDescriptionChange}
        onBlur={handleBlur}
        rows={5}
        className={`mt-1 block w-full p-2 border ${
          error ? "border-red-500" : "border-gray-300"
        } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
        placeholder="Beschreiben Sie den Vorfall hier..."
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};
