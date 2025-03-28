import { mapboxResponseSchema } from "../schemas";
import { ImageLocation, Suggestion } from "../types";

export const convertDMSToDD = (
  dms: [number, number, number],
  ref: number
): number => {
  const [degrees, minutes, seconds] = dms;
  return ref * (degrees + minutes / 60 + seconds / 3600);
};

export const fetchLocationSuggestions = async (
  searchValue: string
): Promise<Suggestion[]> => {
  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        searchValue
      )}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}&country=CH`
    );
    const data = await response.json();
    const validatedData = mapboxResponseSchema.parse(data);
    return validatedData.features.map((feature) => ({
      id: feature.id,
      place_name: feature.place_name,
      center: feature.center,
    }));
  } catch (error) {
    console.error("Error fetching suggestions:", error);
    return [];
  }
};

export const fetchAddressFromCoordinates = async (
  lng: number,
  lat: number
): Promise<string> => {
  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}`
    );
    const data = await response.json();
    const validatedData = mapboxResponseSchema.parse(data);
    return validatedData.features[0]?.place_name || "Unknown location";
  } catch (error) {
    console.error("Error fetching address:", error);
    return "Unknown location";
  }
};

export const createLocationFromSuggestion = (
  suggestion: Suggestion
): ImageLocation => {
  const [lng, lat] = suggestion.center;
  return {
    lat,
    lng,
    address: suggestion.place_name,
  };
};
