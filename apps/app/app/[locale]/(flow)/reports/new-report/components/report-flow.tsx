"use client";
import { log } from "@/lib/logger";
import { reportStore, useLocationStore } from "@/lib/store";
import { GearFine, PencilSimple } from "@phosphor-icons/react";
import { Button } from "@repo/ui/button";
import { TypographyH1, TypographyH2, TypographyH3 } from "@repo/ui/headline";
import { Popover, PopoverContent, PopoverTrigger } from "@repo/ui/popover";
import { Progress } from "@repo/ui/progress";
import { TypographyParagraph } from "@repo/ui/text";
import { useLocale, useTranslations } from "next-intl";
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
  const t = useTranslations("components.reportFlow");
  // Use the useActionState hook to handle form submission
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    submitReport,
    { success: false, message: "" }
  );
  const locale = useLocale();
  const detectedLocation = useLocationStore((state) => state.detectedLocation);
  const step = reportStore((state) => state.step);
  const isSubmitted = reportStore((state) => state.isSubmitted);
  const resetReport = reportStore((state) => state.resetReport);

  // Check if the report was submitted via the store flag
  useEffect(() => {
    const storeState = reportStore.getState();

    if (storeState.isSubmitted) {
      log("Report was submitted via store flag, resetting flow state");
      resetReport();
    }
  }, [resetReport]);

  // NEW: Check if the server action returned success and reset the report
  useEffect(() => {
    if (state.success) {
      log("Form submission was successful, resetting report");
      resetReport();

      // Optionally navigate to a success page or show a success message
      // This could redirect to the home page or somewhere else
      // window.location.href = '/';
    }
  }, [state.success, resetReport]);

  // Get user data from the store - memoized to prevent infinite loops
  const storeData = useMemo(() => {
    const state = reportStore.getState();
    return {
      // User data
      reporter_first_name: state.user_step.reporter_first_name,
      reporter_last_name: state.user_step.reporter_last_name,
      reporter_email: state.user_step.reporter_email,
      reporter_phone: state.user_step.reporter_phone,
      // Incident data
      incident_type_id: state.incident_step.incident_type_id,
      incident_type_name: state.incident_step.incident_type_name,
      incident_subtype_id: state.incident_step.incident_subtype_id,
      incident_subtype_name: state.incident_step.incident_subtype_name,
      description: state.incident_step.description,

      // Location data
      location_lat: state.location_step.set_location.latitude,
      location_lng: state.location_step.set_location.longitude,
      location_address: state.location_step.set_location.address,
      // Image data
      imageUrl: state.image_step.imageUrl,
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
      {step !== 1 && (
        <div className="px-[5vw] lg:px-6 py-2 text-center space-y-2">
          <TypographyH1 size="text-lg">{t("title")}</TypographyH1>
          <Progress value={(step / 6) * 100} />
        </div>
      )}
      <form
        action={formAction}
        className="flex-1 h-full flex flex-col"
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
          <div className="flex-1 relative space-y-8 h-svh overflow-hidden flex flex-col px-[5vw] lg:px-6">
            <div className="space-y-2 mt-4">
              <TypographyH2>{t("summary.title")}</TypographyH2>
              <TypographyParagraph className="text-muted-foreground">
                {t("summary.description")}
              </TypographyParagraph>
            </div>
            <div className="flex-1 flex flex-col space-y-6 pb-[66px] overflow-y-auto">
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
              {storeData.location_lat !== null &&
                storeData.location_lng !== null && (
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

              {/* Images Summary */}
              {storeData.imageUrl && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <TypographyH3 size="text-lg">
                      {t("summary.images.title")}
                    </TypographyH3>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => reportStore.setState({ step: 0 })}
                      className="h-8 w-8 p-0"
                    >
                      <PencilSimple className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    <div className="relative">
                      <img
                        src={storeData.imageUrl}
                        alt="Report image"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Location Summary */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <TypographyH3 size="text-lg">
                    {t("summary.location.title")}
                  </TypographyH3>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => reportStore.setState({ step: 1 })}
                    className="h-8 w-8 p-0"
                  >
                    <PencilSimple className="h-4 w-4" />
                  </Button>
                </div>
                <TypographyParagraph
                  size="text-sm"
                  className="text-muted-foreground"
                >
                  {storeData.location_address}
                </TypographyParagraph>
              </div>

              {/* Incident Type Summary */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <TypographyH3 size="text-lg">
                    {t("summary.incidentType.title")}
                  </TypographyH3>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => reportStore.setState({ step: 2 })}
                    className="h-8 w-8 p-0"
                  >
                    <PencilSimple className="h-4 w-4" />
                  </Button>
                </div>

                <TypographyParagraph
                  size="text-sm"
                  className="text-muted-foreground"
                >
                  {storeData.incident_type_name}
                </TypographyParagraph>
                {storeData.incident_subtype_name && (
                  <TypographyParagraph
                    size="text-sm"
                    className="text-muted-foreground"
                  >
                    {storeData.incident_subtype_name}
                  </TypographyParagraph>
                )}
              </div>

              {/* Description Summary */}
              {storeData.description && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <TypographyH3 size="text-lg">
                      {t("summary.incidentDescription.title")}
                    </TypographyH3>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => reportStore.setState({ step: 4 })}
                      className="h-8 w-8 p-0"
                    >
                      <PencilSimple className="h-4 w-4" />
                    </Button>
                  </div>
                  <TypographyParagraph
                    size="text-sm"
                    className="text-muted-foreground line-clamp-3"
                  >
                    {storeData.description}
                  </TypographyParagraph>
                </div>
              )}

              {/* User Data Summary */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <TypographyH3 size="text-lg">
                    {t("summary.contactInfo.title")}
                  </TypographyH3>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => reportStore.setState({ step: 5 })}
                    className="h-8 w-8 p-0"
                  >
                    <PencilSimple className="h-4 w-4" />
                  </Button>
                </div>

                <TypographyParagraph
                  size="text-sm"
                  className="text-muted-foreground"
                >
                  {storeData.reporter_first_name} {storeData.reporter_last_name}
                </TypographyParagraph>
                <TypographyParagraph
                  size="text-sm"
                  className="text-muted-foreground"
                >
                  {storeData.reporter_email}
                </TypographyParagraph>
                {storeData.reporter_phone && (
                  <TypographyParagraph
                    size="text-sm"
                    className="text-muted-foreground"
                  >
                    {storeData.reporter_phone}
                  </TypographyParagraph>
                )}
              </div>
            </div>
            <div className="fixed bottom-0 w-full left-0 bg-white py-3 px-4">
              <Button type="submit" className="w-full" disabled={pending}>
                {t("buttons.submit")}
              </Button>
            </div>
          </div>
        )}
      </form>

      {process.env.NEXT_PUBLIC_ENABLE_LOGGING === "true" && (
        <Popover>
          <PopoverTrigger className="fixed bottom-1/3 right-0 bg-background rounded-l-md p-1">
            <GearFine size={32} />
          </PopoverTrigger>
          <PopoverContent>
            <div className="text-sm font-mono">
              <p>
                <strong>{t("debug.formState")}</strong>{" "}
                {JSON.stringify(state, null, 2)}
              </p>
              <p>
                <strong>{t("debug.pending")}</strong>{" "}
                {pending ? t("debug.yes") : t("debug.no")}
              </p>

              <div className="mt-4">
                <p className="font-bold mb-2">
                  {t("debug.completeStoreState")}
                </p>
                <pre className="text-xs overflow-auto max-h-[300px] p-2 bg-gray-100 rounded">
                  {JSON.stringify(reportStore.getState(), null, 2)}
                </pre>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </>
  );
};

export default ReportFlow;
