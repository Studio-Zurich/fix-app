// "use client";

// import { ReportLocation } from "@/lib/types";
// import { MapPin } from "@phosphor-icons/react";
// import "mapbox-gl/dist/mapbox-gl.css";
// import Map, { Marker } from "react-map-gl";

// interface SummaryMapPreviewProps {
//   location: ReportLocation;
// }

// const SummaryMapPreview = ({ location }: SummaryMapPreviewProps) => {
//   return (
//     <Map
//       initialViewState={{
//         latitude: location.lat,
//         longitude: location.lng,
//         zoom: 15,
//       }}
//       style={{
//         width: "100%",
//         height: "160px",
//         borderRadius: "0.5rem",
//         overflow: "hidden",
//       }}
//       mapStyle="mapbox://styles/mapbox/streets-v11"
//       mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
//       interactive={false}
//     >
//       <Marker latitude={location.lat} longitude={location.lng} anchor="bottom">
//         <MapPin className="w-6 h-6 text-primary" weight="fill" />
//       </Marker>
//     </Map>
//   );
// };

// export default SummaryMapPreview;
