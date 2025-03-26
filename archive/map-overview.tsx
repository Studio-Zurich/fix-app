// "use client";

// import { createClient } from "@/lib/supabase/client";
// import { MapPin } from "@phosphor-icons/react";
// import "mapbox-gl/dist/mapbox-gl.css";
// import { useEffect, useState } from "react";
// import Map, { Marker } from "react-map-gl";

// const ZUG_CENTER = {
//   latitude: 47.1661,
//   longitude: 8.5159,
//   zoom: 13,
// } as const;

// interface ReportLocation {
//   id: string;
//   location_lat: number;
//   location_lng: number;
//   incident_type: {
//     name: string;
//   } | null;
//   status: string;
//   created_at: string;
// }

// const MapOverview = () => {
//   const [reports, setReports] = useState<ReportLocation[]>([]);

//   useEffect(() => {
//     const fetchReports = async () => {
//       const supabase = createClient();
//       const { data, error } = await supabase
//         .from("reports")
//         .select(
//           `
//           id,
//           location_lat,
//           location_lng,
//           status,
//           created_at,
//           incident_type:incident_type_id (
//             name
//           )
//         `
//         )
//         .not("location_lat", "is", null)
//         .not("location_lng", "is", null)
//         .order("created_at", { ascending: false });

//       if (error) {
//         console.error("Error fetching reports:", error);
//         return;
//       }

//       setReports(
//         data.map((report) => ({
//           ...report,
//           incident_type: report.incident_type?.[0] || null,
//         })) as ReportLocation[]
//       );
//     };

//     fetchReports();
//   }, []);

//   return (
//     <Map
//       initialViewState={ZUG_CENTER}
//       style={{
//         width: "100%",
//         height: "calc(100svh - 240px)",
//         borderRadius: "0.75rem",
//         overflow: "hidden",
//       }}
//       mapStyle="mapbox://styles/mapbox/streets-v11"
//       mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
//       interactive={false}
//     >
//       {reports.map((report) => (
//         <Marker
//           key={report.id}
//           latitude={report.location_lat}
//           longitude={report.location_lng}
//           anchor="bottom"
//         >
//           <MapPin className="w-5 h-5 text-primary" weight="fill" />
//         </Marker>
//       ))}
//     </Map>
//   );
// };

// export default MapOverview;
