/** One row of `VillagePotential`, list-item shape. */
export interface PotensiListItemDto {
  id: string;
  title: string;
  slug: string;
  category: string;
  overview: string;
  coverImage: string;
}

export interface PotensiListResponse {
  items: PotensiListItemDto[];
  total: number;
}

/** A related UMKM on the potensi detail page ("UMKM Terkait"). */
export interface PotensiRelatedUmkmDto {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  logo: string;
  whatsappNumber: string;
  address: string;
  ownerName: string;
  publishedAt: string;
}

/**
 * A representative product from a related UMKM ("Produk Unggulan"). The
 * schema has no direct `VillagePotential` ↔ `UmkmProduct` relation — these
 * are aggregated from the products of UMKM linked to this potensi
 * (`Umkm.potentialId`), same reasoning as `PotensiRelatedUmkmDto`.
 */
export interface PotensiFeaturedProductDto {
  id: string;
  productName: string;
  price: number | null;
  productPhoto: string | null;
  /** Which UMKM this product belongs to, for the tile's byline. */
  umkmName: string;
  umkmSlug: string;
}

/**
 * A related news item ("Berita Terkait"). Unlike UMKM (`potentialId` FK),
 * the schema has **no** relation between `News` and `VillagePotential` at
 * all — this is populated by a best-effort keyword search (potensi title
 * against news title/summary via the existing `BeritaService.getPaginated`
 * search), not a real foreign key. Documented here so the heuristic isn't
 * mistaken for a guaranteed relation — see `potensi.service.ts`.
 */
export interface PotensiRelatedNewsDto {
  id: string;
  title: string;
  slug: string;
  coverImage: string;
  categoryName: string;
  publishedAt: string;
}

export interface PotensiDetailDto {
  id: string;
  title: string;
  slug: string;
  category: string;
  overview: string;
  description: string;
  coverImage: string;
  gallery: string[];
  latitude: number;
  longitude: number;
  relatedUmkm: PotensiRelatedUmkmDto[];
  featuredProducts: PotensiFeaturedProductDto[];
  relatedNews: PotensiRelatedNewsDto[];
}
