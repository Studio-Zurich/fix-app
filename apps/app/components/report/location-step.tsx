"use client";

import { useReportStore } from "@/lib/store";
import { MagnifyingGlass } from "@phosphor-icons/react";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useRef, useState } from "react";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "";

// Zug, Switzerland coordinates
const ZUG_COORDINATES = {
  lng: 8.516734,
  lat: 47.172428,
};

export const LocationStep = () => {
  const { reportData, updateReportData } = useReportStore();
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Initialize with Zug's location
  useEffect(() => {
    if (!reportData.location) {
      setIsLoading(true);
      fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${ZUG_COORDINATES.lng},${ZUG_COORDINATES.lat}.json?access_token=${mapboxgl.accessToken}`
      )
        .then((response) => response.json())
        .then((data) => {
          const address = data.features[0]?.place_name || "Zug, Switzerland";
          updateReportData({
            location: {
              lng: ZUG_COORDINATES.lng,
              lat: ZUG_COORDINATES.lat,
              address,
            },
          });
        })
        .catch((error) => {
          console.error("Error fetching initial address:", error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [reportData.location, updateReportData]);

  const searchAddress = async (query: string) => {
    if (!query.trim()) return;

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          query
        )}.json?country=ch&access_token=${mapboxgl.accessToken}`
      );
      const data = await response.json();
      if (data.features?.[0]) {
        const [lng, lat] = data.features[0].center;
        const address = data.features[0].place_name;

        if (mapRef.current && markerRef.current) {
          mapRef.current.flyTo({
            center: [lng, lat],
            zoom: 16,
          });
          markerRef.current.setLngLat([lng, lat]);
        }

        updateReportData({
          location: { lng, lat, address },
        });
      }
    } catch (error) {
      console.error("Search error:", error);
    }
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize map
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [ZUG_COORDINATES.lng, ZUG_COORDINATES.lat],
      zoom: 12,
    });
    mapRef.current = map;

    // Add marker
    const marker = new mapboxgl.Marker({ draggable: true })
      .setLngLat([ZUG_COORDINATES.lng, ZUG_COORDINATES.lat])
      .addTo(map);
    markerRef.current = marker;

    // Update store when marker is dragged
    marker.on("dragend", async () => {
      const { lng, lat } = marker.getLngLat();
      setIsLoading(true);
      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxgl.accessToken}`
        );
        const data = await response.json();
        const address = data.features[0]?.place_name || "Address not found";

        updateReportData({
          location: { lng, lat, address },
        });
      } catch (error) {
        console.error("Error fetching address:", error);
      } finally {
        setIsLoading(false);
      }
    });

    // Cleanup
    return () => {
      map.remove();
    };
  }, [updateReportData]);

  return (
    <>
      <div className="flex-1 flex flex-col relative">
        <div className="absolute top-4 left-4 right-4 z-10">
          <div className="relative flex items-center">
            <Input
              type="text"
              placeholder="Adresse suchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  searchAddress(searchQuery);
                }
              }}
              className="w-full bg-white shadow-md pr-12"
            />
            <Button
              size="icon"
              variant="ghost"
              onClick={() => searchAddress(searchQuery)}
              className="absolute right-1 top-1/2 -translate-y-1/2"
              aria-label="Suchen"
            >
              <MagnifyingGlass className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div ref={mapContainerRef} className="w-full flex-1" />
      </div>

      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-base font-medium text-gray-700 mb-2">
          Ausgewählter Standort:
        </h3>
        {isLoading ? (
          <div className="text-base text-gray-500">Lade Adresse...</div>
        ) : (
          <div className="text-base text-gray-800">
            {reportData.location?.address || "Noch kein Standort ausgewählt"}
          </div>
        )}
      </div>
    </>
  );
};
