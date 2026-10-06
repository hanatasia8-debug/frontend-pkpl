/**
 * Map/Facility DTO types — synchronized with backend `web-desa`
 * MapCategory (prisma/schema.prisma L104-114) and
 * MapLocation (prisma/schema.prisma L116-130).
 */

/** Matches backend `MapCategory` with nested `_count`. */
export interface MapCategoryDto {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  color: string | null;
}

/** Matches backend `MapLocation` + nested `category` relation. */
export interface MapLocationDto {
  id: string;
  mapCategoryId: string;
  name: string;
  shortDescription: string | null;
  imageUrl: string | null;
  photoUrl?: string | null;
  address: string | null;
  phone?: string | null;
  latitude: number;
  longitude: number;
  googleMapsUrl?: string | null;
  mapsUrl?: string | null;
  slug?: string | null;
  umkmSlug?: string | null;
  category: MapCategoryDto;
}

export interface MapLocationListResponse {
  items: MapLocationDto[];
}

export interface MapCategoryListResponse {
  items: MapCategoryDto[];
}

// Backward-compat aliases (existing code may reference these)
export type FacilityDto = MapLocationDto;
export type FacilityListResponse = MapLocationListResponse;
