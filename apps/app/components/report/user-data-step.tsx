import { useReportStore } from "@/lib/store";
import { useState } from "react";

export const UserDataStep = () => {
  const { reportData, updateReportData } = useReportStore();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateField = (name: string, value: string) => {
    if (!value || value.trim() === "") {
      return "Dieses Feld ist erforderlich";
    }
    if (name === "reporterEmail") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return "Bitte geben Sie eine gültige E-Mail-Adresse ein";
      }
    }
    return "";
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateReportData({ [name]: value });

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            className={`block text-sm font-medium ${errors.reporterFirstName ? "text-red-600" : "text-gray-700"}`}
          >
            Vorname *
          </label>
          <input
            type="text"
            name="reporterFirstName"
            value={reportData.reporterFirstName || ""}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            className={`mt-1 block w-full p-2 border ${
              errors.reporterFirstName ? "border-red-500" : "border-gray-300"
            } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
            placeholder="Ihr Vorname"
            required
          />
          {errors.reporterFirstName && (
            <p className="mt-1 text-sm text-red-600">
              {errors.reporterFirstName}
            </p>
          )}
        </div>

        <div>
          <label
            className={`block text-sm font-medium ${errors.reporterLastName ? "text-red-600" : "text-gray-700"}`}
          >
            Nachname *
          </label>
          <input
            type="text"
            name="reporterLastName"
            value={reportData.reporterLastName || ""}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            className={`mt-1 block w-full p-2 border ${
              errors.reporterLastName ? "border-red-500" : "border-gray-300"
            } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
            placeholder="Ihr Nachname"
            required
          />
          {errors.reporterLastName && (
            <p className="mt-1 text-sm text-red-600">
              {errors.reporterLastName}
            </p>
          )}
        </div>
      </div>

      <div>
        <label
          className={`block text-sm font-medium ${errors.reporterEmail ? "text-red-600" : "text-gray-700"}`}
        >
          E-Mail Adresse *
        </label>
        <input
          type="email"
          name="reporterEmail"
          value={reportData.reporterEmail || ""}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          className={`mt-1 block w-full p-2 border ${
            errors.reporterEmail ? "border-red-500" : "border-gray-300"
          } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
          placeholder="ihre@email.com"
          required
        />
        {errors.reporterEmail && (
          <p className="mt-1 text-sm text-red-600">{errors.reporterEmail}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Telefonnummer (optional)
        </label>
        <input
          type="tel"
          name="reporterPhone"
          value={reportData.reporterPhone || ""}
          onChange={handleInputChange}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder="+41 XX XXX XX XX"
        />
      </div>
    </div>
  );
};
