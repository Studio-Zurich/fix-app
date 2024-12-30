"use client";

import { useReportStore } from "@/lib/store";
import { MapPin } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useRef } from "react";
import type { MapRef } from "react-map-gl";
import Map, { Marker } from "react-map-gl";

const StepContainer = () => {
  const location = useReportStore((state) => state.location);
  const mapRef = useRef<MapRef>(null);

  useEffect(() => {
    if (location && mapRef.current) {
      mapRef.current.flyTo({
        center: [location.lng, location.lat],
        zoom: 15,
        duration: 2000,
      });
    }
  }, [location]);

  if (!location) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="h-[100svh]"
    >
      <Map
        ref={mapRef}
        initialViewState={{
          latitude: location.lat,
          longitude: location.lng,
          zoom: 15,
        }}
        style={{
          width: "100%",
          height: "100%",
        }}
        mapStyle="mapbox://styles/mapbox/streets-v11"
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
      >
        <Marker
          latitude={location.lat}
          longitude={location.lng}
          anchor="bottom"
        >
          <MapPin
            className="w-8 h-8 text-primary -translate-y-2"
            weight="fill"
          />
        </Marker>
      </Map>
    </motion.div>
  );
};

export default StepContainer;
