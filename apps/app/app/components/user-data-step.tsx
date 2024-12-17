"use client";

import { useReportStore } from "@/lib/store";
import { Input } from "@repo/ui/input";
import { useState } from "react";
import { z } from "zod";

const userDataSchema = z.object({
  firstName: z.string().min(2, "First name is too short").optional(),
  lastName: z.string().min(2, "Last name is too short").optional(),
  email: z.string().email("Invalid email address").optional(),
});

type UserDataForm = z.infer<typeof userDataSchema>;

export default function UserDataStep() {
  const [formData, setFormData] = useState<UserDataForm>({
    firstName: "",
    lastName: "",
    email: "",
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof UserDataForm, string>>
  >({});

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
    if (formData[field]) {
      try {
        userDataSchema.shape[field].parse(formData[field]);
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      } catch (err) {
        const error = err as z.ZodError;
        setErrors((prev) => ({
          ...prev,
          [field]: error.errors?.[0]?.message || "Invalid input",
        }));
      }
    }
  };

  const handleSubmit = () => {
    try {
      const validatedData = userDataSchema.parse(formData);
      // Update store with validated data
      useReportStore.setState((state) => ({
        reportData: {
          ...state.reportData,
          reporterFirstName: validatedData.firstName,
          reporterLastName: validatedData.lastName,
          reporterEmail: validatedData.email,
        },
      }));
      // Move to next step
      useReportStore.getState().setCurrentStep(5);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Partial<Record<keyof UserDataForm, string>> = {};
        error.errors.forEach((err) => {
          const path = err.path[0] as keyof UserDataForm;
          newErrors[path] = err.message;
        });
        setErrors(newErrors);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Contact Information</h2>
        <p className="text-sm text-muted-foreground">
          Optionally provide your contact details
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Input
            placeholder="First name"
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
            placeholder="Last name"
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
            placeholder="Email address"
            value={formData.email}
            onChange={handleChange("email")}
            onBlur={handleBlur("email")}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email}</p>
          )}
        </div>
      </div>

      <div className="text-sm text-muted-foreground space-y-1">
        <p>Why provide contact information?</p>
        <ul className="list-disc list-inside pl-2">
          <li>Get updates about your report</li>
          <li>Allow follow-up questions if needed</li>
          <li>Receive confirmation when resolved</li>
        </ul>
      </div>
    </div>
  );
}
