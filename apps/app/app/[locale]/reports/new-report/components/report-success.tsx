"use client";

import { useTranslations } from "next-intl";

const ReportSuccess = () => {
  const t = useTranslations("components.reportFlow");

  return (
    <div className="space-y-4 text-center">
      <h2 className="text-2xl font-semibold mb-4">{t("success.title")}</h2>
      <p className="text-lg">{t("success.description")}</p>
    </div>
  );
};

export default ReportSuccess;
