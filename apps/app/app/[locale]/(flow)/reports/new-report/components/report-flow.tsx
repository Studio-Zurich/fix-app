"use client";
import { log } from "@/lib/logger";
import { useLocationStore } from "@/lib/store";
import { Button } from "@repo/ui/button";
import { useLocale } from "next-intl";
import { useActionState } from "react";
import { ActionState, submitReport } from "../actions";
import ImageUpload from "./image-upload";
import IncidentDescription from "./incident-description";
import IncidentSubtype from "./incident-subtype";
import IncidentType from "./incident-type";
import Location from "./location";
import UserData from "./user-data";

interface ReportFlowProps {
  incidentTypes: Array<{
    id: string;
    name: string;
    description: string;
    active: boolean;
  }>;
  incidentSubtypes: Array<{
    id: string;
    name: string;
    description: string;
    active: boolean;
    incident_type_id: string;
  }>;
}

const ReportFlow = ({ incidentTypes, incidentSubtypes }: ReportFlowProps) => {
  // Use the useActionState hook to handle form submission
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    submitReport,
    { success: false, message: "" }
  );
  const locale = useLocale();
  const detectedLocation = useLocationStore((state) => state.detectedLocation);

  // Log form submission state
  log("Form submission state", { state, pending });
  log("Report flow props", {
    incidentTypesCount: incidentTypes.length,
    incidentSubtypesCount: incidentSubtypes.length,
  });
  log("Detected location data from store", detectedLocation);

  return (
    <>
      {/* Display success or error message */}
      {state.message && <div>{state.message}</div>}

      <form action={formAction} className="flex-1 h-full flex flex-col gap-16">
        <input type="hidden" name="locale" value={locale} />
        <ImageUpload />
        <Location />
        <IncidentType incidentTypes={incidentTypes} />
        <IncidentSubtype incidentSubtypes={incidentSubtypes} />
        <IncidentDescription />
        <UserData />
        <div className="flex-1 bg-blue-400 pb-[66px]">
          <div className="fixed bottom-0 w-full bg-pink-400 h-min">
            <div className="px-[5vw] md:px-6 py-2 flex justify-between items-center">
              <Button type="submit" className="w-full" disabled={pending}>
                Submit
              </Button>
            </div>
          </div>
        </div>
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
            <p>
              <strong>Incident Types:</strong> {incidentTypes.length}
            </p>
            <p>
              <strong>Incident Subtypes:</strong> {incidentSubtypes.length}
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default ReportFlow;
