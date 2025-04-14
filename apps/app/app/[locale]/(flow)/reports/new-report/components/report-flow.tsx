"use client";
import { log } from "@/lib/logger";
import { useLocationStore } from "@/lib/store";
import { Button } from "@repo/ui/button";
import { useLocale } from "next-intl";
import { useActionState } from "react";
import { ActionState, submitReport } from "../actions";
import ImageUpload from "./image-upload";
// import IncidentDescription from "./incident-description";
// import IncidentSubtype from "./incident-subtype";
// import IncidentType from "./incident-type";
// import Location from "./location";
import { reportStore } from "@/lib/store";
import { GearFine } from "@phosphor-icons/react";
import { Popover, PopoverContent, PopoverTrigger } from "@repo/ui/popover";
import { useEffect, useMemo } from "react";
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
  const step = reportStore((state) => state.step);

  // Get user data from the store - memoized to prevent infinite loops
  const userData = useMemo(() => {
    return {
      reporter_first_name: reportStore.getState().reporter_first_name,
      reporter_last_name: reportStore.getState().reporter_last_name,
      reporter_email: reportStore.getState().reporter_email,
      reporter_phone: reportStore.getState().reporter_phone,
      imageUrl: reportStore.getState().imageUrl,
    };
  }, [step]); // Only recalculate when the step changes

  // Log data when on the final step
  useEffect(() => {
    if (step === 2) {
      log("Final submission step - User data from store", userData);
    }
  }, [step, userData]);

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
        {step === 0 && <ImageUpload />}
        {/* <Location />
        <IncidentType incidentTypes={incidentTypes} />
        <IncidentSubtype incidentSubtypes={incidentSubtypes} />
        <IncidentDescription /> */}
        {step === 1 && <UserData />}
        {step === 2 && (
          <div className="flex-1 bg-blue-400 pb-[66px]">
            {/* Hidden inputs to hold user data from store */}
            <input
              type="hidden"
              name="reporter_first_name"
              value={userData.reporter_first_name}
            />
            <input
              type="hidden"
              name="reporter_last_name"
              value={userData.reporter_last_name}
            />
            <input
              type="hidden"
              name="reporter_email"
              value={userData.reporter_email}
            />
            <input
              type="hidden"
              name="reporter_phone"
              value={userData.reporter_phone}
            />

            {/* Image preview instead of hidden input */}
            {userData.imageUrl && (
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2">Image Preview:</h3>
                <div className="relative w-full h-64 overflow-hidden rounded-lg">
                  <img
                    src={userData.imageUrl}
                    alt="Report image"
                    className="object-cover w-full h-full"
                  />
                </div>
                {/* Still need the hidden input for the filename for form submission */}
                <input
                  type="hidden"
                  name="image-filename"
                  value={userData.imageUrl.split("/").pop() || ""}
                />
              </div>
            )}

            <div className="fixed bottom-0 w-full bg-pink-400 h-min">
              <div className="px-[5vw] md:px-6 py-2 flex justify-between items-center">
                <Button type="submit" className="w-full" disabled={pending}>
                  Submit
                </Button>
              </div>
            </div>
          </div>
        )}
      </form>

      {process.env.NEXT_PUBLIC_ENABLE_LOGGING === "true" && (
        <Popover>
          <PopoverTrigger className="fixed bottom-1/3 right-[5vw] bg-background rounded-full p-1">
            <GearFine size={24} />
          </PopoverTrigger>
          <PopoverContent>
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
          </PopoverContent>
        </Popover>
      )}
    </>
  );
};

export default ReportFlow;
