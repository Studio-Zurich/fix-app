"use client";

import { useReportStore } from "@/lib/store";
import { Input } from "@repo/ui/input";
import { useState } from "react";
import { z } from "zod";

interface ValidationErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
}

const emailSchema = z
  .string()
  .email("Bitte geben Sie eine gültige E-Mail-Adresse ein");

export const UserDataStep = () => {
  const { reportData, updateReportData } = useReportStore();
  const [errors, setErrors] = useState<ValidationErrors>({});

  const validateField = (
    field: "firstName" | "lastName" | "email" | "phone",
    value: string
  ) => {
    const newErrors = { ...errors };

    switch (field) {
      case "firstName":
        if (!value.trim()) {
          newErrors.firstName = "Bitte geben Sie Ihren Vornamen ein";
        } else {
          delete newErrors.firstName;
        }
        break;
      case "lastName":
        if (!value.trim()) {
          newErrors.lastName = "Bitte geben Sie Ihren Nachnamen ein";
        } else {
          delete newErrors.lastName;
        }
        break;
      case "email":
        const emailResult = emailSchema.safeParse(value);
        if (!emailResult.success) {
          newErrors.email =
            emailResult.error.errors[0]?.message || "Ungültige E-Mail-Adresse";
        } else {
          delete newErrors.email;
        }
        break;
      case "phone":
        // Phone is optional, but if provided should be valid
        if (value.trim() && !/^[+\d\s-()]{5,}$/.test(value)) {
          newErrors.phone = "Bitte geben Sie eine gültige Telefonnummer ein";
        } else {
          delete newErrors.phone;
        }
        break;
    }

    setErrors(newErrors);
  };

  const handleChange = (
    field: "firstName" | "lastName" | "email" | "phone",
    value: string
  ) => {
    updateReportData({
      [`reporter${field.charAt(0).toUpperCase() + field.slice(1)}`]: value,
    });
    if (errors[field]) {
      validateField(field, value);
    }
  };

  const handleBlur = (
    field: "firstName" | "lastName" | "email" | "phone",
    value: string
  ) => {
    validateField(field, value);
  };

  return (
    <div className="space-y-4">
      <div>
        {errors.firstName ? (
          <p className="block text-sm font-medium text-red-600 mb-2">
            {errors.firstName}
          </p>
        ) : (
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Vorname *
          </label>
        )}
        <Input
          type="text"
          value={reportData.reporterFirstName || ""}
          onChange={(e) => handleChange("firstName", e.target.value)}
          onBlur={(e) => handleBlur("firstName", e.target.value)}
          className={errors.firstName ? "border-red-500" : ""}
        />
      </div>

      <div>
        {errors.lastName ? (
          <p className="block text-sm font-medium text-red-600 mb-2">
            {errors.lastName}
          </p>
        ) : (
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nachname *
          </label>
        )}
        <Input
          type="text"
          value={reportData.reporterLastName || ""}
          onChange={(e) => handleChange("lastName", e.target.value)}
          onBlur={(e) => handleBlur("lastName", e.target.value)}
          className={errors.lastName ? "border-red-500" : ""}
        />
      </div>

      <div>
        {errors.email ? (
          <p className="block text-sm font-medium text-red-600 mb-2">
            {errors.email}
          </p>
        ) : (
          <label className="block text-sm font-medium text-gray-700 mb-2">
            E-Mail *
          </label>
        )}
        <Input
          type="email"
          value={reportData.reporterEmail || ""}
          onChange={(e) => handleChange("email", e.target.value)}
          onBlur={(e) => handleBlur("email", e.target.value)}
          className={errors.email ? "border-red-500" : ""}
        />
      </div>

      <div>
        {errors.phone ? (
          <p className="block text-sm font-medium text-red-600 mb-2">
            {errors.phone}
          </p>
        ) : (
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Telefon (optional)
          </label>
        )}
        <Input
          type="tel"
          value={reportData.reporterPhone || ""}
          onChange={(e) => handleChange("phone", e.target.value)}
          onBlur={(e) => handleBlur("phone", e.target.value)}
          className={errors.phone ? "border-red-500" : ""}
        />
      </div>
    </div>
  );
};
