"use client";

import { DEFAULT_LOCATION, MAP_CONSTANTS } from "@/lib/constants";
import { LocationMapProps, Suggestion } from "@/lib/types";
import {
  createLocationFromSuggestion,
  fetchAddressFromCoordinates,
  fetchLocationSuggestions,
} from "@/lib/utils/map";
import { Crosshair, MapPin } from "@phosphor-icons/react";
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@repo/ui/command";
import { TypographyParagraph } from "@repo/ui/text";
import { motion } from "framer-motion";
import "mapbox-gl/dist/mapbox-gl.css";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import type { MapRef } from "react-map-gl";
import Map from "react-map-gl";
import MapOverlay from "./map-overlay";
import StepHeader from "./step-header";
export default function LocationMap({
  onLocationSelect,
  initialLocation,
  locationSubmitted = false,
  hasInteractedWithMap,
  onMapInteraction,
  setHasInteractedWithMap,
}: LocationMapProps) {
  const t = useTranslations("components.reportFlow");

  const [searchValue, setSearchValue] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [showLocationDialog, setShowLocationDialog] = useState(false);
  const [hasLocationFromImage, setHasLocationFromImage] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const mapRef = useRef<MapRef>(null);

  // Set hasLocationFromImage when initialLocation changes
  useEffect(() => {
    if (initialLocation && !hasInteractedWithMap && !locationSubmitted) {
      setHasLocationFromImage(true);
      setShowLocationDialog(true);
    } else {
      setHasLocationFromImage(false);
      setShowLocationDialog(false);
    }
  }, [initialLocation, hasInteractedWithMap, locationSubmitted]);

  // Set searchValue from initialLocation when locationSubmitted is true
  useEffect(() => {
    if (locationSubmitted && initialLocation) {
      setSearchValue(initialLocation.address);
    }
  }, [locationSubmitted, initialLocation]);

  const handleLocationConfirm = () => {
    if (initialLocation) {
      setShowLocationDialog(false);
      setHasLocationFromImage(false);
      setHasInteractedWithMap(true);
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
    setHasLocationFromImage(false);
    setHasInteractedWithMap(true);
  };

  const handleMapInteraction = () => {
    if (!hasInteractedWithMap) {
      onMapInteraction();
    }
  };

  const handleSearch = useCallback(async (value: string) => {
    setSearchValue(value);

    const searchTerm = value.trim();
    if (!searchTerm || searchTerm.length < MAP_CONSTANTS.MIN_SEARCH_LENGTH) {
      setSuggestions([]);
      return;
    }

    try {
      const results = await fetchLocationSuggestions(searchTerm);
      console.log("Search results:", results);
      setSuggestions(results || []);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setSuggestions([]);
    }
  }, []);

  const handleLocationSelect = useCallback(
    async (suggestion: Suggestion) => {
      console.log("Selected suggestion:", suggestion); // Debug log
      const location = createLocationFromSuggestion(suggestion);
      onLocationSelect(location);
      setSearchValue(suggestion.place_name);
      setSuggestions([]);

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
    <div className="relative flex-1 h-full space-y-4">
      <StepHeader
        step={t("locationMap.step")}
        description={t("locationMap.description")}
      />
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
          height: "calc(100svh - 206px)",
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
          <MapOverlay
            onInteraction={handleMapInteraction}
            text={t("locationMap.moveMap")}
          />
        )}
        <div className="absolute top-5 left-5 w-[calc(100%-2.5rem)] bg-background px-3 py-2">
          <Command shouldFilter={false}>
            <div className="flex items-center w-full justify-between gap-4">
              <CommandInput
                placeholder={t("locationMap.searchPlaceholder")}
                value={searchValue}
                onValueChange={handleSearch}
                className="h-11"
                onFocus={() => setIsFocused(true)}
                onBlur={() => {
                  // Small delay to allow clicking on suggestions
                  setTimeout(() => setIsFocused(false), 200);
                }}
              />
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  requestLocationPermission();
                }}
                disabled={isGettingLocation}
                // className="absolute right-0 top-0.5 p-2 sm:p-0 sm:px-3"
              >
                <span className="hidden sm:block">
                  {t("locationMap.getLocation")}
                </span>
                <Crosshair className="sm:hidden" size={20} />
              </Button>
            </div>
            {searchValue.length >= MAP_CONSTANTS.MIN_SEARCH_LENGTH &&
              isFocused && (
                <CommandList>
                  {suggestions.length === 0 ? (
                    <CommandEmpty>{t("locationMap.noResults")}</CommandEmpty>
                  ) : (
                    <CommandGroup>
                      {suggestions.map((suggestion) => (
                        <CommandItem
                          key={suggestion.id}
                          value={suggestion.place_name}
                          onSelect={() => {
                            handleLocationSelect(suggestion);
                            setIsFocused(false);
                          }}
                          className="flex items-center gap-2 px-4 py-2"
                        >
                          <MapPin
                            className="w-4 h-4 text-primary"
                            weight="fill"
                          />
                          <span className="text-sm">
                            {suggestion.place_name}
                          </span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                </CommandList>
              )}
          </Command>
        </div>

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
        {/* <div className="absolute bottom-12 left-0 right-0 mx-4">
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
        </div> */}
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
              {t("locationMap.locationDialog.description")}
              {initialLocation?.address && (
                <TypographyParagraph className="mt-2 block">
                  {initialLocation.address}
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
}
