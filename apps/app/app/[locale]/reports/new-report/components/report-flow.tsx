"use client";
import { FILE_CONSTANTS } from "@/lib/constants";
import { useReportStore } from "@/lib/store";
import { ImageLocation } from "@/lib/types";
import { Button } from "@repo/ui/button";
import { Progress } from "@repo/ui/progress";
import { useLocale, useTranslations } from "next-intl";
import { submitReport } from "../actions";
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
    detectedLocation,
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
    setDetectedLocation,
    setSelectedType,
    setSelectedSubtype,
    setDescription,
    setUserData,
    setCurrentStep,
    setError,
    setLocationSubmitted,
    setHasInteractedWithMap,
    setUploading,
    resetForm,
  } = useReportStore();

  const handleLocationFound = (location: ImageLocation | null) => {
    setDetectedLocation(location);
    if (location) {
      setLocation(location);
    } else {
      setLocation(null);
      setLocationSubmitted(false);
      setHasInteractedWithMap(false);
    }
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
    setDetectedLocation(null);
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
      // Only reset map interaction when going back from location step
      setHasInteractedWithMap(false);
    }
    if (currentStep === 5) {
      // Skip subtype step (4) if the selected type has no subtypes
      if (!selectedType?.has_subtypes) {
        setCurrentStep(3);
        return;
      }
    }
    setCurrentStep(currentStep - 1);
  };

  const handleNext = () => {
    if (currentStep === 2) {
      // Only set locationSubmitted when user confirms the location
      if (location) {
        setLocationSubmitted(true);
      }
    }
    if (currentStep === 3) {
      // Skip to description step (5) if the selected type has no subtypes
      if (!selectedType?.has_subtypes) {
        setCurrentStep(5);
        return;
      }
    }
    setCurrentStep(currentStep + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!location || !selectedType || !userData) {
      setError(t("errors.missingRequiredFields"));
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));
      formData.append("locale", locale as "de" | "en");
      formData.append("location", JSON.stringify(location));
      formData.append(
        "incidentType",
        JSON.stringify({
          type: selectedType,
          subtype: selectedSubtype,
        })
      );
      if (description) {
        formData.append("description", JSON.stringify(description));
      }
      formData.append("userData", JSON.stringify(userData));

      console.log("Submitting form data:", {
        filesCount: files.length,
        locale,
        location,
        incidentType: {
          type: selectedType,
          subtype: selectedSubtype,
        },
        description,
        userData,
      });

      const result = await submitReport(formData);
      console.log("Submit result:", result);

      // Check if result is undefined or doesn't have a success property
      if (!result || typeof result.success === "undefined") {
        console.error("Invalid result from submitReport:", result);
        setError(
          "Server returned an invalid response. Please try again later."
        );
        return;
      }

      if (!result.success) {
        // Handle specific error codes from the server
        switch (result.error?.code) {
          case "TOO_MANY_FILES":
            setError("Too many files were uploaded. Maximum allowed is 5.");
            break;
          case "INVALID_FILE_TYPE":
            setError(
              "One or more files have an invalid file type. Please upload images only."
            );
            break;
          case "PROCESSING_FAILED":
            setError(
              "Failed to process one or more images. Please try again with different images."
            );
            break;
          case "DATABASE_ERROR":
            setError(
              "Failed to save the report to the database. Please try again later."
            );
            break;
          case "UPLOAD_FAILED":
            setError(
              "Failed to upload one or more images. Please check your internet connection and try again."
            );
            break;
          default:
            setError(
              result.error?.message ||
                "An unexpected error occurred. Please try again later."
            );
        }
        return;
      }

      // Reset form after successful upload
      resetForm();
      setCurrentStep(8);
    } catch (err) {
      console.error("Error in handleSubmit:", err);
      // Handle different types of errors
      if (err instanceof TypeError && err.message.includes("fetch")) {
        setError(
          "Network error. Please check your internet connection and try again."
        );
      } else if (err instanceof Error) {
        setError(`Error: ${err.message}`);
      } else {
        setError("An unexpected error occurred. Please try again later.");
      }
    } finally {
      setUploading(false);
    }
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
              locationSubmitted={locationSubmitted}
              detectedLocation={detectedLocation}
            />
            <div className="py-2 w-full flex justify-between">
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
              detectedLocation={detectedLocation}
            />

            <div className="py-2 w-full flex justify-between">
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
          <>
            <IncidentType
              onSelect={setSelectedType}
              selectedType={selectedType}
            />

            <div className="py-2  w-full flex justify-between">
              <Button variant="outline" type="button" onClick={handleBack}>
                {t("back")}
              </Button>
              <Button
                type="button"
                onClick={handleNext}
                disabled={!selectedType}
                className="ml-auto"
              >
                {t("next")}
              </Button>
            </div>
          </>
        );

      case 4:
        return (
          <>
            <IncidentSubtype
              selectedType={selectedType!}
              onSelect={setSelectedSubtype}
              selectedSubtype={selectedSubtype}
            />

            <div className="py-2  w-full flex justify-between">
              <Button variant="outline" type="button" onClick={handleBack}>
                {t("back")}
              </Button>
              <Button
                type="button"
                onClick={handleNext}
                disabled={!selectedSubtype}
                className="ml-auto"
              >
                {t("next")}
              </Button>
            </div>
          </>
        );

      case 5:
        return (
          <>
            <IncidentDescription
              selectedType={{
                type: selectedType!,
                subtype: selectedSubtype,
              }}
              onDescriptionChange={setDescription}
              initialDescription={description?.text}
            />

            <div className="py-2  w-full flex justify-between">
              <Button variant="outline" type="button" onClick={handleBack}>
                {t("back")}
              </Button>
              <Button
                type="button"
                onClick={handleNext}
                disabled={!description?.text}
                className="ml-auto"
              >
                {t("next")}
              </Button>
            </div>
          </>
        );

      case 6:
        return (
          <>
            <UserData onDataChange={setUserData} initialData={userData} />

            <div className="py-2  w-full flex justify-between">
              <Button variant="outline" type="button" onClick={handleBack}>
                {t("back")}
              </Button>
              <Button
                type="button"
                onClick={handleNext}
                disabled={
                  !userData?.firstName ||
                  !userData?.lastName ||
                  !userData?.email
                }
                className="ml-auto"
              >
                {t("next")}
              </Button>
            </div>
          </>
        );

      case 7:
        return (
          <>
            <ReportSummary
              files={files}
              location={location!}
              selectedType={{
                type: selectedType!,
                subtype: selectedSubtype,
              }}
              description={description}
              userData={userData!}
              onSubmit={handleSubmit}
              isSubmitting={uploading}
              onEditImages={() => setCurrentStep(1)}
              onEditLocation={() => setCurrentStep(2)}
              onEditType={() => setCurrentStep(3)}
              onEditDescription={() => setCurrentStep(5)}
              onEditUserData={() => setCurrentStep(6)}
            />

            <div className="py-2  w-full">
              <Button
                type="submit"
                onClick={handleSubmit}
                disabled={uploading}
                className="w-full"
              >
                {uploading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {t("uploading")}
                  </div>
                ) : (
                  t("submit")
                )}
              </Button>
            </div>
          </>
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
        className="relative flex flex-col flex-1 overflow-hidden"
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
