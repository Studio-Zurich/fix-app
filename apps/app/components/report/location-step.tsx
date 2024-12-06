"use client";

import { useReportStore } from "@/lib/store";
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
  const { updateReportData } = useReportStore();
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const [currentLocation, setCurrentLocation] = useState(ZUG_COORDINATES);
  const [address, setAddress] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const fetchAddress = async (lng: number, lat: number) => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxgl.accessToken}`
      );
      const data = await response.json();
      const newAddress = data.features[0]?.place_name || "Address not found";
      setAddress(newAddress);
      updateReportData({
        location: { lng, lat, address: newAddress },
      });
    } catch (error) {
      setAddress("Failed to fetch address");
    } finally {
      setIsLoading(false);
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

    // Initial address fetch
    fetchAddress(ZUG_COORDINATES.lng, ZUG_COORDINATES.lat);

    // Update store when marker is dragged
    marker.on("dragend", () => {
      const { lng, lat } = marker.getLngLat();
      setCurrentLocation({ lng, lat });
      fetchAddress(lng, lat);
    });

    // Cleanup
    return () => {
      map.remove();
    };
  }, [updateReportData]);

  return (
    <>
      <div ref={mapContainerRef} className="w-full flex-1 h-full" />

      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-medium text-gray-700 mb-2">
          Ausgewählter Standort:
        </h3>
        {isLoading ? (
          <div className="text-sm text-gray-500">Lade Adresse...</div>
        ) : (
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-800">{address}</div>
            <div className="text-xs text-gray-600">
              Latitude: {currentLocation.lat.toFixed(6)}
              <br />
              Longitude: {currentLocation.lng.toFixed(6)}
            </div>
          </div>
        )}
      </div>
    </>
  );
};
