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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@repo/ui/sheet";
import "mapbox-gl/dist/mapbox-gl.css";
import { useCallback, useEffect, useRef, useState } from "react";
import type { MapRef } from "react-map-gl";
import Map, { Marker } from "react-map-gl";

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

export default function LocationStep() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLocationFromImage, setIsLocationFromImage] = useState(false);
  const [isLocationConfirmed, setIsLocationConfirmed] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const mapRef = useRef<MapRef>(null);

  const location = useReportStore((state) => state.location);
  const setLocation = useReportStore((state) => state.setLocation);
  const imageMetadata = useReportStore((state) => state.imageMetadata);
  const setCurrentStep = useReportStore((state) => state.setCurrentStep);

  useEffect(() => {
    const initializeLocation = async () => {
      if (imageMetadata?.coordinates) {
        try {
          const response = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${imageMetadata.coordinates.lng},${imageMetadata.coordinates.lat}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}`
          );
          const data = await response.json();
          const address = data.features[0]?.place_name || "Unknown location";

          setLocation({
            lat: imageMetadata.coordinates.lat,
            lng: imageMetadata.coordinates.lng,
            address,
          });
          setIsLocationFromImage(true);
          setIsLocationConfirmed(true);

          mapRef.current?.flyTo({
            center: [
              imageMetadata.coordinates.lng,
              imageMetadata.coordinates.lat,
            ],
            zoom: 15,
            duration: 2000,
          });
        } catch (error) {
          console.error("Error fetching address:", error);
          setDefaultLocation();
        }
      } else if (!location) {
        setDefaultLocation();
      }
    };

    const setDefaultLocation = () => {
      setLocation({
        lat: ZUG_CENTER.latitude,
        lng: ZUG_CENTER.longitude,
        address: ZUG_CENTER.address,
      });
      setIsLocationFromImage(false);
      setIsLocationConfirmed(false);
    };

    initializeLocation();
  }, [imageMetadata?.coordinates, setLocation]);

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
      setIsLocationFromImage(false);
      setIsLocationConfirmed(true);

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

  const handleMarkerDrag = useCallback(
    async (event: { lngLat: { lng: number; lat: number } }) => {
      const { lng, lat } = event.lngLat;
      setIsLocationFromImage(false);
      setIsLocationConfirmed(true);

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
    },
    [setLocation]
  );

  const requestLocationPermission = useCallback(async () => {
    setIsGettingLocation(true);
    try {
      const result = await navigator.permissions.query({ name: "geolocation" });

      if (result.state === "denied") {
        // Open device settings if permission is denied
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

  return (
    <div className="relative">
      <div className="absolute top-6 bg-white shadow-md left-0 w-[calc(100%-32px)] ml-[16px] z-10 rounded-full">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger onClick={() => setIsOpen(true)} className="w-full">
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
                className="flex items-center space-x-1 text-muted-foreground"
              >
                <Crosshair className="w-4 h-4" />
                <span className="text-xs">
                  {isGettingLocation ? "Getting location..." : "Get location"}
                </span>
              </Button>
            </div>
          </SheetTrigger>
          <SheetContent side="bottom">
            <SheetHeader>
              <SheetTitle>Choose a location</SheetTitle>
            </SheetHeader>
            <div className="py-4 space-y-4">
              <Input
                placeholder="Search for a location"
                value={searchValue}
                onChange={(e) => handleSearch(e.target.value)}
              />
              {suggestions.length > 0 && (
                <div className="space-y-2">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion.id}
                      className="flex items-center space-x-2 w-full p-2 hover:bg-gray-100 rounded-lg text-left"
                      onClick={() => handleLocationSelect(suggestion)}
                    >
                      <MapPin className="w-4 h-4 text-primary" weight="fill" />
                      <span className="text-sm">{suggestion.place_name}</span>
                    </button>
                  ))}
                </div>
              )}
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
          height: "100svh",
        }}
        mapStyle="mapbox://styles/mapbox/streets-v11"
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
        reuseMaps
      >
        <Marker
          latitude={location?.lat || ZUG_CENTER.latitude}
          longitude={location?.lng || ZUG_CENTER.longitude}
          anchor="bottom"
          draggable={true}
          onDragEnd={handleMarkerDrag}
        >
          <MapPin
            className="w-8 h-8 text-primary -translate-y-2 cursor-grab active:cursor-grabbing"
            weight="fill"
          />
        </Marker>
      </Map>

      <div className="absolute bottom-12 p-4 bg-white shadow-md rounded-lg space-y-4 left-0 w-[calc(100%-32px)] ml-[16px] z-10">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 justify-between">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-primary" weight="fill" />
              <p className="text-sm font-medium">Current Location</p>
            </div>
            {isLocationFromImage && (
              <div className="flex items-center ml-auto">
                <Camera className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground ml-1">
                  From image
                </span>
              </div>
            )}
          </div>
          <div className="pl-6">
            <p className="text-sm text-muted-foreground whitespace-pre-line">
              {location?.address || ZUG_CENTER.address}
            </p>
          </div>
        </div>
        {isLocationFromImage ? (
          <Button className="w-full" onClick={() => setCurrentStep(2)}>
            Confirm Location from Image
          </Button>
        ) : (
          <Button
            className="w-full"
            onClick={() => setCurrentStep(2)}
            disabled={!isLocationConfirmed}
          >
            {isLocationConfirmed ? "Confirm Location" : "Select Location"}
          </Button>
        )}
      </div>
    </div>
  );
}
