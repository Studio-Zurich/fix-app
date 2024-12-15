"use client";

import { useReportStore } from "@/lib/store";
import { MagnifyingGlass, MapPin } from "@phosphor-icons/react";
import { Button } from "@repo/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@repo/ui/drawer";
import { Input } from "@repo/ui/input";
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

  useEffect(() => {
    if (!location) {
      setLocation({
        lat: ZUG_CENTER.latitude,
        lng: ZUG_CENTER.longitude,
        address: ZUG_CENTER.address,
      });
    }
  }, [location, setLocation]);

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
    <div className="space-y-4">
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start text-muted-foreground h-10 px-3"
          >
            <MagnifyingGlass className="w-4 h-4 mr-2" />
            {location?.address || "Search address..."}
          </Button>
        </DrawerTrigger>
        <DrawerContent className="h-[90%]">
          <DrawerHeader>
            <DrawerTitle>Search address</DrawerTitle>
            <DrawerDescription>
              Search for an address or drag the marker on the map
            </DrawerDescription>
          </DrawerHeader>

          <div className="p-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search address..."
                value={searchValue}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full"
                autoFocus
              />

              {suggestions.length > 0 && (
                <div className="mt-2 space-y-1">
                  {suggestions.map((suggestion) => (
                    <Button
                      key={suggestion.id}
                      variant="ghost"
                      className="w-full justify-start text-left"
                      onClick={() => handleLocationSelect(suggestion)}
                    >
                      {suggestion.place_name}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline" className="w-full">
                Close
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

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
          height: "400px",
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

      <div className="p-4 bg-muted rounded-lg space-y-2">
        <div className="flex items-center space-x-2">
          <MapPin className="w-4 h-4 text-primary" weight="fill" />
          <p className="text-sm font-medium">Current Location</p>
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
