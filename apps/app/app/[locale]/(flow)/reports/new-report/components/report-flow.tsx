"use client";
import { log } from "@/lib/logger";
import { reportStore, useLocationStore } from "@/lib/store";
import { GearFine } from "@phosphor-icons/react";
import { Button } from "@repo/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@repo/ui/popover";
import { useLocale } from "next-intl";
import { useActionState, useEffect, useMemo } from "react";
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
  const step = reportStore((state) => state.step);

  // Get user data from the store - memoized to prevent infinite loops
  const storeData = useMemo(() => {
    return {
      // User data
      reporter_first_name: reportStore.getState().reporter_first_name,
      reporter_last_name: reportStore.getState().reporter_last_name,
      reporter_email: reportStore.getState().reporter_email,
      reporter_phone: reportStore.getState().reporter_phone,
      // Incident data
      incident_type_id: reportStore.getState().incident_type_id,
      incident_type_name: reportStore.getState().incident_type_name,
      incident_subtype_id: reportStore.getState().incident_subtype_id,
      incident_subtype_name: reportStore.getState().incident_subtype_name,
      description: reportStore.getState().description,
      // Location data
      location_lat: reportStore.getState().location_lat,
      location_lng: reportStore.getState().location_lng,
      location_address: reportStore.getState().location_address,
      // Image data
      imageUrl: reportStore.getState().imageUrl,
    };
  }, [step]); // Only recalculate when the step changes

  // Log data when on the final step
  useEffect(() => {
    if (step === 6) {
      log("Final submission step - Data from store", storeData);
    }
  }, [step, storeData]);

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

      <form
        action={formAction}
        className="flex-1 h-full flex flex-col gap-16"
        onSubmit={(e) => {
          // Only allow form submission on the final step
          if (step !== 6) {
            e.preventDefault();
          }
        }}
      >
        <input type="hidden" name="locale" value={locale} />

        {/* Step 0: Image Upload */}
        {step === 0 && <ImageUpload />}

        {/* Step 1: Location */}
        {step === 1 && <Location />}

        {/* Step 2: Incident Type */}
        {step === 2 && (
          <IncidentType
            incidentTypes={incidentTypes}
            incidentSubtypes={incidentSubtypes}
          />
        )}

        {/* Step 3: Incident Subtype */}
        {step === 3 && <IncidentSubtype incidentSubtypes={incidentSubtypes} />}

        {/* Step 4: Incident Description */}
        {step === 4 && <IncidentDescription />}

        {/* Step 5: User Data */}
        {step === 5 && <UserData />}

        {/* Step 6: Final submission/summary */}
        {step === 6 && (
          <div className="flex-1 bg-blue-400 pb-[66px]">
            {/* Hidden inputs for user data */}
            <input
              type="hidden"
              name="reporter_first_name"
              value={storeData.reporter_first_name}
            />
            <input
              type="hidden"
              name="reporter_last_name"
              value={storeData.reporter_last_name}
            />
            <input
              type="hidden"
              name="reporter_email"
              value={storeData.reporter_email}
            />
            <input
              type="hidden"
              name="reporter_phone"
              value={storeData.reporter_phone}
            />

            {/* Hidden inputs for incident data */}
            <input
              type="hidden"
              name="incident_type_id"
              value={storeData.incident_type_id}
            />
            <input
              type="hidden"
              name="incident_subtype_id"
              value={storeData.incident_subtype_id}
            />
            <input
              type="hidden"
              name="description"
              value={storeData.description}
            />

            {/* Hidden inputs for location data */}
            {storeData.location_lat && storeData.location_lng && (
              <>
                <input
                  type="hidden"
                  name="location_lat"
                  value={storeData.location_lat}
                />
                <input
                  type="hidden"
                  name="location_lng"
                  value={storeData.location_lng}
                />
                <input
                  type="hidden"
                  name="location_address"
                  value={storeData.location_address}
                />
              </>
            )}

            {/* Hidden input for image filename */}
            {storeData.imageUrl && (
              <input
                type="hidden"
                name="image-filename"
                value={storeData.imageUrl.split("/").pop() || ""}
              />
            )}

            {/* Image preview */}
            {storeData.imageUrl && (
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2">Image Preview:</h3>
                <div className="relative w-full h-64 overflow-hidden rounded-lg">
                  <img
                    src={storeData.imageUrl}
                    alt="Report image"
                    className="object-cover w-full h-full"
                  />
                </div>
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
