"use client";

import { DEFAULT_LOCATION, MAP_CONSTANTS } from "@/lib/constants";
import { LocationMapProps, Suggestion } from "@/lib/types";
import {
  createLocationFromSuggestion,
  fetchAddressFromCoordinates,
  fetchLocationSuggestions,
} from "@/lib/utils/map";
import {
  ArrowsOutCardinal,
  Crosshair,
  MagnifyingGlass,
  MapPin,
} from "@phosphor-icons/react";
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
import { Input } from "@repo/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@repo/ui/sheet";
import { TypographySpan } from "@repo/ui/text";
import { motion } from "framer-motion";
import "mapbox-gl/dist/mapbox-gl.css";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import type { MapRef } from "react-map-gl";
import Map from "react-map-gl";

export default function LocationMap({
  onLocationSelect,
  initialLocation,
  locationSubmitted = false,
  hasInteractedWithMap,
  onMapInteraction,
}: LocationMapProps) {
  const t = useTranslations("components.reportFlow");
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [showLocationDialog, setShowLocationDialog] = useState(false);
  const [hasLocationFromImage, setHasLocationFromImage] = useState(false);
  const mapRef = useRef<MapRef>(null);

  // Set hasLocationFromImage when initialLocation changes
  useEffect(() => {
    setHasLocationFromImage(!!initialLocation);
  }, [initialLocation]);

  // Show dialog only if we have a location from an image and haven't interacted yet
  useEffect(() => {
    if (hasLocationFromImage && !hasInteractedWithMap && !locationSubmitted) {
      setShowLocationDialog(true);
    }
  }, [hasLocationFromImage, hasInteractedWithMap, locationSubmitted]);

  // Set searchValue from initialLocation when locationSubmitted is true
  useEffect(() => {
    if (locationSubmitted && initialLocation) {
      setSearchValue(initialLocation.address);
    }
  }, [locationSubmitted, initialLocation]);

  const handleLocationConfirm = () => {
    if (initialLocation) {
      setShowLocationDialog(false);
      setSearchValue(initialLocation.address);
      onLocationSelect(initialLocation);
      mapRef.current?.flyTo({
        center: [initialLocation.lng, initialLocation.lat],
        zoom: MAP_CONSTANTS.DEFAULT_ZOOM,
        duration: MAP_CONSTANTS.FLY_TO_DURATION,
      });
    }
  };

  const handleLocationReject = () => {
    setShowLocationDialog(false);
  };

  const handleMapInteraction = () => {
    if (!hasInteractedWithMap) {
      onMapInteraction();
    }
  };

  const handleSearch = useCallback(async (value: string) => {
    setSearchValue(value);

    if (value.length < MAP_CONSTANTS.MIN_SEARCH_LENGTH) {
      setSuggestions([]);
      return;
    }

    const suggestions = await fetchLocationSuggestions(value);
    setSuggestions(suggestions);
  }, []);

  const handleLocationSelect = useCallback(
    async (suggestion: Suggestion) => {
      const location = createLocationFromSuggestion(suggestion);
      onLocationSelect(location);
      setSearchValue(suggestion.place_name);
      setSuggestions([]);
      setIsOpen(false);

      mapRef.current?.flyTo({
        center: [location.lng, location.lat],
        zoom: MAP_CONSTANTS.DEFAULT_ZOOM,
        duration: MAP_CONSTANTS.FLY_TO_DURATION,
      });
    },
    [onLocationSelect]
  );

  const handleMapMove = useCallback(async () => {
    if (!mapRef.current) return;

    const center = mapRef.current.getCenter();
    const address = await fetchAddressFromCoordinates(center.lng, center.lat);

    onLocationSelect({
      lat: center.lat,
      lng: center.lng,
      address,
    });
    setSearchValue(address);
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
          const address = await fetchAddressFromCoordinates(lng, lat);

          onLocationSelect({
            lat,
            lng,
            address,
          });

          mapRef.current?.flyTo({
            center: [lng, lat],
            zoom: MAP_CONSTANTS.DEFAULT_ZOOM,
            duration: MAP_CONSTANTS.FLY_TO_DURATION,
          });
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
        MAP_CONSTANTS.GEOLOCATION_OPTIONS
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
        initialViewState={{
          latitude:
            locationSubmitted && initialLocation
              ? initialLocation.lat
              : DEFAULT_LOCATION.latitude,
          longitude:
            locationSubmitted && initialLocation
              ? initialLocation.lng
              : DEFAULT_LOCATION.longitude,
          zoom: DEFAULT_LOCATION.zoom,
        }}
        style={{
          width: "100%",
          height: "calc(100svh - 190px)",
          position: "relative",
        }}
        mapStyle="mapbox://styles/mapbox/streets-v11"
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
        reuseMaps
        onClick={handleMapInteraction}
        onMoveStart={() => {
          setIsMoving(true);
          handleMapInteraction();
        }}
        onMoveEnd={() => {
          setIsMoving(false);
          handleMapMove();
        }}
      >
        {!hasInteractedWithMap && !showLocationDialog && (
          <div
            className="absolute top-0 left-0 backdrop-blur-xs w-full h-full z-10 flex flex-col justify-center items-center space-y-4 p-6 text-center cursor-pointer"
            onClick={handleMapInteraction}
          >
            <ArrowsOutCardinal size={48} />
            <TypographySpan className="block font-regular" size="text-lg">
              {t("locationMap.moveMap")}
            </TypographySpan>
          </div>
        )}
        <div className="absolute bottom-12 left-0 right-0 mx-4">
          <div className="bg-background rounded-lg p-3 shadow-lg">
            <div className="flex items-center gap-2">
              <MapPin
                className="w-4 h-4 text-primary flex-shrink-0"
                weight="fill"
              />
              <span className="text-sm truncate">
                {searchValue || DEFAULT_LOCATION.address}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  requestLocationPermission();
                }}
                disabled={isGettingLocation}
                className="flex items-center justify-center"
              >
                <Crosshair className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
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
          </motion.div>
          {isMoving && (
            <div className="w-3 h-3 rounded-full bg-black/20 mx-auto mt-1" />
          )}
        </div>
      </Map>

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
              {t("locationMap.locationDialog.description", {
                address: initialLocation?.address,
              })}
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
}
