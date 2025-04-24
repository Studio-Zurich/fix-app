import { MapPin } from "@phosphor-icons/react";
import React from "react";

interface MapMarkerProps {
  children?: React.ReactNode;
  color?: string;
}

const MapMarker: React.FC<MapMarkerProps> = ({
  children,
  color = "#FF8C00",
}) => {
  return (
    <div style={{ position: "relative", width: "40px", height: "40px" }}>
      <div
        style={{
          position: "absolute",
          top: -4,
          left: 0,
          width: "100%",
          height: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {children}
      </div>
      <MapPin size={40} color={color} weight="fill" />
    </div>
  );
};

export default MapMarker;
