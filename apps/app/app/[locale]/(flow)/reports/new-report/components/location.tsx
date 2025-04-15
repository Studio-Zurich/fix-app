"use client";
import { log } from "@/lib/logger";
import { reportStore, useLocationStore } from "@/lib/store";
import { Button } from "@repo/ui/button";

import { DEFAULT_LOCATION, MAP_CONSTANTS } from "@/lib/constants";
import { Crosshair, MapPin, Warning } from "@phosphor-icons/react";
import { Alert, AlertDescription, AlertTitle } from "@repo/ui/alert";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@repo/ui/command";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useCallback, useEffect, useRef, useState } from "react";
import StepContainer from "./step-container";

// Set the Mapbox access token
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "";

const Location = () => {
  const [address, setAddress] = useState("");
  const [coordinates, setCoordinates] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [searchValue, setSearchValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<
    Array<{
      id: string;
      place_name: string;
      center: [number, number];
    }>
  >([]);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [isOutsideSwitzerland, setIsOutsideSwitzerland] = useState(false);
  const [updateSource, setUpdateSource] = useState<
    "map" | "search" | "geolocation" | null
  >(null);
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  // Get detected location from location store
  const detectedLocation = useLocationStore((state) => state.detectedLocation);

  // Get setLocation function from store using direct method to avoid subscription issues
  const setLocation = useCallback(
    (location: { lat: number; lng: number; address: string }) => {
      reportStore.getState().setLocation(location);
    },
    []
  );

  // Check if coordinates are within Switzerland
  const isWithinSwitzerland = useCallback((lat: number, lng: number) => {
    const { minLat, maxLat, minLng, maxLng } = MAP_CONSTANTS.SWITZERLAND_BOUNDS;
    return lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng;
  }, []);

  // Update coordinates and check if they're within Switzerland
  const updateCoordinates = useCallback(
    (lat: number, lng: number, source: "map" | "search" | "geolocation") => {
      setCoordinates({ lat, lng });
      setUpdateSource(source);
      setIsOutsideSwitzerland(!isWithinSwitzerland(lat, lng));
    },
    [isWithinSwitzerland]
  );

  // Initialize the map when the component mounts
  useEffect(() => {
    if (mapContainer.current && !map.current) {
      // Use detected location from EXIF data if available, otherwise default to DEFAULT_LOCATION
      const initialLng =
        detectedLocation.longitude ?? DEFAULT_LOCATION.longitude;
      const initialLat = detectedLocation.latitude ?? DEFAULT_LOCATION.latitude;

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [initialLng, initialLat],
        zoom: detectedLocation.latitude
          ? MAP_CONSTANTS.DEFAULT_ZOOM
          : DEFAULT_LOCATION.zoom,
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

      // Set initial coordinates if we have a detected location
      if (detectedLocation.latitude && detectedLocation.longitude) {
        setCoordinates({
          lat: detectedLocation.latitude,
          lng: detectedLocation.longitude,
        });
        log("Using detected location", detectedLocation);
      }

      // Update coordinates when map moves
      map.current.on("movestart", () => {
        setIsMoving(true);
      });

      map.current.on("moveend", async () => {
        setIsMoving(false);
        if (map.current) {
          const center = map.current.getCenter();
          const lat = center.lat;
          const lng = center.lng;

          // Check if the new position is within Switzerland
          const withinSwitzerland = isWithinSwitzerland(lat, lng);
          setIsOutsideSwitzerland(!withinSwitzerland);

          // Always update coordinates even if outside Switzerland
          setUpdateSource("map");
          setCoordinates({ lat, lng });

          // Get address for the new coordinates
          try {
            const response = await fetch(
              `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxgl.accessToken}&country=ch&limit=1`
            );
            const data = await response.json();
            if (data.features && data.features.length > 0) {
              setAddress(data.features[0].place_name);
              setSearchValue(data.features[0].place_name);
            }
          } catch (error) {
            log("Error reverse geocoding", { error });
          }

          log("Map position updated", { lat, lng, withinSwitzerland });
        }
      });

      // Clean up on unmount
      return () => {
        if (map.current) {
          map.current.remove();
          map.current = null;
        }
      };
    }
  }, [detectedLocation, isWithinSwitzerland]);

  // Update map when coordinates change from search or getting location, but not from map movement
  useEffect(() => {
    if (map.current && coordinates && updateSource !== "map") {
      map.current.flyTo({
        center: [coordinates.lng, coordinates.lat],
        zoom: MAP_CONSTANTS.DEFAULT_ZOOM,
        duration: MAP_CONSTANTS.FLY_TO_DURATION,
      });
    }
  }, [coordinates, updateSource]);

  const handleNext = () => {
    // Only proceed if coordinates are set and within Switzerland
    if (coordinates && !isOutsideSwitzerland) {
      // Save to store
      setLocation({
        lat: coordinates.lat,
        lng: coordinates.lng,
        address: address,
      });
      log("Location saved to store on Next click", { coordinates, address });

      // Go to incident type step
      reportStore.setState({ step: 2 });
    }
  };

  const handleBack = () => {
    // Just go back to the previous step without validating or saving data
    reportStore.setState({ step: 0 });
  };

  const handleSearch = async (value: string) => {
    setSearchValue(value);
    if (value.length >= MAP_CONSTANTS.MIN_SEARCH_LENGTH) {
      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
            value
          )}.json?access_token=${mapboxgl.accessToken}&country=ch&limit=5`
        );
        const data = await response.json();
        setSuggestions(data.features || []);
      } catch (error) {
        log("Error fetching suggestions", { error });
        setSuggestions([]);
      }
    } else {
      setSuggestions([]);
    }
  };

  const handleLocationSelect = (suggestion: {
    place_name: string;
    center: [number, number];
  }) => {
    const [lng, lat] = suggestion.center;
    setAddress(suggestion.place_name);
    updateCoordinates(lat, lng, "search");
    setSearchValue(suggestion.place_name);
  };

  const requestLocationPermission = () => {
    setIsGettingLocation(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          updateCoordinates(latitude, longitude, "geolocation");

          // Reverse geocode to get address
          fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${mapboxgl.accessToken}&country=ch&limit=1`
          )
            .then((response) => response.json())
            .then((data) => {
              if (data.features && data.features.length > 0) {
                setAddress(data.features[0].place_name);
                setSearchValue(data.features[0].place_name);
              }
            })
            .catch((error) => {
              log("Error reverse geocoding", { error });
            })
            .finally(() => {
              setIsGettingLocation(false);
            });
        },
        (error) => {
          log("Error getting location", { error });
          setIsGettingLocation(false);
        },
        MAP_CONSTANTS.GEOLOCATION_OPTIONS
      );
    } else {
      log("Geolocation not supported");
      setIsGettingLocation(false);
    }
  };

  return (
    <StepContainer
      prevButton={
        <Button type="button" variant="outline" onClick={handleBack}>
          Back
        </Button>
      }
      nextButton={
        <Button
          type="button"
          onClick={handleNext}
          disabled={!coordinates || isOutsideSwitzerland}
        >
          Next
        </Button>
      }
    >
      <div className="absolute top-5 left-5 w-[calc(100%-2.5rem)] bg-background px-3 py-2 z-20">
        <Command shouldFilter={false}>
          <div className="flex items-center w-full justify-between gap-4">
            <CommandInput
              placeholder="search"
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
              <span className="hidden sm:block">Get location</span>
              <Crosshair className="sm:hidden" size={20} />
            </Button>
          </div>
          {searchValue.length >= MAP_CONSTANTS.MIN_SEARCH_LENGTH &&
            isFocused && (
              <CommandList>
                {suggestions.length === 0 ? (
                  <CommandEmpty>no results</CommandEmpty>
                ) : (
                  <CommandGroup>
                    {suggestions.map((suggestion) => (
                      <CommandItem
                        key={`${suggestion.id}-${suggestion.center.join(",")}`}
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
                        <span className="text-sm">{suggestion.place_name}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </CommandList>
            )}
        </Command>
      </div>
      <div className="h-svh w-full rounded-md overflow-hidden border relative">
        <div ref={mapContainer} className="h-full w-full" />

        {/* Centered pin */}
        <div
          className="absolute left-1/2 top-1/2 pointer-events-none z-30 transform transition-all duration-300"
          style={{
            transform: `translate(-50%, ${isMoving ? "-8px" : "0"})`,
          }}
        >
          <div className="flex flex-col items-center">
            <MapPin
              className="w-8 h-8 text-primary"
              weight="fill"
              style={{
                transform: "translateY(-100%)",
                marginBottom: "-2px", // Adjust pin tip position exactly
              }}
            />
            {isMoving && (
              <div className="w-3 h-3 rounded-full bg-black/20 relative -top-8" />
            )}
          </div>
        </div>
      </div>

      {/* Switzerland boundary alert */}
      {isOutsideSwitzerland && (
        <Alert
          variant="destructive"
          className="absolute bottom-[calc(66px+1rem)] left-1/2 transform -translate-x-1/2 w-[90%] max-w-md z-40 bg-background"
        >
          <Warning className="h-5 w-5" />
          <AlertTitle>Heads up!</AlertTitle>
          <AlertDescription>
            {MAP_CONSTANTS.OUTSIDE_SWITZERLAND_ERROR}
          </AlertDescription>
        </Alert>
      )}

      {/* Hidden inputs to pass the location data to the form */}
      {coordinates && (
        <>
          <input type="hidden" name="location_lat" value={coordinates.lat} />
          <input type="hidden" name="location_lng" value={coordinates.lng} />
          <input type="hidden" name="location_address" value={address} />
        </>
      )}
    </StepContainer>
  );
};

export default Location;
