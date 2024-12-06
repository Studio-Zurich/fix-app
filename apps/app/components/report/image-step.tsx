import { useReportStore } from "@/lib/store";
import { createClient } from "@/lib/supabase/client";
import { Alert, AlertDescription } from "@repo/ui/alert";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import { ChangeEvent, useEffect, useState } from "react";

export const ImageStep = () => {
  const { reportData, updateReportData } = useReportStore();
  const [error, setError] = useState<string>();
  const [uploading, setUploading] = useState(false);

  // Cleanup temp files when component unmounts or when images are removed from state
  const cleanupTempFiles = async (paths: string[]) => {
    if (paths.length === 0) return;

    try {
      const supabase = createClient();
      await supabase.storage.from("report-images").remove(paths);
    } catch (err) {
      console.error("Error cleaning up temp files:", err);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      const tempPaths = reportData.images
        .filter((img) => img.storagePath.startsWith("temp/"))
        .map((img) => img.storagePath);
      cleanupTempFiles(tempPaths);
    };
  }, [reportData.images]);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setError(undefined);
    setUploading(true);

    try {
      const invalidFiles = files.filter(
        (file) => !file.type.startsWith("image/")
      );
      if (invalidFiles.length > 0) {
        setError("Please upload only image files");
        return;
      }

      const oversizedFiles = files.filter(
        (file) => file.size > 5 * 1024 * 1024
      );
      if (oversizedFiles.length > 0) {
        setError("Files must be less than 5MB");
        return;
      }

      const updatedImages = [...reportData.images];
      if (updatedImages.length + files.length > 5) {
        setError("Maximum 5 images allowed");
        return;
      }

      const supabase = createClient();

      // Upload each file directly to Supabase storage
      const newImages = await Promise.all(
        files.map(async (file) => {
          const tempPath = `temp/${Date.now()}-${file.name}`;

          const { error: uploadError } = await supabase.storage
            .from("report-images")
            .upload(tempPath, file);

          if (uploadError) throw uploadError;

          return {
            previewUrl: URL.createObjectURL(file),
            storagePath: tempPath,
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
          };
        })
      );

      updateReportData({ images: [...reportData.images, ...newImages] });
    } catch (err) {
      setError("Error uploading images");
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = async (index: number) => {
    try {
      const imageToRemove = reportData.images[index];
      if (!imageToRemove) return;

      // Only remove from storage if it's a temp file
      if (imageToRemove.storagePath.startsWith("temp/")) {
        const supabase = createClient();
        const { error: removeError } = await supabase.storage
          .from("report-images")
          .remove([imageToRemove.storagePath]);

        if (removeError) throw removeError;
      }

      // Update state
      const newImages = [...reportData.images];
      newImages.splice(index, 1);
      updateReportData({ images: newImages });
    } catch (err) {
      setError("Error removing image");
      console.error(err);
    }
  };

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <div className="grid w-full max-w-sm items-center gap-1.5 mx-auto">
          <Label htmlFor="image-upload">Bilder hochladen</Label>
          <Input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
            id="image-upload"
            disabled={uploading}
          />
          <Label
            htmlFor="image-upload"
            className={`px-4 py-2 bg-blue-600 text-white rounded-md cursor-pointer hover:bg-blue-700 ${
              uploading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {uploading ? "Wird hochgeladen..." : "Bilder auswählen"}
          </Label>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {reportData.images.length > 0 && (
        <div className="grid grid-cols-2 gap-4 mt-4">
          {reportData.images.map((image, index) => (
            <div key={index} className="relative">
              <img
                src={image.previewUrl}
                alt={`Upload ${index + 1}`}
                className="w-full h-48 h-48 object-cover rounded-lg"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-lg hover:bg-gray-100"
                aria-label="Bild entfernen"
              >
                ✕
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
