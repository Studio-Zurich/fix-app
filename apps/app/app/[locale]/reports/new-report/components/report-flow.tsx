"use client";
import { log } from "@/lib/logger";
import { Button } from "@repo/ui/button";
import { useLocale } from "next-intl";
import { useActionState } from "react";
import { ActionState, submitReport } from "../actions";
import ImageUpload from "./image-upload";
import UserData from "./user-data";

const ReportFlow = () => {
  // Use the useActionState hook to handle form submission
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    submitReport,
    { success: false, message: "" }
  );
  const locale = useLocale();

  // Log form submission state
  log("Form submission state", { state, pending });

  return (
    <div>
      <h1>ReportFlow</h1>

      {/* Display success or error message */}
      {state.message && <div>{state.message}</div>}

      <form action={formAction}>
        <input type="hidden" name="locale" value={locale} />
        <ImageUpload />
        <UserData />
        <Button type="submit" disabled={pending}>
          Submit
        </Button>
      </form>

      {/* Debug section - only visible when logging is enabled */}
      {process.env.NEXT_PUBLIC_ENABLE_LOGGING === "true" && (
        <div className="mt-8 p-4 border border-gray-300 rounded-md bg-gray-50">
          <h2 className="text-lg font-semibold mb-2">Debug Information</h2>
          <div className="text-sm font-mono">
            <p>
              <strong>Form State:</strong> {JSON.stringify(state, null, 2)}
            </p>
            <p>
              <strong>Pending:</strong> {pending ? "Yes" : "No"}
            </p>
            <p>
              <strong>Locale:</strong> {locale}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportFlow;
