"use client";

import { useReportStore } from "@/lib/store";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { useState } from "react";
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
  const setCurrentStep = useReportStore((state) => state.setCurrentStep);

  const [formData, setFormData] = useState<UserDataForm>({
    firstName: reportData.reporterFirstName || "",
    lastName: reportData.reporterLastName || "",
    email: reportData.reporterEmail || "",
    phone: reportData.reporterPhone || "",
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

      // Update store immediately
      const storeUpdate: Partial<typeof reportData> = {};
      switch (field) {
        case "firstName":
          storeUpdate.reporterFirstName = value;
          break;
        case "lastName":
          storeUpdate.reporterLastName = value;
          break;
        case "email":
          storeUpdate.reporterEmail = value;
          break;
        case "phone":
          storeUpdate.reporterPhone = value;
          break;
      }
      useReportStore.getState().updateReportData(storeUpdate);
    };

  const handleBlur = (field: keyof UserDataForm) => () => {
    try {
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

  const isFormValid = () => {
    try {
      userDataSchema.parse(formData);
      return true;
    } catch (error) {
      return false;
    }
  };

  const handleSubmit = () => {
    try {
      const validatedData = userDataSchema.parse(formData);

      // Update store with validated data
      useReportStore.getState().updateReportData({
        reporterFirstName: validatedData.firstName,
        reporterLastName: validatedData.lastName,
        reporterEmail: validatedData.email,
        reporterPhone: validatedData.phone,
      });

      // Move to next step
      setCurrentStep(5);
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

      <div className="fixed bottom-4 left-4 right-4">
        <Button
          className="w-full"
          onClick={handleSubmit}
          disabled={!isFormValid()}
        >
          Confirm Contact Details
        </Button>
      </div>
    </div>
  );
}
