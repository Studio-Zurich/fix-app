"use client";

import { useReportStore } from "@/lib/store";
import { Camera, MagnifyingGlass, MapPin } from "@phosphor-icons/react";
import { Input } from "@repo/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@repo/ui/sheet";
import "mapbox-gl/dist/mapbox-gl.css";
import { useCallback, useEffect, useRef, useState } from "react";
import type { MapRef } from "react-map-gl";
import Map, { Marker } from "react-map-gl";

interface Suggestion {
  id: string;
  place_name: string;
  center: [number, number];
}

const ZUG_CENTER = {
  latitude: 47.1661,
  longitude: 8.5159,
  zoom: 13,
  address: "Postplatz, 6300 Zug, Switzerland",
} as const;

export default function LocationStep() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const mapRef = useRef<MapRef>(null);

  const location = useReportStore((state) => state.location);
  const setLocation = useReportStore((state) => state.setLocation);
  const imageMetadata = useReportStore((state) => state.imageMetadata);

  useEffect(() => {
    const initializeLocation = async () => {
      if (imageMetadata?.coordinates) {
        try {
          const response = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${imageMetadata.coordinates.lng},${imageMetadata.coordinates.lat}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}`
          );
          const data = await response.json();
          const address = data.features[0]?.place_name || "Unknown location";

          setLocation({
            lat: imageMetadata.coordinates.lat,
            lng: imageMetadata.coordinates.lng,
            address,
          });

          mapRef.current?.flyTo({
            center: [
              imageMetadata.coordinates.lng,
              imageMetadata.coordinates.lat,
            ],
            zoom: 15,
            duration: 2000,
          });
        } catch (error) {
          console.error("Error fetching address:", error);
          setDefaultLocation();
        }
      } else if (!location) {
        setDefaultLocation();
      }
    };

    const setDefaultLocation = () => {
      setLocation({
        lat: ZUG_CENTER.latitude,
        lng: ZUG_CENTER.longitude,
        address: ZUG_CENTER.address,
      });
    };

    initializeLocation();
  }, [imageMetadata?.coordinates, setLocation]);

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
        )}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}&country=CH`
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
      setIsOpen(false);

      // Fly to the selected location
      mapRef.current?.flyTo({
        center: [lng, lat],
        zoom: 15,
        duration: 2000,
      });
    },
    [setLocation]
  );

  const handleMarkerDrag = useCallback(
    async (event: { lngLat: { lng: number; lat: number } }) => {
      const { lng, lat } = event.lngLat;

      try {
        // Reverse geocoding to get address
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
      } catch (error) {
        console.error("Error fetching address:", error);
      }
    },
    [setLocation]
  );

  return (
    <div className="relative">
      <div className="absolute top-6 bg-white shadow-md left-0 w-[calc(100%-32px)] ml-[16px] z-10 rounded-full">
        <Sheet>
          <SheetTrigger>
            <MagnifyingGlass className="w-4 h-4 text-muted-foreground" />
          </SheetTrigger>
          <SheetContent side="bottom">
            <SheetHeader>
              <SheetTitle>Sheet</SheetTitle>
            </SheetHeader>
            <Input
              placeholder="Search for a location"
              value={searchValue}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </SheetContent>
        </Sheet>
      </div>

      <Map
        ref={mapRef}
        initialViewState={
          location
            ? {
                latitude: location.lat,
                longitude: location.lng,
                zoom: 15,
              }
            : ZUG_CENTER
        }
        style={{
          width: "100%",
          height: "calc(100svh - 224px)",
        }}
        mapStyle="mapbox://styles/mapbox/streets-v11"
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
        reuseMaps
      >
        <Marker
          latitude={location?.lat || ZUG_CENTER.latitude}
          longitude={location?.lng || ZUG_CENTER.longitude}
          anchor="bottom"
          draggable
          onDragEnd={handleMarkerDrag}
        >
          <MapPin
            className="w-8 h-8 text-primary -translate-y-2 cursor-grab active:cursor-grabbing"
            weight="fill"
          />
        </Marker>
      </Map>

      <div className="absolute bottom-12 p-4 bg-white shadow-md rounded-lg space-y-2 left-0 w-[calc(100%-32px)] ml-[16px]">
        <div className="flex items-center space-x-2">
          <MapPin className="w-4 h-4 text-primary" weight="fill" />
          <p className="text-sm font-medium">Current Location</p>
          {imageMetadata?.coordinates && (
            <div className="flex items-center ml-auto">
              <Camera className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground ml-1">
                From image
              </span>
            </div>
          )}
        </div>
        <div className="pl-6">
          <p className="text-sm text-muted-foreground whitespace-pre-line">
            {location?.address || ZUG_CENTER.address}
          </p>
        </div>
      </div>
    </div>
  );
}
