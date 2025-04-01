"use client";

import { Button } from "@repo/ui/button";
import exifr from "exifr";
import { useState } from "react";

const Exif = () => {
  const [exifData, setExifData] = useState<any>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTakePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Read EXIF data
    try {
      const buffer = await file.arrayBuffer();
      const exif = await exifr.parse(buffer);
      setExifData(exif);
      setError(null);
    } catch (err) {
      console.error("Error reading EXIF:", err);
      setError("Failed to read EXIF data");
      setExifData(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Photo EXIF Data</h2>
        <p className="text-sm text-muted-foreground">
          Take a photo to see its EXIF metadata
        </p>
      </div>

      <input
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleTakePhoto}
        className="hidden"
        id="photo-input"
      />

      <label htmlFor="photo-input" className="block w-full cursor-pointer">
        <Button className="w-full">Take Photo</Button>
      </label>

      {preview && (
        <div className="relative">
          <img
            src={preview}
            alt="Preview"
            className="w-full max-w-md mx-auto rounded-lg"
          />
        </div>
      )}

      {error && <p className="text-red-500 text-sm">{error}</p>}

      {exifData && (
        <div className="space-y-2">
          <h3 className="font-medium">EXIF Data</h3>
          <div className="bg-muted p-4 rounded-lg space-y-1">
            {Object.entries(exifData).map(([key, value]) => (
              <div key={key} className="text-sm">
                <span className="font-medium">{key}:</span>{" "}
                <span>{JSON.stringify(value)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Exif;
