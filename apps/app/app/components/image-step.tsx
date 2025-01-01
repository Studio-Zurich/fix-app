"use client";

import { useReportStore } from "@/lib/store";
import { Camera, ImageSquare, X } from "@phosphor-icons/react";
import { Button } from "@repo/ui/button";
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
    <div className="space-y-6">
      <div className="border-2 border-dashed rounded-lg p-6 text-center">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
          multiple
        />

        <div className="grid grid-cols-2 gap-4 mb-4">
          {images.map((url, index) => (
            <div key={index} className="relative">
              <button
                onClick={() => handleRemoveImage(url)}
                className="absolute -top-2 -right-2 z-10 p-1 bg-white rounded-full shadow-md hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
              <img
                src={url}
                alt={`Preview ${index + 1}`}
                className="w-full aspect-square object-cover rounded-lg"
              />
              {imagesMetadata[url] && (
                <div className="p-4 bg-gray-50 rounded-lg space-y-2 mt-2">
                  {imagesMetadata[url].fileInfo && (
                    <>
                      <p className="text-sm text-gray-600">
                        Image information:
                      </p>
                      <p className="font-mono text-sm">
                        Format: {imagesMetadata[url].fileInfo.format} | Size:{" "}
                        {formatFileSize(imagesMetadata[url].fileInfo.size)}
                      </p>
                    </>
                  )}
                  {imagesMetadata[url].coordinates && (
                    <>
                      <p className="text-sm text-gray-600">
                        Location from image:
                      </p>
                      <p className="font-mono text-sm">
                        {convertToDMS(
                          imagesMetadata[url].coordinates.lat,
                          true
                        )}{" "}
                        {convertToDMS(
                          imagesMetadata[url].coordinates.lng,
                          false
                        )}
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="space-x-2">
          <Button onClick={handleCapture} className="md:hidden">
            <Camera className="w-4 h-4 mr-2" />
            Take Photo
          </Button>
          <Button onClick={handleUpload} variant="outline">
            <ImageSquare className="w-4 h-4 mr-2" />
            Upload Image
          </Button>
        </div>
      </div>

      <div className="fixed bottom-4 left-4 right-4">
        {images.length > 0 ? (
          <Button className="w-full" onClick={() => setCurrentStep(1)}>
            Confirm Images ({images.length})
          </Button>
        ) : (
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => setCurrentStep(1)}
          >
            Skip Image Upload
          </Button>
        )}
      </div>
    </div>
  );
}
