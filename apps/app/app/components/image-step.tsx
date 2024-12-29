"use client";

import type { ReportState } from "@/lib/store";
import { useReportStore } from "@/lib/store";
import { Camera, ImageSquare } from "@phosphor-icons/react";
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

export default function ImageStep() {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { setLocation, setImages, images, imageMetadata, setImageMetadata } =
    useReportStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const setCurrentStep = useReportStore((state) => state.setCurrentStep);
  const [captureMode, setCaptureMode] = useState<"upload" | "capture" | null>(
    null
  );

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setImages([objectUrl]);

    const newMetadata: ReportState["imageMetadata"] = {
      fileInfo: {
        size: file.size,
        format: file.type.split("/")[1]?.toUpperCase() ?? "UNKNOWN",
      },
    };

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

    setImageMetadata(newMetadata);
    setCaptureMode(null);
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

  // Use the image from store if available, otherwise use local preview
  const displayUrl = images[0] || previewUrl;

  return (
    <div className="space-y-6">
      <div className="border-2 border-dashed rounded-lg p-6 text-center">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />

        {displayUrl ? (
          <div className="space-y-4">
            <img
              src={displayUrl}
              alt="Preview"
              className="mx-auto rounded-lg max-h-24"
            />
            <div className="space-x-2">
              <Button variant="outline" onClick={handleCapture}>
                <Camera className="w-4 h-4 mr-2" />
                Take Photo
              </Button>
              <Button variant="outline" onClick={handleUpload}>
                <ImageSquare className="w-4 h-4 mr-2" />
                Upload Image
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Camera className="w-8 h-8 mx-auto text-gray-400" />
            <div className="space-x-2">
              <Button variant="outline" onClick={handleCapture}>
                Take Photo
              </Button>
              <Button variant="outline" onClick={handleUpload}>
                Upload Image
              </Button>
            </div>
          </div>
        )}
      </div>

      {(imageMetadata?.coordinates || imageMetadata?.fileInfo) && (
        <div className="p-4 bg-gray-50 rounded-lg space-y-2">
          {imageMetadata.fileInfo && (
            <>
              <p className="text-sm text-gray-600">Image information:</p>
              <p className="font-mono text-sm">
                Format: {imageMetadata.fileInfo.format} | Size:{" "}
                {formatFileSize(imageMetadata.fileInfo.size)}
              </p>
            </>
          )}
          {imageMetadata.coordinates && (
            <>
              <p className="text-sm text-gray-600">Location from image:</p>
              <p className="font-mono text-sm">
                {convertToDMS(imageMetadata.coordinates.lat, true)}{" "}
                {convertToDMS(imageMetadata.coordinates.lng, false)}
              </p>
            </>
          )}
        </div>
      )}

      <div className="fixed bottom-4 left-4 right-4">
        {images.length > 0 ? (
          <Button className="w-full" onClick={() => setCurrentStep(1)}>
            Confirm Image
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
