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
    // Check if the search includes a street number and ZIP code
    const hasStreetNumber = /\s\d+/.test(searchValue);
    const zipMatch = searchValue.match(/\b(\d{4})\b/);
    const hasZipCode = !!zipMatch;
    const zip = zipMatch?.[1];

    // Base parameters
    const params = new URLSearchParams({
      access_token: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "",
      country: "CH",
      types: "address",
      language: "de",
      limit: "10", // Increased limit to ensure we get all matches before filtering
    });

    // If we have a ZIP code, make the search very strict
    if (hasZipCode && zip) {
      params.append("fuzzyMatch", "false");
      params.append("autocomplete", "false");
      params.append("routing", "true");
      // Add proximity bias to the ZIP code area (rough center of Switzerland)
      params.append("proximity", "8.5,47.2");
    } else if (hasStreetNumber) {
      params.append("fuzzyMatch", "false");
      params.append("routing", "true");
      params.append("autocomplete", "true");
    } else {
      params.append("fuzzyMatch", "true");
      params.append("autocomplete", "true");
    }

    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        searchValue
      )}.json?${params.toString()}`
    );

    const data = await response.json();
    const validatedData = mapboxResponseSchema.parse(data);
    let results = validatedData.features.map((feature) => ({
      id: feature.id,
      place_name: feature.place_name,
      center: feature.center,
    }));

    // If we have a ZIP code, filter results to only show matches with that ZIP
    if (zip) {
      results = results.filter((result) => result.place_name.includes(zip));
    }

    return results.slice(0, 5); // Return only top 5 results
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
