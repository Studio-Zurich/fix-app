"use client";

import { Link } from "@/i18n/routing";
import { CheckCircle } from "@phosphor-icons/react/dist/ssr";
import { buttonVariants } from "@repo/ui/button";
import { cn } from "@repo/ui/lib/utils";
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
      <Link
        href="/reports/new-report"
        className={cn(buttonVariants({ variant: "default" }), "w-full")}
      >
        {t("success.button")}
      </Link>
    </div>
  );
};

export default ReportSuccess;
