/**
 * Google Maps deep links.
 *
 * `prd_2.txt §4.7` asks for a "Petunjuk Arah" action on UMKM/facility
 * locations. Both links go to Google Maps: universal on Android/iOS/desktop and
 * no API key required.
 */

/**
 * Format URL Google Maps mentah: memastikan awalan https://.
 * Mengembalikan null jika input kosong / hanya whitespace.
 */
export function formatRawMapsUrl(url?: string | null): string | null {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  if (trimmed.length === 0) return null;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  return `https://${trimmed.replace(/^\/+/, "")}`;
}

export function buildDirectionsUrl(
  latitude?: number | null,
  longitude?: number | null,
  googleMapsUrl?: string | null,
): string | null {
  const formatted = formatRawMapsUrl(googleMapsUrl);
  if (formatted) return formatted;

  if (
    latitude !== null &&
    latitude !== undefined &&
    longitude !== null &&
    longitude !== undefined &&
    !isNaN(Number(latitude)) &&
    !isNaN(Number(longitude))
  ) {
    return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
  }

  return null;
}

export function buildMapPlaceUrl(latitude: number, longitude: number): string {
  return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
}
