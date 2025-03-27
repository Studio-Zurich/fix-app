"use client";

import { userDataSchema } from "@/lib/schemas";
import { UserData as UserDataType } from "@/lib/types";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { z } from "zod";

interface UserDataProps {
  onDataChange: (data: UserDataType) => void;
  onNext: () => void;
  onBack: () => void;
  initialData?: UserDataType;
}

export default function UserData({
  onDataChange,
  onNext,
  onBack,
  initialData,
}: UserDataProps) {
  const t = useTranslations("components.userData");

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
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
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

        <div className="space-y-2">
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

        <div className="space-y-2">
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

        <div className="space-y-2">
          <Input
            type="tel"
            placeholder={t("phone")}
            value={formData.phone}
            onChange={handleChange("phone")}
          />
        </div>
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

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          {t("back")}
        </Button>
        <Button onClick={onNext} disabled={!isValid}>
          {t("next")}
        </Button>
      </div>
    </div>
  );
}
