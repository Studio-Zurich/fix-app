"use client";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { toast } from "sonner";

export default function Notification() {
  const t = useTranslations("responses.success");

  useEffect(() => {
    const success = new URLSearchParams(window.location.search).get("success");
    if (success && success === "true") {
      toast.success(t("reportSubmitted"));
    }
  }, [t]);

  return null;
}
