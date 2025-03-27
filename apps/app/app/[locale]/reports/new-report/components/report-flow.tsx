"use client";
import { FILE_CONSTANTS } from "@/lib/constants";
import { Button } from "@repo/ui/button";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { submitReport } from "../actions";

const MAX_FILES = 5;

const ReportFlow = () => {
  const t = useTranslations("components.reportFlow");
  const locale = useLocale();
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleUpload = async () => {
    if (!files.length) {
      setError(t("errors.noFilesSelected"));
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));
      formData.append("locale", locale);

      const result = await submitReport(formData);
      if (!result.success) {
        setError(result.error?.message || t("errors.uploadFailed"));
        return;
      }

      // Clear files after successful upload
      setFiles([]);
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
            uploading ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"
          }`}
        >
          {files.length > 0 ? (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span>{t("filesSelected", { count: files.length })}</span>
                <Button
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

      {files.length > 0 && (
        <Button onClick={handleUpload} disabled={uploading}>
          {uploading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              {t("uploading")}
            </div>
          ) : (
            t("uploadImage")
          )}
        </Button>
      )}

      {error && (
        <p id="file-error" role="alert" className="text-red-500">
          {error}
        </p>
      )}
    </div>
  );
};

export default ReportFlow;
