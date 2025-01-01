"use client";

import { useReportStore } from "@/lib/store";
import { Input } from "@repo/ui/input";
import { useEffect, useState } from "react";
import { z } from "zod";

const userDataSchema = z.object({
  firstName: z.string().min(2, "First name is too short"),
  lastName: z.string().min(2, "Last name is too short"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
});

type UserDataForm = z.infer<typeof userDataSchema>;

export default function UserDataStep() {
  const reportData = useReportStore((state) => state.reportData);
  const setStepValidation = useReportStore((state) => state.setStepValidation);

  const [formData, setFormData] = useState<UserDataForm>({
    firstName: reportData.reporterFirstName || "",
    lastName: reportData.reporterLastName || "",
    email: reportData.reporterEmail || "",
    phone: reportData.reporterPhone || "",
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof UserDataForm, string>>
  >({});

  // Validate form and update step validation whenever form data changes
  useEffect(() => {
    try {
      // Only validate required fields (excluding phone)
      const { firstName, lastName, email } = formData;
      const isValid =
        firstName.length >= 2 &&
        lastName.length >= 2 &&
        z.string().email().safeParse(email).success;

      setStepValidation("userData", isValid);

      // Update store with current values
      useReportStore.getState().updateReportData({
        reporterFirstName: formData.firstName,
        reporterLastName: formData.lastName,
        reporterEmail: formData.email,
        reporterPhone: formData.phone,
      });
    } catch (error) {
      setStepValidation("userData", false);
    }
  }, [formData, setStepValidation]);

  const handleChange =
    (field: keyof UserDataForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setFormData((prev) => ({ ...prev, [field]: value }));

      // Clear error when user starts typing
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    };

  const handleBlur = (field: keyof UserDataForm) => () => {
    try {
      // Skip validation for optional phone field
      if (field === "phone") return;

      const fieldSchema = userDataSchema.shape[field];
      fieldSchema.parse(formData[field]);
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    } catch (err) {
      const error = err as z.ZodError;
      setErrors((prev) => ({
        ...prev,
        [field]: error.errors[0]?.message || "Invalid input",
      }));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Contact Information</h2>
        <p className="text-sm text-muted-foreground">
          Please provide your contact details
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Input
            placeholder="First name *"
            value={formData.firstName}
            onChange={handleChange("firstName")}
            onBlur={handleBlur("firstName")}
          />
          {errors.firstName && (
            <p className="text-sm text-destructive">{errors.firstName}</p>
          )}
        </div>

        <div className="space-y-2">
          <Input
            placeholder="Last name *"
            value={formData.lastName}
            onChange={handleChange("lastName")}
            onBlur={handleBlur("lastName")}
          />
          {errors.lastName && (
            <p className="text-sm text-destructive">{errors.lastName}</p>
          )}
        </div>

        <div className="space-y-2">
          <Input
            type="email"
            placeholder="Email address *"
            value={formData.email}
            onChange={handleChange("email")}
            onBlur={handleBlur("email")}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email}</p>
          )}
        </div>

        <div className="space-y-2">
          <Input
            type="tel"
            placeholder="Phone number (optional)"
            value={formData.phone}
            onChange={handleChange("phone")}
          />
        </div>
      </div>

      <div className="text-sm text-muted-foreground space-y-1">
        <p>Why provide contact information?</p>
        <ul className="list-disc list-inside pl-2">
          <li>Get updates about your report</li>
          <li>Allow follow-up questions if needed</li>
          <li>Receive confirmation when resolved</li>
        </ul>
        <p className="text-xs mt-2">* Required fields</p>
      </div>
    </div>
  );
}
