"use client";

import { CheckCircle } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@repo/ui/button";
import { useTranslations } from "next-intl";
import StepHeader from "./step-header";

const ReportSuccess = () => {
  const t = useTranslations("components.reportFlow");

  return (
    <div className="space-y-4 text-center">
      <CheckCircle
        size={60}
        className="text-green-500 mx-auto"
        weight="light"
      />
      <StepHeader
        step={t("success.step")}
        description={t("success.description")}
      />

      <Button type="button" onClick={() => window.location.reload()}>
        {t("success.button")}
      </Button>
    </div>
  );
};

export default ReportSuccess;
