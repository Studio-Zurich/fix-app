"use client";

import { incidentDescriptionSchema } from "@/lib/schemas";
import { useReportStore } from "@/lib/store";
import { useState } from "react";

export const IncidentDescriptionStep = () => {
  const { reportData, updateReportData } = useReportStore();
  const [error, setError] = useState<string>("");

  const validateDescription = (value: string) => {
    const result = incidentDescriptionSchema.safeParse({ description: value });
    if (!result.success) {
      setError(result.error.errors[0]?.message || "Ungültige Eingabe");
      return false;
    }
    setError("");
    return true;
  };

  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const value = e.target.value;
    updateReportData({ description: value });
    if (error) {
      validateDescription(value);
    }
  };

  const handleBlur = () => {
    validateDescription(reportData.description || "");
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1">
        {error ? (
          <p className="block text-sm font-medium text-red-600 mb-2">{error}</p>
        ) : (
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Beschreibung
          </label>
        )}
        <textarea
          id="description"
          value={reportData.description || ""}
          onChange={handleDescriptionChange}
          onBlur={handleBlur}
          rows={5}
          className={`mt-1 block w-full p-2 border ${
            error ? "border-red-500" : "border-gray-300"
          } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
          placeholder="Beschreiben Sie den Vorfall hier..."
        />
      </div>
    </div>
  );
};
