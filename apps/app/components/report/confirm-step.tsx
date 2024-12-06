"use client";

import { useReportStore } from "@/lib/store";
import { Check } from "@phosphor-icons/react";
import { Button } from "@repo/ui/button";
import { useRouter } from "next/navigation";

export const ConfirmStep = () => {
  const router = useRouter();
  const reset = useReportStore((state) => state.reset);

  const handleNewReport = () => {
    reset();
    router.push("/");
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
      <div className="rounded-full bg-green-100 p-3">
        <Check size={32} weight="bold" className="text-green-600" />
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-gray-900">
          Meldung erfolgreich übermittelt
        </h3>
        <p className="text-base text-gray-500">
          Sie erhalten in Kürze eine Bestätigungs-E-Mail mit den Details Ihrer
          Meldung.
        </p>
      </div>
      <Button variant="default" onClick={handleNewReport} className="mt-8">
        Neue Meldung erstellen
      </Button>
    </div>
  );
};
