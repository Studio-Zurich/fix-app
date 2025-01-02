"use client";

import { useReportStore } from "@/lib/store";
import { Camera, ImageSquare, X } from "@phosphor-icons/react";
import { Button } from "@repo/ui/button";
import { TypographyParagraph } from "@repo/ui/text";
import exifr from "exifr";
import { useRef, useState } from "react";

// Helper function to convert decimal degrees to DMS format
function convertToDMS(decimal: number, isLatitude: boolean): string {
  const direction = isLatitude
    ? decimal >= 0
      ? "N"
      : "S"
    : decimal >= 0
      ? "E"
      : "W";

  const absolute = Math.abs(decimal);
  const degrees = Math.floor(absolute);
  const minutesDecimal = (absolute - degrees) * 60;
  const minutes = Math.floor(minutesDecimal);
  const seconds = ((minutesDecimal - minutes) * 60).toFixed(3);

  return `${degrees}° ${minutes}' ${seconds}" ${direction}`;
}

// Helper function to format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

type ImageMetadata = {
  fileInfo: {
    size: number;
    format: string;
  };
  coordinates?: {
    lat: number;
    lng: number;
  };
};

export default function ImageStep() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { images, setImages, setLocation, setImageMetadata, imagesMetadata } =
    useReportStore();
  const setCurrentStep = useReportStore((state) => state.setCurrentStep);
  const [captureMode, setCaptureMode] = useState<"upload" | "capture" | null>(
    null
  );

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files) return;

    const newImages = [...images];

    for (const file of files) {
      const objectUrl = URL.createObjectURL(file);
      newImages.push(objectUrl);

      const newMetadata = {
        fileInfo: {
          size: file.size,
          format: file.type.split("/")[1]?.toUpperCase() ?? "UNKNOWN",
        },
      } as ImageMetadata;

      // If this was a capture and we don't get GPS from EXIF, try to get current location
      if (captureMode === "capture") {
        try {
          const position = await new Promise<GeolocationPosition>(
            (resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0,
              });
            }
          );

          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          newMetadata.coordinates = coords;
          setLocation({
            lat: coords.lat,
            lng: coords.lng,
            address: "",
          });
        } catch (error) {
          console.error("Error getting current location:", error);
        }
      } else {
        // Try to get EXIF data for uploaded images
        try {
          const output = await exifr.gps(file);
          if (output?.latitude && output?.longitude) {
            const coords = {
              lat: output.latitude,
              lng: output.longitude,
            };
            newMetadata.coordinates = coords;
            setLocation({
              lat: coords.lat,
              lng: coords.lng,
              address: "",
            });
          }
        } catch (error) {
          console.error("Error extracting GPS data:", error);
        }
      }

      setImageMetadata(objectUrl, newMetadata);
    }

    setImages(newImages);
    setCaptureMode(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveImage = (urlToRemove: string) => {
    setImages(images.filter((url) => url !== urlToRemove));
  };

  const handleCapture = () => {
    setCaptureMode("capture");
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute("capture", "environment");
      fileInputRef.current.click();
    }
  };

  const handleUpload = () => {
    setCaptureMode("upload");
    if (fileInputRef.current) {
      fileInputRef.current.removeAttribute("capture");
      fileInputRef.current.click();
    }
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
        multiple
      />

      <div className="px-5 space-y-8">
        <div className="grid border border-dashed border-foreground/20 rounded-md p-4 gap-4">
          <Button onClick={handleCapture} className="md:hidden">
            <Camera />
            Take Photo
          </Button>
          <Button onClick={handleUpload} variant="outline">
            <ImageSquare />
            Upload Image
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {images.map((url, index) => (
            <div key={index} className="relative h-32">
              <button
                onClick={() => handleRemoveImage(url)}
                className="absolute -top-2 -right-2 z-10 p-1 bg-white rounded-full shadow-md hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
              <img
                src={url}
                alt={`Preview ${index + 1}`}
                className="w-full h-full object-cover"
              />
              {imagesMetadata[url]?.coordinates && (
                <div className="absolute bottom-0 left-0 w-full bg-white p-2">
                  <TypographyParagraph>
                    {convertToDMS(imagesMetadata[url].coordinates.lat, true)}{" "}
                    {convertToDMS(imagesMetadata[url].coordinates.lng, false)}
                  </TypographyParagraph>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
