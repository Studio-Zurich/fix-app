"use client";

import { Button } from "@repo/ui/button";
import exifr from "exifr";
import { useState } from "react";

const Exif = () => {
  const [exifData, setExifData] = useState<any>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<GeolocationCoordinates | null>(null);

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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Read EXIF data and get location if using camera
    try {
      const buffer = await file.arrayBuffer();
      const exif = await exifr.parse(buffer);

      // If this was from camera input (not file selection), get current location
      if (e.target.id === "camera-input") {
        const currentLocation = await getLocation();
        if (currentLocation) {
          setLocation(currentLocation);
          // Combine EXIF data with current location
          exif.GPSLatitude = currentLocation.latitude;
          exif.GPSLongitude = currentLocation.longitude;
          exif.GPSAltitude = currentLocation.altitude;
          exif.GPSAccuracy = currentLocation.accuracy;
        }
      }

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
          Take a photo or select an image to see its EXIF metadata
        </p>
      </div>

      <div className="flex gap-2">
        <div className="flex-1">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            id="file-input"
          />
          <Button asChild className="w-full">
            <label htmlFor="file-input" className="cursor-pointer">
              Choose Photo
            </label>
          </Button>
        </div>

        <div className="flex-1">
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileSelect}
            className="hidden"
            id="camera-input"
          />
          <Button asChild className="w-full">
            <label htmlFor="camera-input" className="cursor-pointer">
              Take Photo
            </label>
          </Button>
        </div>
      </div>

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

      {location && (
        <div className="space-y-2">
          <h3 className="font-medium">Current Location</h3>
          <div className="bg-muted p-4 rounded-lg space-y-1">
            <div className="text-sm">
              <span className="font-medium">Latitude:</span>{" "}
              <span>{location.latitude}</span>
            </div>
            <div className="text-sm">
              <span className="font-medium">Longitude:</span>{" "}
              <span>{location.longitude}</span>
            </div>
            {location.altitude && (
              <div className="text-sm">
                <span className="font-medium">Altitude:</span>{" "}
                <span>{location.altitude}</span>
              </div>
            )}
            <div className="text-sm">
              <span className="font-medium">Accuracy:</span>{" "}
              <span>{location.accuracy}m</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Exif;
