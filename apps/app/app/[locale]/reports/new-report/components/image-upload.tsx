"use client";
import { FILE_CONSTANTS } from "@/lib/constants";
import { Button } from "@repo/ui/button";
import { useTranslations } from "next-intl";
import { useState } from "react";

interface ImageUploadProps {
  onNext: () => void;
  isUploading: boolean;
  files: File[];
  setFiles: (files: File[]) => void;
}

const MAX_FILES = 5;

const ImageUpload = ({
  onNext,
  isUploading,
  files,
  setFiles,
}: ImageUploadProps) => {
  const t = useTranslations("components.reportFlow");
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
          disabled={isUploading}
          aria-label={t("takePhotoOrChooseImage")}
          aria-describedby={error ? "file-error" : undefined}
          className="hidden"
          id="file-input"
        />
        <label
          htmlFor="file-input"
          className={`block w-full p-4 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
            isUploading ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"
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
                  disabled={isUploading}
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
                      disabled={isUploading}
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
        <Button onClick={onNext} disabled={isUploading}>
          {t("next")}
        </Button>
      </div>
      {error && (
        <p id="file-error" role="alert" className="text-red-500">
          {error}
        </p>
      )}
    </div>
  );
};

export default ImageUpload;
