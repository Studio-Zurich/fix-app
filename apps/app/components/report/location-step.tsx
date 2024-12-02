import { useReportStore } from "@/lib/store";
import mapboxgl from "mapbox-gl";
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
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const [error, setError] = useState<string>();
  const [address, setAddress] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<
    Array<{
      place_name: string;
      center: [number, number];
    }>
  >([]);

  const fetchAddress = async (lng: number, lat: number) => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxgl.accessToken}`
      );
      const data = await response.json();
      const newAddress = data.features[0]?.place_name || "Address not found";
      setAddress(newAddress);
      updateReportData({
        location: { lng, lat, address: newAddress },
      });
    } catch (err) {
      setError("Failed to fetch address");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!query) {
      setSearchResults([]);
      return;
    }

    // Set new timeout for debouncing
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
            query
          )}.json?access_token=${mapboxgl.accessToken}&country=CH`
        );
        const data = await response.json();
        setSearchResults(data.features || []);
      } catch (err) {
        setError("Failed to search address");
      }
    }, 300);
  };

  const handleSearchSelect = (result: {
    place_name: string;
    center: [number, number];
  }) => {
    const [lng, lat] = result.center;
    if (mapRef.current && markerRef.current) {
      mapRef.current.flyTo({ center: [lng, lat], zoom: 14 });
      markerRef.current.setLngLat([lng, lat]);
      fetchAddress(lng, lat);
    }
    setSearchResults([]);
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [ZUG_COORDINATES.lng, ZUG_COORDINATES.lat],
      zoom: 12,
    });
    mapRef.current = map;

    const marker = new mapboxgl.Marker({ draggable: true })
      .setLngLat([ZUG_COORDINATES.lng, ZUG_COORDINATES.lat])
      .addTo(map);
    markerRef.current = marker;

    // Initial address fetch for Zug
    fetchAddress(ZUG_COORDINATES.lng, ZUG_COORDINATES.lat);

    marker.on("dragend", () => {
      const { lng, lat } = marker.getLngLat();
      fetchAddress(lng, lat);
    });

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          map.setCenter([longitude, latitude]);
          map.setZoom(14);
          marker.setLngLat([longitude, latitude]);
          fetchAddress(longitude, latitude);
        },
        () => {
          setError(
            "Geolocation permission denied. Please select a location on the map."
          );
        }
      );
    } else {
      setError("Geolocation is not supported by your browser.");
    }

    return () => {
      map.remove();
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [updateReportData]);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Set Location</h2>
      <p className="text-gray-600">
        Search for an address or use the map to set the location of the
        incident.
      </p>

      <div className="relative">
        <input
          type="text"
          placeholder="Search for an address..."
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {searchResults.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg">
            {searchResults.map((result, index) => (
              <button
                key={index}
                className="w-full px-4 py-2 text-left hover:bg-gray-100 text-sm"
                onClick={() => handleSearchSelect(result)}
              >
                {result.place_name}
              </button>
            ))}
          </div>
        )}
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div ref={mapContainerRef} className="w-full h-64 border rounded-lg" />

      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-medium text-gray-700 mb-2">
          Selected Location:
        </h3>
        {loading ? (
          <div className="text-sm text-gray-500">Loading address...</div>
        ) : (
          <div className="text-sm">
            {address || "No location selected"}
            {reportData.location && (
              <div className="text-xs text-gray-500 mt-1">
                Coordinates: {reportData.location.lat.toFixed(6)},{" "}
                {reportData.location.lng.toFixed(6)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
