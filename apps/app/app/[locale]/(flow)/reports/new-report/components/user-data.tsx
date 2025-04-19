"use client";
import { log } from "@/lib/logger";
import { userDataSchema } from "@/lib/schemas";
import { reportStore } from "@/lib/store";
import { UserDataFormFields } from "@/lib/types";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { z } from "zod";
import StepContainer from "./step-container";

const UserData = () => {
  const t = useTranslations("components.userData");
  // Get functions from reportStore
  const setUserData = reportStore((state) => state.setUserData);
  const setStep = (step: number) => reportStore.setState({ step });

  // Use local state for form values and validation errors
  const [formData, setFormData] = useState<UserDataFormFields>({
    reporter_first_name: "",
    reporter_last_name: "",
    reporter_email: "",
    reporter_phone: "",
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof UserDataFormFields, string>>
  >({});

  // State for the main validation error message
  const [validationError, setValidationError] = useState<string | undefined>();

  // Load user data from store when component mounts
  useEffect(() => {
    const state = reportStore.getState();
    const userData = state.user_step;

    if (userData) {
      setFormData({
        reporter_first_name: userData.reporter_first_name || "",
        reporter_last_name: userData.reporter_last_name || "",
        reporter_email: userData.reporter_email || "",
        reporter_phone: userData.reporter_phone || "",
      });
      log("User data loaded from store", userData);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    log("User data input changed", { field: name, value });

    // Update local state only
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error for this field when user types
    if (errors[name as keyof UserDataFormFields]) {
      setErrors({
        ...errors,
        [name]: undefined,
      });
      setValidationError(undefined);
    }
  };

  const validateForm = (): boolean => {
    try {
      userDataSchema.parse(formData);
      setErrors({});
      setValidationError(undefined);
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Partial<Record<keyof UserDataFormFields, string>> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as keyof UserDataFormFields] = err.message;
          }
        });
        setErrors(newErrors);
        setValidationError(t("validation.formError"));
      }
      return false;
    }
  };

  const handleBack = () => {
    // Just go back to the previous step without validating or saving data
    setStep(4);
  };

  const handleNext = () => {
    // Validate form before proceeding
    if (!validateForm()) {
      return;
    }

    // Save all form data to store when Next is clicked
    setUserData(formData);
    log("User data saved to store on Next click", formData);

    // Advance to final step (step 6)
    setStep(6);
  };

  return (
    <StepContainer
      title={t("title")}
      description={t("description")}
      prevButton={
        <Button type="button" variant="outline" onClick={handleBack}>
          {t("buttons.back")}
        </Button>
      }
      nextButton={
        <Button type="button" onClick={handleNext}>
          {t("buttons.next")}
        </Button>
      }
      error={validationError}
    >
      <div className="space-y-4">
        <div className="grid gap-1.5">
          <Label htmlFor="reporter_first_name">
            {t("fields.firstName.label")}
          </Label>
          <Input
            type="text"
            id="reporter_first_name"
            name="reporter_first_name"
            required
            value={formData.reporter_first_name}
            onChange={handleInputChange}
            aria-invalid={!!errors.reporter_first_name}
          />
          {errors.reporter_first_name && (
            <p className="text-sm text-destructive">
              {errors.reporter_first_name}
            </p>
          )}
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="reporter_last_name">
            {t("fields.lastName.label")}
          </Label>
          <Input
            type="text"
            id="reporter_last_name"
            name="reporter_last_name"
            required
            value={formData.reporter_last_name}
            onChange={handleInputChange}
            aria-invalid={!!errors.reporter_last_name}
          />
          {errors.reporter_last_name && (
            <p className="text-sm text-destructive">
              {errors.reporter_last_name}
            </p>
          )}
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="reporter_email">{t("fields.email.label")}</Label>
          <Input
            type="email"
            id="reporter_email"
            name="reporter_email"
            required
            value={formData.reporter_email}
            onChange={handleInputChange}
            aria-invalid={!!errors.reporter_email}
          />
          {errors.reporter_email && (
            <p className="text-sm text-destructive">{errors.reporter_email}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="reporter_phone">{t("fields.phone.label")}</Label>
          <Input
            type="tel"
            id="reporter_phone"
            name="reporter_phone"
            value={formData.reporter_phone}
            onChange={handleInputChange}
            aria-invalid={!!errors.reporter_phone}
          />
          {errors.reporter_phone && (
            <p className="text-sm text-destructive">{errors.reporter_phone}</p>
          )}
        </div>
      </div>
    </StepContainer>
  );
};

export default UserData;
