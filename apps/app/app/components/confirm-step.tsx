"use client";

import { CheckCircle } from "@phosphor-icons/react";
import { Button } from "@repo/ui/button";
import { useRouter } from "next/navigation";

interface ConfirmStepProps {
  reportId: string;
}

export default function ConfirmStep({ reportId }: ConfirmStepProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center space-y-6">
      <div className="flex flex-col items-center space-y-4">
        <CheckCircle className="w-16 h-16 text-primary" weight="fill" />
        <h1 className="text-2xl font-bold">Thank You!</h1>
        <p className="text-muted-foreground">
          Your report has been successfully submitted.
        </p>
        <p className="text-sm text-muted-foreground">
          Report ID: <span className="font-mono">{reportId}</span>
        </p>
      </div>

      <div className="space-y-4 w-full max-w-sm">
        <Button className="w-full" onClick={() => router.push("/")}>
          Submit Another Report
        </Button>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => window.close()}
        >
          Close
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">
        We will process your report and take appropriate action.
        {/* Add any additional information or next steps here */}
      </p>
    </div>
  );
}
