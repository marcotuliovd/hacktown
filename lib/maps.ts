import type { MapVenue } from "@/data/map-venues";
import { findMapVenueByName } from "@/data/map-venues";
import type { HacktownVenue } from "@/types/event";

const CITY = "Santa Rita do Sapucaí";

/**
 * Deep link do Google Maps para o venue.
 * 1. `maps_url` da API, se preenchido
 * 2. lat/lng (API ou pin do mapa antigo)
 * 3. busca por nome + cidade
 */
export function buildMapsUrl(
  venue: HacktownVenue | null | undefined,
  mapVenue?: MapVenue | null,
): string | null {
  if (venue?.maps_url) {
    return venue.maps_url;
  }

  const lat = venue?.latitude ?? mapVenue?.lat ?? null;
  const lng = venue?.longitude ?? mapVenue?.lng ?? null;
  if (lat != null && lng != null) {
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  }

  const name = mapVenue?.nome ?? venue?.name ?? null;
  if (!name) return null;

  const query = encodeURIComponent(`${name}, ${CITY}`);
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

export function resolveMapsUrl(
  venue: HacktownVenue | null | undefined,
): string | null {
  const mapVenue = venue?.name ? findMapVenueByName(venue.name) : undefined;
  return buildMapsUrl(venue, mapVenue ?? null);
}
