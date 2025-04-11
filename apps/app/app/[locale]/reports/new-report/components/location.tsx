"use client";
import { log } from "@/lib/logger";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useRef, useState } from "react";
import StepContainer from "./step-container";

// Set the Mapbox access token
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "";

const Location = () => {
  const [address, setAddress] = useState("");
  const [coordinates, setCoordinates] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(
    null
  );
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  // Initialize the map when the component mounts
  useEffect(() => {
    if (mapContainer.current && !map.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [8.2275, 46.8182], // Default to Switzerland
        zoom: 8,
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

      // Add a marker that can be dragged
      const marker = new mapboxgl.Marker({
        draggable: true,
      })
        .setLngLat([8.2275, 46.8182])
        .addTo(map.current);

      // Update coordinates when marker is dragged
      marker.on("dragend", () => {
        const lngLat = marker.getLngLat();
        setCoordinates({ lat: lngLat.lat, lng: lngLat.lng });
        log("Marker position updated", { lat: lngLat.lat, lng: lngLat.lng });
      });

      // Clean up on unmount
      return () => {
        if (map.current) {
          map.current.remove();
          map.current = null;
        }
      };
    }
  }, []);

  // Update map when coordinates change
  useEffect(() => {
    if (map.current && coordinates) {
      map.current.flyTo({
        center: [coordinates.lng, coordinates.lat],
        zoom: 15,
      });
    }
  }, [coordinates]);

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress(e.target.value);
    setVerificationError(null);
  };

  const verifyAddress = async () => {
    if (!address.trim()) {
      setVerificationError("Please enter an address");
      return;
    }

    setIsVerifying(true);
    setVerificationError(null);

    try {
      // Use Mapbox Geocoding API to verify the address
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          address
        )}.json?access_token=${mapboxgl.accessToken}&country=ch&limit=1`
      );

      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;
        setCoordinates({ lat, lng });
        log("Address verified", { address, lat, lng });
      } else {
        setVerificationError("Address not found. Please try again.");
        log("Address verification failed", { address });
      }
    } catch (error) {
      setVerificationError("Error verifying address. Please try again.");
      log("Error verifying address", { error, address });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <StepContainer>
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex flex-col space-y-2">
            <label htmlFor="address" className="text-sm font-medium">
              Address
            </label>
            <div className="flex space-x-2">
              <Input
                id="address"
                placeholder="Enter the address of the incident"
                value={address}
                onChange={handleAddressChange}
                className="flex-1"
              />
              <Button
                type="button"
                onClick={verifyAddress}
                disabled={isVerifying}
              >
                {isVerifying ? "Verifying..." : "Verify"}
              </Button>
            </div>
            {verificationError && (
              <p className="text-sm text-red-500">{verificationError}</p>
            )}
          </div>

          <div className="h-64 w-full rounded-md overflow-hidden border">
            <div ref={mapContainer} className="h-full w-full" />
          </div>
        </div>

        {/* Hidden inputs to pass the location data to the form */}
        {coordinates && (
          <>
            <input type="hidden" name="location_lat" value={coordinates.lat} />
            <input type="hidden" name="location_lng" value={coordinates.lng} />
            <input type="hidden" name="location_address" value={address} />
          </>
        )}
      </div>
    </StepContainer>
  );
};

export default Location;
