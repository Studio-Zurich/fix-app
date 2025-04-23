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
  incident_type_id: string;
  incident_subtype_id?: string;
  created_at: string;
  [key: string]: unknown;
}

interface OverviewMapProps {
  reports: Report[];
}

const OverviewMap = ({ reports }: OverviewMapProps) => {
  const t = useTranslations("components.location");
  const incidentTypesT = useTranslations("incidentTypes");
  const [searchValue, setSearchValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [markers, setMarkers] = useState<mapboxgl.Marker[]>([]);

  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  // Get translated type name
  const getTranslatedType = (typeId: string) => {
    try {
      // Try to get translated name from translations
      const translatedName = incidentTypesT.raw(`types.${typeId}.name`);
      return translatedName as string;
    } catch (error) {
      // Fall back to database name if translation not found
      return (
        reports.find((r) => r.incident_type_id === typeId)?.incident_types
          ?.name || "Unknown"
      );
    }
  };

  // Get translated subtype name
  const getTranslatedSubtype = (typeId: string, subtypeId: string) => {
    try {
      // Try to get translated name from translations
      const translatedName = incidentTypesT.raw(
        `types.${typeId}.subtypes.${subtypeId}.name`
      );
      return translatedName as string;
    } catch (error) {
      // Fall back to database name if translation not found
      return (
        reports.find((r) => r.incident_subtype_id === subtypeId)
          ?.incident_subtypes?.name || ""
      );
    }
  };

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

      // Clean up on unmount
      return () => {
        if (map.current) {
          map.current.remove();
          map.current = null;
        }
      };
    }
  }, []);

  // Add markers for all reports
  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers
    markers.forEach((marker) => marker.remove());
    const newMarkers: mapboxgl.Marker[] = [];

    // Add markers for all reports
    reports.forEach((report) => {
      if (report.location_lat && report.location_lng) {
        // Create a DOM element for the marker
        const el = document.createElement("div");
        el.className = "marker";
        el.style.width = "20px";
        el.style.height = "20px";
        el.style.borderRadius = "50%";
        el.style.backgroundColor = "#FF8C00"; // Orange color
        el.style.border = "2px solid white";

        // Create and add the marker
        const marker = new mapboxgl.Marker(el)
          .setLngLat([report.location_lng, report.location_lat])
          .addTo(map.current!);

        newMarkers.push(marker);
      }
    });

    setMarkers(newMarkers);

    return () => {
      newMarkers.forEach((marker) => marker.remove());
    };
  }, [reports]);

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

  // Get the most recent reports (up to 5)
  const getRecentReports = () => {
    return [...reports]
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      .slice(0, 5);
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
              onFocus={() => {
                setIsFocused(true);
                // Show recent reports when clicking on the input field with empty search
                if (searchValue.length === 0) {
                  setFilteredReports(getRecentReports());
                }
              }}
              onBlur={() => {
                // Small delay to allow clicking on suggestions
                setTimeout(() => setIsFocused(false), 200);
              }}
              onClick={() => {
                // Show recent reports when clicking on the input field
                if (searchValue.length === 0) {
                  setFilteredReports(getRecentReports());
                  setIsFocused(true);
                }
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
          {isFocused && (
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
                      <MapPin className="w-4 h-4 text-primary" weight="fill" />
                      <span className="text-sm">
                        {report.incident_type_id
                          ? getTranslatedType(report.incident_type_id)
                          : report.incident_types?.name || "Unknown"}{" "}
                        –{" "}
                        {report.incident_type_id && report.incident_subtype_id
                          ? getTranslatedSubtype(
                              report.incident_type_id,
                              report.incident_subtype_id
                            )
                          : report.incident_subtypes?.name || "Unknown"}{" "}
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
