"use client";
import { FILE_CONSTANTS } from "@/lib/constants";
import {
  IncidentSubtypeType,
  IncidentTypeType,
  Location,
  ReportDescription,
  UserData as UserDataType,
} from "@/lib/types";
import { Button } from "@repo/ui/button";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { submitReport } from "../actions";
import IncidentDescription from "./incident-description";
import IncidentSubtype from "./incident-subtype";
import IncidentType from "./incident-type";
import LocationMap from "./location-map";
import ReportSummary from "./report-summary";
import UserData from "./user-data";

const MAX_FILES = 5;

const ReportFlow = () => {
  const t = useTranslations("components.reportFlow");
  const locale = useLocale();
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<Location | null>(null);
  const [selectedType, setSelectedType] = useState<
    IncidentTypeType | undefined
  >(undefined);
  const [selectedSubtype, setSelectedSubtype] = useState<
    IncidentSubtypeType | undefined
  >(undefined);
  const [description, setDescription] = useState<ReportDescription | undefined>(
    undefined
  );
  const [currentStep, setCurrentStep] = useState(1);
  const [userData, setUserData] = useState<UserDataType | undefined>(undefined);

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

  const handleTypeSelect = (type: IncidentTypeType) => {
    setSelectedType(type);
    setSelectedSubtype(undefined); // Clear subtype when changing type
  };

  const handleSubtypeSelect = (subtype: IncidentSubtypeType) => {
    setSelectedSubtype(subtype);
  };

  const handleDescriptionChange = (newDescription: ReportDescription) => {
    setDescription(newDescription);
  };

  const handleUserDataChange = (data: UserDataType) => {
    setUserData(data);
  };

  const handleNext = () => {
    setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!location || !selectedType || !userData) {
      setError(t("errors.missingRequiredFields"));
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));
      formData.append("locale", locale);
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

      const result = await submitReport(formData);
      if (!result.success) {
        setError(result.error?.message || t("errors.uploadFailed"));
        return;
      }

      // Clear form after successful upload
      setFiles([]);
      setLocation(null);
      setSelectedType(undefined);
      setSelectedSubtype(undefined);
      setDescription(undefined);
      setUserData(undefined);
      setCurrentStep(1);
    } catch (err) {
      setError(t("errors.uploadFailed"));
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="relative">
              <input
                type="file"
                accept="image/jpeg,image/png,image/gif"
                multiple
                onChange={handleFileChange}
                disabled={uploading}
                aria-label={t("takePhotoOrChooseImage")}
                aria-describedby={error ? "file-error" : undefined}
                className="hidden"
                id="file-input"
              />
              <label
                htmlFor="file-input"
                className={`block w-full p-4 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                  uploading
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-gray-50"
                }`}
              >
                {files.length > 0 ? (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span>
                        {files.length === 1
                          ? t("filesSelected", { count: files.length })
                          : t("filesSelectedPlural", { count: files.length })}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          clearFiles();
                        }}
                        disabled={uploading}
                      >
                        {t("clearAll")}
                      </Button>
                    </div>
                    <div className="text-sm text-gray-500 space-y-1">
                      {files.map((file, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center group"
                        >
                          <div className="flex items-center gap-2">
                            <span>{file.name}</span>
                            <span className="text-gray-400">
                              ({formatFileSize(file.size)})
                            </span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault();
                              removeFile(index);
                            }}
                            disabled={uploading}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            {t("remove")}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <span>{t("takePhotoOrChooseImage")}</span>
                )}
              </label>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleNext} disabled={uploading}>
                {t("next")}
              </Button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold mb-4">
              {t("selectLocation")}
            </h2>
            <LocationMap onLocationSelect={setLocation} />
            {location && (
              <p className="mt-2 text-sm text-gray-500">
                {t("selectedLocation", { address: location.address })}
              </p>
            )}
            <div className="flex justify-between">
              <Button variant="outline" onClick={handleBack}>
                {t("back")}
              </Button>
              <Button onClick={handleNext} disabled={!location}>
                {t("next")}
              </Button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold mb-4">
              {t("selectIncidentType")}
            </h2>
            <IncidentType
              onSelect={handleTypeSelect}
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
              onSelect={handleSubtypeSelect}
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
              onDescriptionChange={handleDescriptionChange}
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
              onDataChange={handleUserDataChange}
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
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {renderStep()}
      {error && (
        <p id="file-error" role="alert" className="text-red-500">
          {error}
        </p>
      )}
    </form>
  );
};

export default ReportFlow;
