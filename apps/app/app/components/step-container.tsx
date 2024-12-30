"use client";

import { useReportStore } from "@/lib/store";
import { MapPin } from "@phosphor-icons/react";
import { Button } from "@repo/ui/button";
import { Vaul } from "@repo/ui/drawer";
import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useRef, useState } from "react";
import type { MapRef } from "react-map-gl";
import Map, { Marker } from "react-map-gl";

const ZUG_CENTER = {
  latitude: 47.1661,
  longitude: 8.5159,
  zoom: 13,
} as const;

export default function StepContainer() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);
  const mapRef = useRef<MapRef>(null);

  const location = useReportStore((state) => state.location);
  const setLocation = useReportStore((state) => state.setLocation);

  useEffect(() => {
    if (!location) {
      setLocation({
        lat: ZUG_CENTER.latitude,
        lng: ZUG_CENTER.longitude,
        address: "Postplatz, 6300 Zug, Switzerland",
      });
    }
  }, [location, setLocation]);

  const handleStartReport = () => {
    setHasStarted(true);
  };

  return (
    <div className="flex flex-col h-svh">
      <Map
        ref={mapRef}
        initialViewState={ZUG_CENTER}
        style={{
          width: "100%",
          height: "100svh",
        }}
        mapStyle="mapbox://styles/mapbox/streets-v11"
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
      >
        <Marker
          latitude={location?.lat || ZUG_CENTER.latitude}
          longitude={location?.lng || ZUG_CENTER.longitude}
          anchor="bottom"
        >
          <MapPin
            className="w-8 h-8 text-primary -translate-y-2"
            weight="fill"
          />
        </Marker>
      </Map>

      <Vaul.Root
        defaultOpen={true}
        snapPoints={[0.4, 0.8]}
        activeSnapPoint={0}
        shouldScaleBackground
        modal={false}
      >
        <Vaul.Portal>
          <Vaul.Overlay className="fixed inset-0 bg-black/40 z-50 transition-opacity duration-300" />
          <Vaul.Content
            className="bg-gray-100 flex flex-col rounded-t-[10px] fixed bottom-0 left-0 right-0 z-50 max-h-[96vh] overflow-auto"
            style={{
              transition: "transform 0.5s cubic-bezier(0.32, 0.72, 0, 1)",
            }}
          >
            <div className="p-4 bg-white rounded-t-[10px] flex-1">
              <Vaul.Handle className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-gray-300 mb-8" />
              <div className="max-w-md mx-auto">
                {!hasStarted ? (
                  <>
                    <Vaul.Title className="font-medium text-xl mb-4">
                      Report an Incident
                    </Vaul.Title>
                    <p className="text-muted-foreground mb-6">
                      Help us improve our community by reporting issues in your
                      area. Your report will be sent directly to the responsible
                      authorities.
                    </p>
                    <Button className="w-full" onClick={handleStartReport}>
                      Start Report
                    </Button>
                  </>
                ) : (
                  // First step will go here
                  <div>First step content</div>
                )}
              </div>
            </div>
          </Vaul.Content>
        </Vaul.Portal>
      </Vaul.Root>
    </div>
  );
}
