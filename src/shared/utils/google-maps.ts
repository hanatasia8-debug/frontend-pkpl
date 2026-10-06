/**
 * Ekstrak koordinat latitude dan longitude dari tautan Google Maps (share link, search query, atau pin URL).
 *
 * @param url Tautan Google Maps
 * @returns Object berisi lat dan lng
 */
export function extractCoordinatesFromUrl(url: string): {
  lat: number;
  lng: number;
} {
  if (!url) return { lat: -8.2811, lng: 112.5664 };

  const match = url.match(
    /@(-?\d+\.\d+),(-?\d+\.\d+)|q=(-?\d+\.\d+),(-?\d+\.\d+)|ll=(-?\d+\.\d+),(-?\d+\.\d+)|(-?\d+\.\d+),\s*(-?\d+\.\d+)/,
  );

  if (match) {
    const latStr = match[1] || match[3] || match[5] || match[7];
    const lngStr = match[2] || match[4] || match[6] || match[8];
    if (latStr && lngStr) {
      return { lat: parseFloat(latStr), lng: parseFloat(lngStr) };
    }
  }

  // Fallback koordinat pusat Desa Pringgodani
  return { lat: -8.2811, lng: 112.5664 };
}
