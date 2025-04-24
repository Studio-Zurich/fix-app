"use client";
import { DEFAULT_LOCATION, MAP_CONSTANTS } from "@/lib/constants";

import { Crosshair } from "@phosphor-icons/react";
import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@repo/ui/command";
import { TypographyH3 } from "@repo/ui/headline";
import { Popover, PopoverContent, PopoverTrigger } from "@repo/ui/popover";
import { TypographyParagraph, TypographySpan } from "@repo/ui/text";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom/client";
import { toast } from "sonner";
import MapMarker from "./map-marker";
import QuickAddButton from "./quick-add-button";

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
  description?: string;
  [key: string]: unknown;
}

interface OverviewMapProps {
  reports: Report[];
}

const OverviewMap = ({ reports }: OverviewMapProps) => {
  const t = useTranslations("components.map");

  const incidentTypesT = useTranslations("incidentTypes");
  const [searchValue, setSearchValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [markers, setMarkers] = useState<mapboxgl.Marker[]>([]);
  const [userLocationMarker, setUserLocationMarker] =
    useState<mapboxgl.Marker | null>(null);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [showAllFilters, setShowAllFilters] = useState(true);

  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  // Get icon for a report
  const getReportIcon = (typeId: string, subtypeId?: string) => {
    try {
      if (subtypeId) {
        // Try to get subtype icon
        const subtypeIcon = incidentTypesT.raw(
          `types.${typeId}.subtypes.${subtypeId}.icon`
        );
        if (subtypeIcon) return subtypeIcon as string;
      }
      // Fall back to type icon
      const typeIcon = incidentTypesT.raw(`types.${typeId}.icon`);
      return (typeIcon as string) || "📍"; // Default to a pin if no icon found
    } catch (error) {
      return "📍"; // Default to a pin if there's an error
    }
  };

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

    // Filter reports based on selected filters
    const filteredReportsToShow = reports.filter((report) => {
      // If "All" is selected or no filters are selected, show all reports
      if (showAllFilters || selectedFilters.length === 0) {
        return true;
      }

      // If report has a subtype and it's in the selected filters, show it
      if (
        report.incident_subtype_id &&
        selectedFilters.includes(report.incident_subtype_id)
      ) {
        return true;
      }

      return false;
    });

    // Add markers for filtered reports
    filteredReportsToShow.forEach((report) => {
      if (report.location_lat && report.location_lng) {
        // Create a container for the marker
        const container = document.createElement("div");

        // Get the icon HTML
        const iconHtml = getReportIcon(
          report.incident_type_id,
          report.incident_subtype_id
        );

        // Render the MapMarker component with the icon as children
        const root = ReactDOM.createRoot(container);
        root.render(
          <MapMarker>
            <div
              style={{
                width: "24px",
                height: "24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "14px",
                backgroundColor: "white",
                borderRadius: "100%",
                padding: "1px",
              }}
              dangerouslySetInnerHTML={{ __html: iconHtml }}
            />
          </MapMarker>
        );

        // Create and add the marker
        const marker = new mapboxgl.Marker(container)
          .setLngLat([report.location_lng, report.location_lat])
          .addTo(map.current!);

        // Add click event to show popover
        container.addEventListener("click", () => {
          setSelectedReport(report);
          setIsPopoverOpen(true);
        });

        newMarkers.push(marker);
      }
    });

    setMarkers(newMarkers);

    return () => {
      newMarkers.forEach((marker) => marker.remove());
    };
  }, [reports, selectedFilters, showAllFilters]);

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
      // Store the selected report but don't open the popover yet
      setSelectedReport(report);

      // Add a one-time event listener for when the fly animation completes
      const handleMoveEnd = () => {
        // Open the popover after the fly animation completes
        setIsPopoverOpen(true);
        // Remove the event listener after it's been triggered
        map.current?.off("moveend", handleMoveEnd);
      };

      // Add the event listener before starting the fly animation
      map.current.on("moveend", handleMoveEnd);

      // Start the fly animation
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
            // Remove existing user location marker if it exists
            if (userLocationMarker) {
              userLocationMarker.remove();
            }

            // Create a DOM element for the user location marker
            const el = document.createElement("div");
            el.className = "user-location-marker";
            el.style.width = "20px";
            el.style.height = "20px";
            el.style.borderRadius = "50%";
            el.style.backgroundColor = "#4285F4"; // Blue color for user location
            el.style.border = "2px solid white";
            el.style.boxShadow = "0 0 0 2px rgba(66, 133, 244, 0.5)";

            // Create and add the user location marker
            const newUserLocationMarker = new mapboxgl.Marker(el)
              .setLngLat([longitude, latitude])
              .addTo(map.current);

            setUserLocationMarker(newUserLocationMarker);

            // Center map on user location
            map.current.flyTo({
              center: [longitude, latitude],
              zoom: MAP_CONSTANTS.DEFAULT_ZOOM,
              duration: MAP_CONSTANTS.FLY_TO_DURATION,
            });
          }

          setIsGettingLocation(false);
        },
        (error) => {
          // Handle geolocation errors without throwing console errors
          let errorMessage = "Unknown error";
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "User denied the request for geolocation";
              toast.error(t("errors.permissionDenied"));
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location information is unavailable";
              toast.error(t("errors.positionUnavailable"));
              break;
            case error.TIMEOUT:
              errorMessage = "The request to get user location timed out";
              toast.error(t("errors.timeout"));
              break;
          }
          // Log without throwing console error
          console.log("Geolocation error:", errorMessage);
          setIsGettingLocation(false);
        },
        MAP_CONSTANTS.GEOLOCATION_OPTIONS
      );
    } else {
      // Log without throwing console error
      console.log("Geolocation is not supported by this browser");
      toast.error(t("errors.notSupported"));
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
      .slice(0, 10);
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (userLocationMarker) {
        userLocationMarker.remove();
      }
    };
  }, [userLocationMarker]);

  // Get unique subtypes from reports
  const getUniqueSubtypes = () => {
    const uniqueSubtypes = new Map<
      string,
      { id: string; name: string; icon: string; typeId: string }
    >();

    reports.forEach((report) => {
      if (report.incident_subtype_id && report.incident_type_id) {
        const subtypeId = report.incident_subtype_id;
        if (!uniqueSubtypes.has(subtypeId)) {
          const icon = getReportIcon(report.incident_type_id, subtypeId);
          const name = getTranslatedSubtype(report.incident_type_id, subtypeId);
          uniqueSubtypes.set(subtypeId, {
            id: subtypeId,
            name,
            icon,
            typeId: report.incident_type_id,
          });
        }
      }
    });

    return Array.from(uniqueSubtypes.values());
  };

  // Handle filter badge click
  const handleFilterClick = (subtypeId: string | null) => {
    if (subtypeId === null) {
      // "All" badge clicked
      setShowAllFilters(true);
      setSelectedFilters([]);
    } else {
      // Specific subtype badge clicked
      setShowAllFilters(false);

      if (selectedFilters.includes(subtypeId)) {
        // Remove from selected filters
        setSelectedFilters(selectedFilters.filter((id) => id !== subtypeId));

        // If no filters selected, show all
        if (selectedFilters.length === 1) {
          setShowAllFilters(true);
        }
      } else {
        // Add to selected filters
        setSelectedFilters([...selectedFilters, subtypeId]);
      }
    }
  };

  return (
    <>
      <div className="absolute top-5 left-5 w-[calc(100%-2.5rem)] bg-background px-3 py-2 z-40">
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
                      className="flex items-center px-0 py-2 !bg-transparent hover:!bg-transparent"
                    >
                      <span className="text-base mr-3">
                        {getReportIcon(
                          report.incident_type_id,
                          report.incident_subtype_id
                        )}
                      </span>
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
      <div className="absolute top-[calc(20px+52px+10px)] left-0 w-full z-20 overflow-hidden">
        <div
          className="ml-5 flex space-x-2 overflow-x-auto"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {/* "All" badge */}
          <Badge
            className={`bg-background py-2.5 px-4 text-foreground cursor-pointer border ${showAllFilters ? "border-[#FF8C00] bg-[#FF8C00] text-background" : "border-transparent"} flex items-center whitespace-nowrap`}
            onClick={() => handleFilterClick(null)}
          >
            <TypographySpan size="text-xs" className="mr-1">
              🔍
            </TypographySpan>
            <TypographySpan size="text-xs">All</TypographySpan>
          </Badge>

          {/* Dynamic badges for each unique subtype */}
          {getUniqueSubtypes().map((subtype) => (
            <Badge
              key={subtype.id}
              className={`bg-background p-3 text-foreground cursor-pointer border last:mr-5 ${selectedFilters.includes(subtype.id) ? "border-[#FF8C00] bg-[#FF8C00] text-background" : "border-transparent"} flex items-center whitespace-nowrap`}
              onClick={() => handleFilterClick(subtype.id)}
            >
              <TypographySpan size="text-xs" className="mr-1">
                {subtype.icon}
              </TypographySpan>
              <TypographySpan size="text-xs">{subtype.name}</TypographySpan>
            </Badge>
          ))}
        </div>
      </div>
      <div className="h-svh w-full overflow-hidden relative">
        <div ref={mapContainer} className="h-full w-full" />
        <QuickAddButton />
        {/* Report Popover */}
        {selectedReport && (
          <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
            <PopoverTrigger asChild>
              <div
                className="absolute"
                style={{
                  left: map.current
                    ? map.current.project([
                        selectedReport.location_lng,
                        selectedReport.location_lat,
                      ]).x
                    : 0,
                  top: map.current
                    ? map.current.project([
                        selectedReport.location_lng,
                        selectedReport.location_lat,
                      ]).y - 40
                    : 0,
                  pointerEvents: "none",
                }}
              />
            </PopoverTrigger>
            <PopoverContent>
              <div className="flex flex-col gap-2">
                <div className="text-2xl">
                  {getReportIcon(
                    selectedReport.incident_type_id,
                    selectedReport.incident_subtype_id
                  )}
                </div>
                <TypographyH3 size="text-sm">
                  {getTranslatedType(selectedReport.incident_type_id)}
                  {selectedReport.incident_subtype_id && (
                    <>
                      ,{" "}
                      {getTranslatedSubtype(
                        selectedReport.incident_type_id,
                        selectedReport.incident_subtype_id
                      )}
                    </>
                  )}
                </TypographyH3>

                {selectedReport.description && (
                  <TypographyParagraph size="text-xs">
                    {selectedReport.description}
                  </TypographyParagraph>
                )}
                <TypographyParagraph
                  size="text-xs"
                  className="text-muted-foreground"
                >
                  {selectedReport.location_address || "No address available"}
                </TypographyParagraph>
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>
    </>
  );
};

export default OverviewMap;
