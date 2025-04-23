"use client";
import { Button } from "@repo/ui/button";

import { DEFAULT_LOCATION, MAP_CONSTANTS } from "@/lib/constants";
import { Crosshair, MapPin } from "@phosphor-icons/react";
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
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

// Set the Mapbox access token
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "";

interface Report {
  id: string;
  location_lat: number;
  location_lng: number;
  location_address: string;
  incident_types: { name: string };
  incident_subtypes: { name: string };
  created_at: string;
  [key: string]: unknown;
}

interface OverviewMapProps {
  reports: Report[];
}

const OverviewMap = ({ reports }: OverviewMapProps) => {
  const t = useTranslations("components.location");
  const [searchValue, setSearchValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  // Initialize the map when the component mounts
  useEffect(() => {
    if (mapContainer.current && !map.current) {
      // Start with default location
      const initialLng = DEFAULT_LOCATION.longitude;
      const initialLat = DEFAULT_LOCATION.latitude;

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [initialLng, initialLat],
        zoom: DEFAULT_LOCATION.zoom,
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

      // Clean up on unmount
      return () => {
        if (map.current) {
          map.current.remove();
          map.current = null;
        }
      };
    }
  }, []);

  // Handle search input
  const handleSearch = (value: string) => {
    setSearchValue(value);

    if (value.length >= MAP_CONSTANTS.MIN_SEARCH_LENGTH) {
      // Filter reports based on search value
      const filtered = reports.filter(
        (report) =>
          report.location_address
            ?.toLowerCase()
            .includes(value.toLowerCase()) ||
          report.incident_types?.name
            ?.toLowerCase()
            .includes(value.toLowerCase()) ||
          report.incident_subtypes?.name
            ?.toLowerCase()
            .includes(value.toLowerCase())
      );
      setFilteredReports(filtered);
    } else {
      setFilteredReports([]);
    }
  };

  // Handle report selection
  const handleReportSelect = (report: Report) => {
    if (map.current && report.location_lat && report.location_lng) {
      map.current.flyTo({
        center: [report.location_lng, report.location_lat],
        zoom: MAP_CONSTANTS.DEFAULT_ZOOM,
        duration: MAP_CONSTANTS.FLY_TO_DURATION,
      });
    }
    setIsFocused(false);
  };

  // Request user's location
  const requestLocationPermission = () => {
    setIsGettingLocation(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;

          if (map.current) {
            map.current.flyTo({
              center: [longitude, latitude],
              zoom: MAP_CONSTANTS.DEFAULT_ZOOM,
              duration: MAP_CONSTANTS.FLY_TO_DURATION,
            });
          }

          setIsGettingLocation(false);
        },
        (error) => {
          console.error("Error getting location", error);
          setIsGettingLocation(false);
        },
        MAP_CONSTANTS.GEOLOCATION_OPTIONS
      );
    } else {
      console.error("Geolocation not supported");
      setIsGettingLocation(false);
    }
  };

  return (
    <>
      <div className="absolute top-5 left-5 w-[calc(100%-2.5rem)] bg-background px-3 py-2 z-20">
        <Command shouldFilter={false}>
          <div className="flex items-center w-full justify-between gap-4">
            <CommandInput
              placeholder={t("search.placeholder")}
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
                {t("buttons.getLocation")}
              </span>
              <Crosshair className="sm:hidden" size={20} />
            </Button>
          </div>
          {searchValue.length >= MAP_CONSTANTS.MIN_SEARCH_LENGTH &&
            isFocused && (
              <CommandList>
                {filteredReports.length === 0 ? (
                  <CommandEmpty>{t("search.noResults")}</CommandEmpty>
                ) : (
                  <CommandGroup>
                    {filteredReports.map((report) => (
                      <CommandItem
                        key={report.id}
                        value={report.location_address || ""}
                        onSelect={() => handleReportSelect(report)}
                        className="flex items-center gap-2 px-4 py-2"
                      >
                        <MapPin
                          className="w-4 h-4 text-primary"
                          weight="fill"
                        />
                        <span className="text-sm">
                          {report.location_address || "Unknown location"}
                        </span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </CommandList>
            )}
        </Command>
      </div>
      <div className="h-svh w-full overflow-hidden relative">
        <div ref={mapContainer} className="h-full w-full" />
      </div>
    </>
  );
};

export default OverviewMap;
