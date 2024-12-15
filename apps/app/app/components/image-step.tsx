"use client";

import { useReportStore } from "@/lib/store";
import { ImageSquare, Trash, UploadSimple } from "@phosphor-icons/react";
import { Button } from "@repo/ui/button";
import ExifReader from "exifreader";
import { useState } from "react";

interface ImageMetadata {
  name: string;
  size: string;
  type: string;
  location?: {
    lat?: number;
    lng?: number;
    address?: string;
  };
  dateTaken?: string;
  camera?: {
    make?: string;
    model?: string;
  };
  settings?: {
    exposureTime?: string;
    fNumber?: number;
    iso?: number;
  };
}

// Helper function to convert GPS coordinates from EXIF format to decimal
const convertGPSToDecimal = (
  degrees: number,
  minutes: number,
  seconds: number,
  direction: string
) => {
  let decimal = degrees + minutes / 60 + seconds / 3600;
  if (direction === "S" || direction === "W") {
    decimal = -decimal;
  }
  return decimal;
};

// New helper function to extract EXIF metadata
const extractMetadata = async (file: File): Promise<Partial<ImageMetadata>> => {
  try {
    const tags = await ExifReader.load(file);
    const metadata: Partial<ImageMetadata> = {};

    // Extract date
    if (tags.DateTimeOriginal) {
      metadata.dateTaken = new Date(
        tags.DateTimeOriginal.description
      ).toLocaleString();
    }

    // Extract camera info
    if (tags.Make || tags.Model) {
      metadata.camera = {
        make: tags.Make?.description,
        model: tags.Model?.description,
      };
    }

    // Extract camera settings
    if (tags.ExposureTime || tags.FNumber || tags.ISOSpeedRatings) {
      metadata.settings = {
        exposureTime: tags.ExposureTime?.description,
        fNumber: Number(tags.FNumber?.description),
        iso: Number(tags.ISOSpeedRatings?.description),
      };
    }

    // Extract GPS data
    if (tags.GPSLatitude && tags.GPSLongitude) {
      const lat = convertGPSToDecimal(
        Number(tags.GPSLatitude.value[0]),
        Number(tags.GPSLatitude.value[1]),
        Number(tags.GPSLatitude.value[2]),
        String(tags.GPSLatitudeRef?.value || "N")
      );

      const lng = convertGPSToDecimal(
        Number(tags.GPSLongitude.value[0]),
        Number(tags.GPSLongitude.value[1]),
        Number(tags.GPSLongitude.value[2]),
        String(tags.GPSLongitudeRef?.value || "E")
      );

      metadata.location = { lat, lng };
    }

    return metadata;
  } catch (error) {
    console.log("Error extracting metadata:", error);
    return {};
  }
};

export default function ImageStep() {
  const images = useReportStore((state) => state.images);
  const setImages = useReportStore((state) => state.setImages);
  const [metadata, setMetadata] = useState<ImageMetadata[]>([]);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files) return;

    const newImages: string[] = [...images];
    const newMetadata: ImageMetadata[] = [...metadata];

    for (const file of Array.from(files)) {
      // Extract all metadata
      const extractedMetadata = await extractMetadata(file);

      // Fetch address if location exists
      let address: string | undefined;
      if (extractedMetadata.location) {
        try {
          const response = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${extractedMetadata.location.lng},${extractedMetadata.location.lat}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}`
          );
          const data = await response.json();
          address = data.features[0]?.place_name;
        } catch (error) {
          console.error("Error fetching address:", error);
        }
      }

      // Read the file and create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        if (typeof e.target?.result === "string") {
          newImages.push(e.target.result);
          newMetadata.push({
            name: file.name,
            size: formatFileSize(file.size),
            type: file.type,
            ...extractedMetadata,
            location: extractedMetadata.location
              ? { ...extractedMetadata.location, address }
              : undefined,
          });

          setImages(newImages);
          setMetadata(newMetadata);

          // Update report location if this is the first image with location data
          if (extractedMetadata.location && newImages.length === 1) {
            useReportStore.getState().setLocation({
              lat: extractedMetadata.location.lat!,
              lng: extractedMetadata.location.lng!,
              address: address || "",
            });
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDelete = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    const newMetadata = metadata.filter((_, i) => i !== index);
    setImages(newImages);
    setMetadata(newMetadata);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold">Upload Images</h2>
        <p className="text-sm text-muted-foreground">
          Add photos of the incident (optional)
        </p>
      </div>

      <div className="flex justify-center">
        <Button
          variant="outline"
          className="w-full max-w-sm"
          onClick={() => document.getElementById("image-upload")?.click()}
        >
          <UploadSimple className="w-5 h-5 mr-2" />
          Upload Image
        </Button>
        <input
          type="file"
          id="image-upload"
          className="hidden"
          accept="image/*"
          multiple
          onChange={handleFileUpload}
        />
      </div>

      {images.length > 0 && (
        <div className="space-y-4">
          {images.map((image, index) => (
            <div
              key={index}
              className="border rounded-lg overflow-hidden bg-muted/50"
            >
              <img
                src={image}
                alt={`Uploaded ${index + 1}`}
                className="w-full h-48 object-cover"
              />
              <div className="p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <ImageSquare className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {metadata[index]?.name}
                      </span>
                    </div>

                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>{metadata[index]?.size}</p>

                      {metadata[index]?.dateTaken && (
                        <p>📅 Taken: {metadata[index].dateTaken}</p>
                      )}

                      {metadata[index]?.camera && (
                        <p>
                          📸 Camera: {metadata[index].camera.make}{" "}
                          {metadata[index].camera.model}
                        </p>
                      )}

                      {metadata[index]?.settings && (
                        <p>
                          ⚙️ Settings:
                          {metadata[index].settings.exposureTime &&
                            ` ${metadata[index].settings.exposureTime}s`}
                          {metadata[index].settings.fNumber &&
                            ` f/${metadata[index].settings.fNumber}`}
                          {metadata[index].settings.iso &&
                            ` ISO ${metadata[index].settings.iso}`}
                        </p>
                      )}

                      {metadata[index]?.location && (
                        <p>
                          📍{" "}
                          {metadata[index].location.address ||
                            `${metadata[index].location.lat?.toFixed(6)}, ${metadata[index].location.lng?.toFixed(6)}`}
                        </p>
                      )}
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    onClick={() => handleDelete(index)}
                  >
                    <Trash className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
