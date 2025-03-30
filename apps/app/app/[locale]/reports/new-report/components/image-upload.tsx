"use client";
import { FILE_CONSTANTS } from "@/lib/constants";
import { ImageLocation, ImageUploadProps } from "@/lib/types";
import { convertDMSToDD, fetchAddressFromCoordinates } from "@/lib/utils/map";
import { Button } from "@repo/ui/button";
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
}: ImageUploadProps) => {
  const t = useTranslations("components.reportFlow");
  const [error, setError] = useState<string | null>(null);
  const [foundLocation, setFoundLocation] = useState<ImageLocation | null>(
    null
  );
  const [previews, setPreviews] = useState<string[]>([]);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

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
      if (files.length > 0 && onLocationFound) {
        const firstFile = files[0];
        if (firstFile) {
          try {
            const location = await readImageLocation(firstFile);
            if (location) {
              setFoundLocation(location);
              onLocationFound(location);
            } else {
              setFoundLocation(null);
            }
          } catch (error) {
            console.error("Error checking location:", error);
            setFoundLocation(null);
          }
        }
      } else {
        setFoundLocation(null);
      }
    };

    checkLocation();
  }, [files, onLocationFound]);

  const readImageLocation = async (
    file: File
  ): Promise<ImageLocation | null> => {
    try {
      // Get location from EXIF data
      const exif = await exifr.parse(file);

      if (exif?.GPSLatitude && exif?.GPSLongitude) {
        // Convert GPS coordinates from degrees/minutes/seconds to decimal degrees
        const lat = convertDMSToDD(
          exif.GPSLatitude,
          exif.GPSLatitudeRef === "S" ? -1 : 1
        );
        const lng = convertDMSToDD(
          exif.GPSLongitude,
          exif.GPSLongitudeRef === "W" ? -1 : 1
        );

        // Get address from coordinates using reverse geocoding
        const address = await fetchAddressFromCoordinates(lng, lat);

        return {
          lat,
          lng,
          address,
        };
      }

      // Note: On iOS, EXIF data might not be available due to privacy settings.
      // In such cases, the location will be null and the user should be informed
      // that they need to enable location metadata in their camera settings.
      return null;
    } catch (error) {
      console.error("Error reading image location:", error);
      return null;
    }
  };

  const getLocationFromDevice = async (): Promise<ImageLocation | null> => {
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

      const { latitude: lat, longitude: lng } = position.coords;
      const address = await fetchAddressFromCoordinates(lng, lat);

      return {
        lat,
        lng,
        address,
      };
    } catch (error) {
      console.error("Error getting location from device:", error);
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

    // If this is a new photo being taken (not from library)
    if (e.target.capture === "environment") {
      setIsGettingLocation(true);
      try {
        const location = await getLocationFromDevice();
        if (location) {
          setFoundLocation(location);
          onLocationFound(location);
        }
      } catch (error) {
        console.error("Error getting location:", error);
      } finally {
        setIsGettingLocation(false);
      }
    }

    setFiles(selectedFiles);
    setError(null);
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const clearFiles = () => {
    setFiles([]);
    setError(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="space-y-4 flex-1 h-full">
      <StepHeader
        step={t("imageUpload.step")}
        description={t("imageUpload.description")}
      />
      <div className="relative space-y-4">
        {/* Camera input */}
        <input
          type="file"
          accept="image/jpeg,image/png,image/gif"
          multiple
          onChange={handleFileChange}
          disabled={isUploading}
          aria-label={t("takePhoto")}
          aria-describedby={error ? "file-error" : undefined}
          className="hidden"
          id="camera-input"
          capture="environment"
        />
        {/* Photo library input */}
        <input
          type="file"
          accept="image/jpeg,image/png,image/gif"
          multiple
          onChange={handleFileChange}
          disabled={isUploading}
          aria-label={t("chooseFromLibrary")}
          aria-describedby={error ? "file-error" : undefined}
          className="hidden"
          id="library-input"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Camera button */}
          <label
            htmlFor="camera-input"
            className={`block w-full p-4 bg-muted rounded-lg cursor-pointer transition-colors md:hidden ${
              isUploading ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"
            }`}
          >
            <span className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-base font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-foreground text-background shadow hover:bg-foreground/90 h-9 px-7 py-6 rounded-full w-full">
              {t("takePhoto")}
            </span>
          </label>
          {/* Photo library button */}
          <label
            htmlFor="library-input"
            className={`block w-full p-4 bg-muted rounded-lg cursor-pointer transition-colors ${
              isUploading ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"
            }`}
          >
            <span className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-base font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-backgrond text-foreground border-foreground border shadow hover:bg-foreground hover:text-background md:bg-foreground md:text-background md:hover:bg-foreground/90 h-9 px-7 py-6 rounded-full w-full">
              {t("chooseFromLibrary")}
            </span>
          </label>
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

            {/* Image Previews */}
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

            <div className="text-sm text-gray-500 space-y-1">
              {/* {files.map((file, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span>{file.name}</span>
                    <span className="text-gray-400">
                      ({formatFileSize(file.size)})
                    </span>
                  </div>
                </div>
              ))} */}
              {foundLocation && (
                <div className="mt-2 text-sm text-primary">
                  {t("locationFound", { address: foundLocation.address })}
                </div>
              )}
              {isGettingLocation && (
                <div className="mt-2 text-sm text-muted-foreground">
                  {t("gettingLocation")}
                </div>
              )}
            </div>
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
