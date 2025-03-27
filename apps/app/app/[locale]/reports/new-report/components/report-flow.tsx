"use client";
import { FILE_CONSTANTS } from "@/lib/constants";
import { Button } from "@repo/ui/button";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { submitReport } from "../actions";

const ReportFlow = () => {
  const t = useTranslations("components.reportFlow");
  const locale = useLocale();
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);

    // Add client-side validation
    const invalidFiles = selectedFiles.filter(
      (file) =>
        file.size > FILE_CONSTANTS.MAX_SIZE ||
        !FILE_CONSTANTS.ALLOWED_TYPES.includes(
          file.type as (typeof FILE_CONSTANTS.ALLOWED_TYPES)[number]
        )
    );

    if (invalidFiles.length > 0) {
      setError(t("errors.invalidFileType"));
      return;
    }

    setFiles(selectedFiles);
    setError(null);
  };

  const handleUpload = async () => {
    if (!files.length) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));
      formData.append("locale", locale);

      const result = await submitReport(formData);
      if (!result.success) {
        throw new Error(result.error?.message);
      }

      // Clear files after successful upload
      setFiles([]);
    } catch (err) {
      setError(t("errors.uploadFailed"));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={handleFileChange}
        disabled={uploading}
      />

      {files.length > 0 && (
        <Button onClick={handleUpload} disabled={uploading}>
          {uploading ? t("uploading") : t("uploadImage")}
        </Button>
      )}

      {error && <p role="alert">{error}</p>}
    </div>
  );
};

export default ReportFlow;
