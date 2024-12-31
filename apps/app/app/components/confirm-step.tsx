"use client";

import { useRouter } from "@/i18n/routing";
import { CheckCircle } from "@phosphor-icons/react";
import { Button } from "@repo/ui/button";
import { Separator } from "@repo/ui/separator";
import { useTranslations } from "next-intl";

interface ConfirmStepProps {
  reportId: string;
}

export default function ConfirmStep({ reportId }: ConfirmStepProps) {
  const router = useRouter();
  const t = useTranslations("ConfirmPage");

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] p-4 space-y-6">
      <div className="flex flex-col items-center space-y-2 text-center">
        <CheckCircle className="w-16 h-16 text-primary" weight="fill" />
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>

      <div className="w-full space-y-2">
        <p className="text-sm text-center text-muted-foreground">
          {t("reportNumber")}
        </p>
        <p className="text-lg font-mono text-center">{reportId}</p>
      </div>

      <Separator />

      <div className="w-full space-y-2">
        <h2 className="font-semibold">{t("nextSteps")}</h2>
        <p className="text-sm text-muted-foreground">
          {t("nextStepsDescription")}
        </p>
      </div>

      <div className="fixed bottom-4 left-4 right-4 space-y-2">
        <Button className="w-full" onClick={() => router.push("/report")}>
          {t("newReport")}
        </Button>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => router.push("/")}
        >
          {t("backToDashboard")}
        </Button>
      </div>
    </div>
  );
}
