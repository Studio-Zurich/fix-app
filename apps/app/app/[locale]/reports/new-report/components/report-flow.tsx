"use client";
import { FILE_CONSTANTS } from "@/lib/constants";
import { useReportStore } from "@/lib/store";
import { ImageLocation } from "@/lib/types";
import { Button } from "@repo/ui/button";
import { Progress } from "@repo/ui/progress";
import { useLocale, useTranslations } from "next-intl";
import ImageUpload from "./image-upload";
import IncidentDescription from "./incident-description";
import IncidentSubtype from "./incident-subtype";
import IncidentType from "./incident-type";
import LocationMap from "./location-map";
import ReportSuccess from "./report-success";
import ReportSummary from "./report-summary";
import UserData from "./user-data";

const MAX_FILES = 5;

const ReportFlow = () => {
  const t = useTranslations("components.reportFlow");
  const locale = useLocale();
  const {
    files,
    location,
    selectedType,
    selectedSubtype,
    description,
    userData,
    currentStep,
    uploading,
    error,
    locationSubmitted,
    hasInteractedWithMap,
    setFiles,
    setLocation,
    setSelectedType,
    setSelectedSubtype,
    setDescription,
    setUserData,
    setCurrentStep,
    setError,
    setLocationSubmitted,
    setHasInteractedWithMap,
    submitReport,
  } = useReportStore();

  const handleLocationFound = (location: ImageLocation) => {
    // Just pass the detected location to location-map component
    // It will handle showing the dialog and setting the location if confirmed
    setLocation(location);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);

    if (selectedFiles.length > MAX_FILES) {
      setError(t("errors.tooManyFiles", { max: MAX_FILES }));
      return;
    }

    const oversizedFiles = selectedFiles.filter(
      (file) => file.size > FILE_CONSTANTS.MAX_SIZE
    );
    if (oversizedFiles.length > 0) {
      setError(t("errors.fileTooLarge"));
      return;
    }

    setFiles(selectedFiles);
    setError(null);
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const clearFiles = () => {
    setFiles([]);
    setError(null);
  };

  const handleBack = () => {
    if (currentStep === 2) {
      // Reset location and map interaction when going back from location step
      setLocation(null);
      setHasInteractedWithMap(false);
    }
    setCurrentStep(currentStep - 1);
  };

  const handleNext = () => {
    if (currentStep === 2) {
      setLocationSubmitted(true);
    }
    setCurrentStep(currentStep + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitReport(locale as "de" | "en");
    setCurrentStep(8);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            <ImageUpload
              files={files}
              setFiles={setFiles}
              onLocationFound={handleLocationFound}
              isUploading={uploading}
            />
            <div className="p-2 bg-green-300/50 w-full flex justify-between">
              <Button type="button" disabled variant="outline">
                {t("back")}
              </Button>
              <Button
                type="button"
                onClick={handleNext}
                disabled={uploading}
                className="ml-auto"
              >
                {t("next")}
              </Button>
            </div>
          </>
        );

      case 2:
        return (
          <>
            <LocationMap
              onLocationSelect={setLocation}
              initialLocation={location}
              locationSubmitted={locationSubmitted}
              hasInteractedWithMap={hasInteractedWithMap}
              onMapInteraction={() => setHasInteractedWithMap(true)}
              setHasInteractedWithMap={setHasInteractedWithMap}
            />

            <div className="p-2 bg-green-300/50 w-full flex justify-between">
              <Button variant="outline" type="button" onClick={handleBack}>
                {t("back")}
              </Button>
              <Button type="button" onClick={handleNext} disabled={!location}>
                {t("next")}
              </Button>
            </div>
          </>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold mb-4">
              {t("selectIncidentType")}
            </h2>
            <IncidentType
              onSelect={setSelectedType}
              selectedType={selectedType}
              onNext={handleNext}
              onBack={handleBack}
            />
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold mb-4">
              {t("selectIncidentSubtype")}
            </h2>
            <IncidentSubtype
              selectedType={selectedType!}
              onSelect={setSelectedSubtype}
              selectedSubtype={selectedSubtype}
              onNext={handleNext}
              onBack={handleBack}
            />
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold mb-4">
              {t("addDescription")}
            </h2>
            <IncidentDescription
              selectedType={{
                type: selectedType!,
                subtype: selectedSubtype,
              }}
              onDescriptionChange={setDescription}
              onNext={handleNext}
              onBack={handleBack}
              initialDescription={description?.text}
            />
          </div>
        );

      case 6:
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold mb-4">
              {t("userData.title")}
            </h2>
            <UserData
              onDataChange={setUserData}
              onNext={handleNext}
              onBack={handleBack}
              initialData={userData}
            />
          </div>
        );

      case 7:
        return (
          <div className="space-y-4">
            <ReportSummary
              files={files}
              location={location!}
              selectedType={{
                type: selectedType!,
                subtype: selectedSubtype,
              }}
              description={description}
              userData={userData!}
              onBack={handleBack}
              onSubmit={handleSubmit}
              isSubmitting={uploading}
              onEditImages={() => setCurrentStep(1)}
              onEditLocation={() => setCurrentStep(2)}
              onEditType={() => setCurrentStep(3)}
              onEditDescription={() => setCurrentStep(5)}
              onEditUserData={() => setCurrentStep(6)}
            />
          </div>
        );

      case 8:
        return <ReportSuccess />;

      default:
        return null;
    }
  };

  return (
    <section className="flex flex-col flex-1 gap-4">
      <Progress
        value={((currentStep === 7 ? 8 : currentStep) * 100) / 8}
        max={100}
      />
      <form
        onSubmit={handleSubmit}
        className="relative flex flex-col flex-1 overflow-hidden bg-amber-200"
      >
        <div className="flex flex-col flex-1">
          <div className="flex-1 overflow-y-auto flex flex-col">
            {renderStep()}
            {error && (
              <p id="file-error" role="alert" className="text-red-500">
                {error}
              </p>
            )}
          </div>
        </div>
      </form>
    </section>
  );
};

export default ReportFlow;
