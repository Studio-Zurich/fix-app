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
  const [isFocused, setIsFocused] = useState(false);
  const [showLocationDialog, setShowLocationDialog] = useState(false);
  const [hasShownDialog, setHasShownDialog] = useState(false);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const mapRef = useRef<MapRef>(null);

  // Only set the search value when location is confirmed
  useEffect(() => {
    if (initialLocation && locationSubmitted) {
      setSearchValue(initialLocation.address);
    }
  }, [initialLocation, locationSubmitted]);

  // Show location dialog when location is found and not submitted
  useEffect(() => {
    if (initialLocation && !locationSubmitted && !hasShownDialog) {
      console.log("Showing location dialog", {
        initialLocation,
        locationSubmitted,
        hasShownDialog,
      });
      setShowLocationDialog(true);
      setHasShownDialog(true);
    }
  }, [initialLocation, locationSubmitted, hasShownDialog]);

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

  const flyToLocation = useCallback(
    (location: { lng: number; lat: number }) => {
      if (mapRef.current && isMapLoaded) {
        mapRef.current.flyTo({
          center: [location.lng, location.lat],
          zoom: MAP_CONSTANTS.DEFAULT_ZOOM,
          duration: MAP_CONSTANTS.FLY_TO_DURATION,
        });
      }
    },
    [isMapLoaded]
  );

  const handleLocationConfirm = () => {
    if (initialLocation) {
      setShowLocationDialog(false);
      onMapInteraction();
      onLocationSelect(initialLocation);
      // Only fly to location after confirmation
      flyToLocation(initialLocation);
    }
  };

  const handleLocationReject = () => {
    setShowLocationDialog(false);
    onLocationSelect(null);
    setSearchValue("");
  };

  const handleLocationSelect = useCallback(
    async (suggestion: Suggestion) => {
      console.log("Selected suggestion:", suggestion);
      const location = createLocationFromSuggestion(suggestion);
      onLocationSelect(location);
      setSearchValue(suggestion.place_name);
      setSuggestions([]);
      flyToLocation(location);
    },
    [onLocationSelect, flyToLocation]
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

          const location = {
            lat,
            lng,
            address,
          };
          onLocationSelect(location);
          flyToLocation(location);
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
  }, [onLocationSelect, flyToLocation]);

  const handleMapLoad = () => {
    setIsMapLoaded(true);
  };

  return (
    <div className="relative flex-1 h-full space-y-4">
      <StepHeader
        step={t("locationMap.step")}
        description={t("locationMap.description")}
      />
      <Map
        ref={mapRef}
        initialViewState={{
          latitude: locationSubmitted
            ? initialLocation?.lat || DEFAULT_LOCATION.latitude
            : DEFAULT_LOCATION.latitude,
          longitude: locationSubmitted
            ? initialLocation?.lng || DEFAULT_LOCATION.longitude
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
        onLoad={handleMapLoad}
        onMoveStart={() => {
          setIsMoving(true);
          handleMapInteraction();
        }}
        onMoveEnd={() => {
          setIsMoving(false);
          handleMapMove();
        }}
      >
        {!hasInteractedWithMap && (
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
                <TypographyParagraph className="mt-2 block text-foreground font-medium">
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
