"use client";

import { userDataSchema } from "@/lib/schemas";
import { UserData as UserDataType } from "@/lib/types";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { z } from "zod";
import StepHeader from "./step-header";

interface UserDataProps {
  onDataChange: (data: UserDataType) => void;
  initialData?: UserDataType;
}

export default function UserData({ onDataChange, initialData }: UserDataProps) {
  const t = useTranslations("components.userData");
  const tReport = useTranslations("components.reportFlow");
  const [formData, setFormData] = useState<UserDataType>(
    initialData || {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
    }
  );

  const [errors, setErrors] = useState<
    Partial<Record<keyof UserDataType, string>>
  >({});
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const validation = userDataSchema.safeParse(formData);
    setIsValid(validation.success);
    if (validation.success) {
      onDataChange(formData);
    }
  }, [formData, onDataChange]);

  const handleChange =
    (field: keyof UserDataType) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    };

  const handleBlur = (field: keyof UserDataType) => () => {
    try {
      if (field === "phone") return;
      const fieldSchema = userDataSchema.shape[field];
      fieldSchema.parse(formData[field]);
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    } catch (err) {
      const error = err as z.ZodError;
      setErrors((prev) => ({
        ...prev,
        [field]: error.errors[0]?.message || t(`errors.${field}Required`),
      }));
    }
  };

  return (
    <div className="space-y-4 flex-1">
      <StepHeader
        step={tReport("userData.step")}
        description={tReport("userData.description")}
      />
      <div className="grid gap-1.5">
        <Label htmlFor="firstName">{t("firstName")}*</Label>
        <Input
          placeholder={t("firstName")}
          value={formData.firstName}
          onChange={handleChange("firstName")}
          onBlur={handleBlur("firstName")}
        />
        {errors.firstName && (
          <p className="text-sm text-destructive">{errors.firstName}</p>
        )}
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="lastName">{t("lastName")}*</Label>
        <Input
          placeholder={t("lastName")}
          value={formData.lastName}
          onChange={handleChange("lastName")}
          onBlur={handleBlur("lastName")}
        />
        {errors.lastName && (
          <p className="text-sm text-destructive">{errors.lastName}</p>
        )}
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="email">{t("email")}*</Label>
        <Input
          type="email"
          placeholder={t("email")}
          value={formData.email}
          onChange={handleChange("email")}
          onBlur={handleBlur("email")}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email}</p>
        )}
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="phone">{t("phone")}</Label>
        <Input
          type="tel"
          placeholder={t("phone")}
          value={formData.phone}
          onChange={handleChange("phone")}
        />
      </div>

      <div className="text-sm text-muted-foreground space-y-1">
        <p>{t("whyProvideInfo")}</p>
        <ul className="list-disc list-inside pl-2">
          <li>{t("reasons.updates")}</li>
          <li>{t("reasons.followUp")}</li>
          <li>{t("reasons.confirmation")}</li>
        </ul>
        <p className="text-xs mt-2">{t("requiredFields")}</p>
      </div>
    </div>
  );
}
