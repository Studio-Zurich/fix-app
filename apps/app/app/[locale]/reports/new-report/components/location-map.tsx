"use client";

import { Location } from "@/lib/types";
import { Crosshair, MagnifyingGlass, MapPin } from "@phosphor-icons/react";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@repo/ui/sheet";
import { motion } from "framer-motion";
import "mapbox-gl/dist/mapbox-gl.css";
import { useCallback, useRef, useState } from "react";
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

interface LocationMapProps {
  onLocationSelect: (location: Location) => void;
}

const LocationPopup = ({ address }: { address: string }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="absolute -top-[4.25rem] left-4 pointer-events-none z-10"
    >
      <div className="bg-background p-3 w-[calc(50vw-40px)] mx-auto rounded-lg shadow-lg">
        <span className="block text-[12px]">{address}</span>
      </div>
    </motion.div>
  );
};

export default function LocationMap({ onLocationSelect }: LocationMapProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const mapRef = useRef<MapRef>(null);

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

      onLocationSelect({
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
    [onLocationSelect]
  );

  const handleMapMove = useCallback(async () => {
    if (!mapRef.current) return;

    const center = mapRef.current.getCenter();
    const lng = center.lng;
    const lat = center.lat;

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}`
      );
      const data = await response.json();
      const address = data.features[0]?.place_name || "Unknown location";

      onLocationSelect({
        lat,
        lng,
        address,
      });
    } catch (error) {
      console.error("Error fetching address:", error);
    }
  }, [onLocationSelect]);

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

            onLocationSelect({
              lat,
              lng,
              address,
            });

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
  }, [onLocationSelect]);

  return (
    <div className="relative">
      <Map
        ref={mapRef}
        initialViewState={ZUG_CENTER}
        style={{
          width: "100%",
          height: "calc(50svh - 200px)",
        }}
        mapStyle="mapbox://styles/mapbox/streets-v11"
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
        reuseMaps
        onMoveStart={() => setIsMoving(true)}
        onMoveEnd={() => {
          setIsMoving(false);
          handleMapMove();
        }}
      >
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger className="absolute top-5 left-5 bg-background w-10 h-10 rounded-full flex items-center justify-center">
            <MagnifyingGlass className="w-4 h-4 text-muted-foreground" />
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
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            requestLocationPermission();
          }}
          disabled={isGettingLocation}
          className="absolute top-5 right-5 bg-background w-10 h-10 rounded-full flex items-center justify-center"
        >
          <Crosshair className="w-4 h-4" />
        </Button>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full pointer-events-none">
          <motion.div
            className="relative"
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
            {!isMoving && searchValue && (
              <LocationPopup address={searchValue} />
            )}
          </motion.div>
          {isMoving && (
            <div className="w-3 h-3 rounded-full bg-black/20 mx-auto mt-1" />
          )}
        </div>
      </Map>
    </div>
  );
}
