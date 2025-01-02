"use client";

import { useReportStore } from "@/lib/store";
import {
  Camera,
  Crosshair,
  MagnifyingGlass,
  MapPin,
} from "@phosphor-icons/react";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@repo/ui/sheet";
import { motion } from "framer-motion";
import "mapbox-gl/dist/mapbox-gl.css";
import { useCallback, useEffect, useRef, useState } from "react";
import type { MapRef } from "react-map-gl";
import Map from "react-map-gl";

interface Suggestion {
  id: string;
  place_name: string;
  center: [number, number];
}

const ZUG_CENTER = {
  latitude: 47.1661,
  longitude: 8.5159,
  zoom: 13,
  address: "Postplatz, 6300 Zug, Switzerland",
} as const;

const ZUG_BOUNDS = {
  north: 47.2273,
  south: 47.0698,
  east: 8.6549,
  west: 8.3989,
} as const;

const isLocationInZug = (lat: number, lng: number) => {
  return (
    lat >= ZUG_BOUNDS.south &&
    lat <= ZUG_BOUNDS.north &&
    lng >= ZUG_BOUNDS.west &&
    lng <= ZUG_BOUNDS.east
  );
};

const MapLocationDialog = ({
  open,
  onAccept,
  onReject,
  address,
}: {
  open: boolean;
  onAccept: () => void;
  onReject: () => void;
  address: string;
}) => {
  if (!open) return null;

  return (
    <div className="absolute top-20 left-4 right-4 z-20">
      <div className="bg-white/95 backdrop-blur-sm shadow-lg rounded-lg p-4 mx-auto max-w-sm border animate-in fade-in-0 zoom-in-95 slide-in-from-top-2">
        <div className="space-y-3">
          <div>
            <h3 className="font-medium">Use Image Location?</h3>
            <p className="text-sm text-muted-foreground mt-1">
              We found a location in your image
            </p>
            <p className="text-sm font-medium mt-2">{address}</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              size="sm"
              onClick={onReject}
            >
              Use default
            </Button>
            <Button className="flex-1" size="sm" onClick={onAccept}>
              Use image location
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function LocationStep() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLocationFromImage, setIsLocationFromImage] = useState(false);
  const [isLocationConfirmed, setIsLocationConfirmed] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isDefaultLocation, setIsDefaultLocation] = useState(true);
  const [isMoving, setIsMoving] = useState(false);
  const [isOutsideZug, setIsOutsideZug] = useState(false);
  const mapRef = useRef<MapRef>(null);
  const [showLocationDialog, setShowLocationDialog] = useState(false);
  const [pendingImageLocation, setPendingImageLocation] = useState<{
    lat: number;
    lng: number;
    address: string;
  } | null>(null);
  const [hasProcessedImageLocation, setHasProcessedImageLocation] =
    useState(false);

  const location = useReportStore((state) => state.location);
  const setLocation = useReportStore((state) => state.setLocation);
  const imagesMetadata = useReportStore((state) => state.imagesMetadata);
  const setCurrentStep = useReportStore((state) => state.setCurrentStep);
  const setStepValidation = useReportStore((state) => state.setStepValidation);

  const setDefaultLocation = useCallback(() => {
    setLocation({
      lat: ZUG_CENTER.latitude,
      lng: ZUG_CENTER.longitude,
      address: ZUG_CENTER.address,
    });
    setIsLocationFromImage(false);
    setIsLocationConfirmed(false);
    setIsDefaultLocation(true);

    mapRef.current?.flyTo({
      center: [ZUG_CENTER.longitude, ZUG_CENTER.latitude],
      zoom: ZUG_CENTER.zoom,
      duration: 2000,
    });
  }, [setLocation]);

  useEffect(() => {
    const initializeLocation = async () => {
      if (hasProcessedImageLocation) return;

      const firstImageWithCoords = Object.values(imagesMetadata).find(
        (metadata) => metadata?.coordinates
      );

      if (firstImageWithCoords?.coordinates) {
        try {
          const response = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${firstImageWithCoords.coordinates.lng},${firstImageWithCoords.coordinates.lat}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}`
          );
          const data = await response.json();
          const address = data.features[0]?.place_name || "Unknown location";

          setPendingImageLocation({
            lat: firstImageWithCoords.coordinates.lat,
            lng: firstImageWithCoords.coordinates.lng,
            address,
          });
          setShowLocationDialog(true);
          setHasProcessedImageLocation(true);
        } catch (error) {
          console.error("Error fetching address:", error);
          setDefaultLocation();
          setHasProcessedImageLocation(true);
        }
      } else if (!location) {
        setDefaultLocation();
        setHasProcessedImageLocation(true);
      } else {
        const isDefault =
          location.lat === ZUG_CENTER.latitude &&
          location.lng === ZUG_CENTER.longitude;

        setIsDefaultLocation(isDefault);
        setIsLocationConfirmed(!isDefault);
        setHasProcessedImageLocation(true);
      }
    };

    initializeLocation();
  }, [
    imagesMetadata,
    setLocation,
    location,
    setDefaultLocation,
    hasProcessedImageLocation,
  ]);

  const handleSearch = useCallback(async (value: string) => {
    setSearchValue(value);

    if (value.length < 3) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          value
        )}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}&country=CH`
      );
      const data = await response.json();
      setSuggestions(
        data.features.map((feature: any) => ({
          id: feature.id,
          place_name: feature.place_name,
          center: feature.center,
        }))
      );
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setSuggestions([]);
    }
  }, []);

  const handleLocationSelect = useCallback(
    async (suggestion: Suggestion) => {
      const [lng, lat] = suggestion.center;

      const withinZug = isLocationInZug(lat, lng);
      setIsOutsideZug(!withinZug);

      setIsLocationFromImage(false);
      setIsLocationConfirmed(true);
      setIsDefaultLocation(false);

      setLocation({
        lat,
        lng,
        address: suggestion.place_name,
      });
      setSearchValue(suggestion.place_name);
      setSuggestions([]);
      setIsOpen(false);

      mapRef.current?.flyTo({
        center: [lng, lat],
        zoom: 15,
        duration: 2000,
      });
    },
    [setLocation]
  );

  const handleMapMove = useCallback(async () => {
    if (!mapRef.current) return;

    const center = mapRef.current.getCenter();
    const lng = center.lng;
    const lat = center.lat;

    setIsLocationFromImage(false);
    setIsLocationConfirmed(true);
    setIsDefaultLocation(false);

    const withinZug = isLocationInZug(lat, lng);
    setIsOutsideZug(!withinZug);

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}`
      );
      const data = await response.json();
      const address = data.features[0]?.place_name || "Unknown location";

      setLocation({
        lat,
        lng,
        address,
      });
    } catch (error) {
      console.error("Error fetching address:", error);
    }
  }, [setLocation]);

  const requestLocationPermission = useCallback(async () => {
    setIsGettingLocation(true);
    try {
      const result = await navigator.permissions.query({ name: "geolocation" });

      if (result.state === "denied") {
        alert(
          "Please enable location access in your device settings to use this feature."
        );
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude: lat, longitude: lng } = position.coords;

          try {
            const response = await fetch(
              `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}`
            );
            const data = await response.json();
            const address = data.features[0]?.place_name || "Unknown location";

            setLocation({
              lat,
              lng,
              address,
            });
            setIsLocationConfirmed(true);
            setIsDefaultLocation(false);

            mapRef.current?.flyTo({
              center: [lng, lat],
              zoom: 15,
              duration: 2000,
            });
          } catch (error) {
            console.error("Error fetching address:", error);
          }
        },
        (error) => {
          console.error("Error getting location:", error);
          if (error.code === error.PERMISSION_DENIED) {
            alert(
              "Please enable location access in your device settings to use this feature."
            );
          } else {
            alert("Unable to get your location. Please try again.");
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );
    } catch (error) {
      console.error("Error requesting location permission:", error);
    } finally {
      setIsGettingLocation(false);
    }
  }, [setLocation]);

  const handleAcceptImageLocation = useCallback(() => {
    if (pendingImageLocation) {
      setLocation(pendingImageLocation);
      setIsLocationFromImage(true);
      setIsLocationConfirmed(true);
      setIsDefaultLocation(false);

      mapRef.current?.flyTo({
        center: [pendingImageLocation.lng, pendingImageLocation.lat],
        zoom: 15,
        duration: 2000,
      });
    }
    setShowLocationDialog(false);
    setPendingImageLocation(null);
  }, [pendingImageLocation, setLocation]);

  const handleRejectImageLocation = useCallback(() => {
    setDefaultLocation();
    setShowLocationDialog(false);
    setPendingImageLocation(null);
  }, [setDefaultLocation]);

  useEffect(() => {
    const isValid = isLocationConfirmed && !isOutsideZug;
    setStepValidation("location", isValid);
  }, [isLocationConfirmed, isOutsideZug, setStepValidation]);

  return (
    <div className="relative">
      <div className="absolute top-6 bg-white shadow-md left-0 w-[calc(100%-32px)] ml-[16px] z-10 rounded-full">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <div className="flex items-center justify-between p-2 w-full">
              <div className="flex items-center space-x-2">
                <MagnifyingGlass className="w-4 h-4 text-muted-foreground" />
                <p className="text-sm font-medium text-muted-foreground">
                  Search for a location
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  requestLocationPermission();
                }}
                disabled={isGettingLocation}
                className="flex items-center space-x-1"
              >
                <Crosshair className="w-4 h-4" />
                <span className="text-xs">
                  {isGettingLocation ? "Getting location..." : "Get location"}
                </span>
              </Button>
            </div>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[50%]">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Choose a location</h2>
              </div>
              <div className="space-y-4">
                <Input
                  placeholder="Search for a location"
                  value={searchValue}
                  onChange={(e) => handleSearch(e.target.value)}
                />
                {suggestions.length > 0 && (
                  <div className="space-y-2 overflow-auto">
                    {suggestions.map((suggestion) => (
                      <button
                        key={suggestion.id}
                        className="flex items-center space-x-2 w-full p-2 hover:bg-gray-100 rounded-lg text-left"
                        onClick={() => handleLocationSelect(suggestion)}
                      >
                        <MapPin
                          className="w-4 h-4 text-primary"
                          weight="fill"
                        />
                        <span className="text-sm">{suggestion.place_name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <Map
        ref={mapRef}
        initialViewState={
          location
            ? {
                latitude: location.lat,
                longitude: location.lng,
                zoom: 15,
              }
            : ZUG_CENTER
        }
        style={{
          width: "100%",
          height: "calc(60svh)",
        }}
        mapStyle="mapbox://styles/mapbox/streets-v11"
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
        reuseMaps
        onMoveStart={() => setIsMoving(true)}
        onMoveEnd={(e) => {
          setIsMoving(false);
          handleMapMove();
        }}
      >
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full pointer-events-none">
          <motion.div
            animate={{
              y: isMoving ? -8 : 0,
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 20,
            }}
          >
            <MapPin className="w-8 h-8 text-primary" weight="fill" />
          </motion.div>
          {isMoving && (
            <div className="w-3 h-3 rounded-full bg-black/20 mx-auto mt-1" />
          )}
        </div>
      </Map>

      <div className="absolute bottom-[16px] p-4 bg-white shadow-md rounded-lg space-y-4 left-0 w-[calc(100%-32px)] ml-[16px] z-10">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-primary" weight="fill" />
            <p className="text-sm font-medium">Current Location</p>
            {isLocationFromImage && (
              <div className="flex items-center ml-auto">
                <Camera className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground ml-1">
                  From image
                </span>
              </div>
            )}
          </div>
          <div className="pl-6 space-y-2">
            {isOutsideZug && (
              <div className="flex items-center ml-auto">
                <span className="text-xs text-destructive">
                  Currently only supporting Kanton Zug
                </span>
              </div>
            )}
            <p className="text-sm text-muted-foreground whitespace-pre-line">
              {location?.address || ZUG_CENTER.address}
            </p>
          </div>
        </div>
      </div>

      <MapLocationDialog
        open={showLocationDialog}
        onAccept={handleAcceptImageLocation}
        onReject={handleRejectImageLocation}
        address={pendingImageLocation?.address || ""}
      />
    </div>
  );
}
