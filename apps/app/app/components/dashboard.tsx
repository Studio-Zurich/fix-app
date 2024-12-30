"use client";

import { useReportStore } from "@/lib/store";
import { Crosshair, MagnifyingGlass, MapPin } from "@phosphor-icons/react";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import MapOverview from "./map-overview";
import QuickAccessReports from "./quick-access-reports";

interface Suggestion {
  id: string;
  place_name: string;
  center: [number, number];
}

const Dashboard = () => {
  const t = useTranslations("DashboardPage");
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const setLocation = useReportStore((state) => state.setLocation);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
        )}.json?access_token=${
          process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
        }&country=CH`
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

      setLocation({
        lat,
        lng,
        address: suggestion.place_name,
      });

      setSearchValue(suggestion.place_name);
      setSuggestions([]);
      setIsFocused(false);

      setTimeout(() => {
        router.push(`/${window.location.pathname.split("/")[1]}/report`);
      }, 0);
    },
    [setLocation, router]
  );

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

            setTimeout(() => {
              router.push(`/${window.location.pathname.split("/")[1]}/report`);
            }, 0);
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
  }, [setLocation, router]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-4"
    >
      <h1 className="text-2xl font-bold">{t("title")}</h1>

      <div className="relative" ref={searchContainerRef}>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <div className="relative">
              <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search for a location"
                value={searchValue}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => setIsFocused(true)}
                className="pl-9"
              />
            </div>

            <AnimatePresence>
              {isFocused && suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-[300px] overflow-y-auto z-50"
                >
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion.id}
                      className="flex items-center space-x-2 w-full p-3 hover:bg-gray-50 text-left border-b last:border-b-0"
                      onClick={() => handleLocationSelect(suggestion)}
                    >
                      <MapPin
                        className="w-4 h-4 text-primary flex-shrink-0"
                        weight="fill"
                      />
                      <span className="text-sm truncate">
                        {suggestion.place_name}
                      </span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Button
            variant="outline"
            onClick={requestLocationPermission}
            disabled={isGettingLocation}
            className="flex-shrink-0"
          >
            <Crosshair className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <MapOverview />
      <QuickAccessReports />
    </motion.div>
  );
};

export default Dashboard;
