"use client";
import { Button } from "@repo/ui/button";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { submitReport } from "../actions";

const ReportFlow = () => {
  const t = useTranslations("components.reportFlow");
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);

    // Add client-side validation
    const invalidFiles = selectedFiles.filter(
      (file) =>
        file.size > 5 * 1024 * 1024 ||
        !["image/jpeg", "image/png", "image/webp"].includes(file.type)
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

      const result = await submitReport(formData);
      if (!result.success) {
        throw new Error(result.error);
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
