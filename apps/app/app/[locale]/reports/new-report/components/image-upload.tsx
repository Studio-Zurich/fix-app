"use client";
import { FILE_CONSTANTS } from "@/lib/constants";
import { ImageLocation, ImageUploadProps } from "@/lib/types";
import { convertDMSToDD, fetchAddressFromCoordinates } from "@/lib/utils/map";
import { Camera, Image, MapPin } from "@phosphor-icons/react";
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
              onLocationFound(location);
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
                onLocationFound(newLocation);
              }
            }
          } catch (error) {
            console.error("Error checking location:", error);
            setFoundLocation(null);
            onLocationFound(null);
          }
        }
      }
    };

    checkLocation();
  }, [files, locationSubmitted, onLocationFound]);

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

  return (
    <div className="space-y-4 flex-1 h-full">
      <StepHeader
        step={t("imageUpload.step")}
        description={t("imageUpload.description")}
      />
      <div className="relative space-y-4">
        <div className="grid gap-2">
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
                <Camera size={24} className="mr-0.5 flex-shrink-0" />
                {t("takePhoto")}
              </label>
            </Button>
          </div>
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
            <Button
              asChild
              className="w-full"
              disabled={isUploading}
              variant="outline"
            >
              <label
                htmlFor="library-input"
                className={`cursor-pointer w-full ${
                  isUploading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <Image size={24} className="mr-0.5 flex-shrink-0" />
                {t("chooseFromLibrary")}
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
    </div>
  );
};

export default ImageUpload;
