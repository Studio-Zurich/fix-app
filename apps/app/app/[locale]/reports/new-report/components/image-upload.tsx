"use client";
import { FILE_CONSTANTS } from "@/lib/constants";
import { ImageLocation, ImageUploadProps } from "@/lib/types";
import { convertDMSToDD, fetchAddressFromCoordinates } from "@/lib/utils/map";
import { MapPin } from "@phosphor-icons/react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@repo/ui/alert-dialog";
import { Button } from "@repo/ui/button";
import { TypographyParagraph } from "@repo/ui/text";
import exifr from "exifr";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import StepHeader from "./step-header";

const MAX_FILES = 5;

const ImageUpload = ({
  files,
  setFiles,
  onLocationFound,
  isUploading,
  locationSubmitted,
  detectedLocation,
}: ImageUploadProps) => {
  const t = useTranslations("components.reportFlow");
  const [error, setError] = useState<string | null>(null);
  const [foundLocation, setFoundLocation] = useState<ImageLocation | null>(
    null
  );
  const [previews, setPreviews] = useState<string[]>([]);
  const [showLocationDialog, setShowLocationDialog] = useState(false);
  const [currentLocation, setCurrentLocation] =
    useState<GeolocationCoordinates | null>(null);

  const getLocation = async (): Promise<GeolocationCoordinates | null> => {
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
      return position.coords;
    } catch (err) {
      console.error("Error getting location:", err);
      return null;
    }
  };

  // Generate previews when files change
  useEffect(() => {
    const generatePreviews = async () => {
      const newPreviews = await Promise.all(
        files.map((file) => {
          return new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              resolve(reader.result as string);
            };
            reader.readAsDataURL(file);
          });
        })
      );
      setPreviews(newPreviews);
    };

    generatePreviews();
  }, [files]);

  // Check for location when files change
  useEffect(() => {
    const checkLocation = async () => {
      if (files.length > 0 && !locationSubmitted) {
        const firstFile = files[0];
        if (firstFile) {
          try {
            const location = await readImageLocation(firstFile);
            if (location) {
              setFoundLocation(location);
              // Don't show dialog immediately, let user see the address first
              setTimeout(() => setShowLocationDialog(true), 1500);
            } else {
              // If no EXIF location, try to get current location
              const coords = await getLocation();
              if (coords) {
                setCurrentLocation(coords);
                const address = await fetchAddressFromCoordinates(
                  coords.longitude,
                  coords.latitude
                );
                const newLocation = {
                  lat: coords.latitude,
                  lng: coords.longitude,
                  address,
                };
                setFoundLocation(newLocation);
                setTimeout(() => setShowLocationDialog(true), 1500);
              }
            }
          } catch (error) {
            console.error("Error checking location:", error);
            setFoundLocation(null);
          }
        }
      }
    };

    checkLocation();
  }, [files, locationSubmitted]);

  const readImageLocation = async (
    file: File
  ): Promise<ImageLocation | null> => {
    try {
      const buffer = await file.arrayBuffer();
      const exif = await exifr.parse(buffer);

      if (exif?.GPSLatitude && exif?.GPSLongitude) {
        const lat = convertDMSToDD(
          exif.GPSLatitude,
          exif.GPSLatitudeRef === "S" ? -1 : 1
        );
        const lng = convertDMSToDD(
          exif.GPSLongitude,
          exif.GPSLongitudeRef === "W" ? -1 : 1
        );

        if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
          const address = await fetchAddressFromCoordinates(lng, lat);
          return { lat, lng, address };
        }
      }
      return null;
    } catch (error) {
      console.error("Error reading image location:", error);
      return null;
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
    onLocationFound(null);
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const clearFiles = () => {
    setFiles([]);
    setError(null);
    setFoundLocation(null);
    setCurrentLocation(null);
  };

  const handleLocationConfirm = () => {
    if (foundLocation) {
      setShowLocationDialog(false);
      onLocationFound(foundLocation);
    }
  };

  const handleLocationReject = () => {
    setShowLocationDialog(false);
    setFoundLocation(null);
    setCurrentLocation(null);
    onLocationFound(null);
  };

  return (
    <div className="space-y-4 flex-1 h-full">
      <StepHeader
        step={t("imageUpload.step")}
        description={t("imageUpload.description")}
      />
      <div className="relative space-y-4">
        <div className="flex gap-2">
          <div className="flex-1">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              disabled={isUploading}
              className="hidden"
              id="library-input"
            />
            <Button asChild className="w-full" disabled={isUploading}>
              <label
                htmlFor="library-input"
                className={`cursor-pointer w-full ${
                  isUploading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {t("chooseFromLibrary")}
              </label>
            </Button>
          </div>

          <div className="flex-1">
            <input
              type="file"
              accept="image/*"
              multiple
              capture="environment"
              onChange={handleFileChange}
              disabled={isUploading}
              className="hidden"
              id="camera-input"
            />
            <Button asChild className="w-full" disabled={isUploading}>
              <label
                htmlFor="camera-input"
                className={`cursor-pointer w-full ${
                  isUploading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {t("takePhoto")}
              </label>
            </Button>
          </div>
        </div>

        {files.length > 0 && (
          <div className="space-y-4">
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

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {previews.map((preview, index) => (
                <div key={index} className="relative group">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      removeFile(index);
                    }}
                    disabled={isUploading}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {t("remove")}
                  </Button>
                </div>
              ))}
            </div>

            {foundLocation && (
              <div className="mt-2 flex items-center gap-2 bg-muted p-3 rounded-lg">
                <MapPin size={16} className="flex-shrink-0" />
                <TypographyParagraph>
                  {foundLocation.address}
                </TypographyParagraph>
              </div>
            )}
          </div>
        )}
      </div>
      {error && (
        <p id="file-error" role="alert" className="text-red-500">
          {error}
        </p>
      )}

      <AlertDialog
        open={showLocationDialog}
        onOpenChange={setShowLocationDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("locationMap.locationDialog.title")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("locationMap.locationDialog.description")}
              {foundLocation?.address && (
                <TypographyParagraph className="mt-2 block text-foreground font-medium">
                  {foundLocation.address}
                </TypographyParagraph>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleLocationReject}>
              {t("locationMap.locationDialog.reject")}
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleLocationConfirm}>
              {t("locationMap.locationDialog.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ImageUpload;
