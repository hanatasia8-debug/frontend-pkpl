export interface UmkmProductDto {
  id: string;
  name?: string;
  productName?: string;
  price: number | null;
  imageUrl?: string | null;
  productPhoto?: string | null;
  description?: string | null;
}

export interface UmkmPotentialSummaryDto {
  id: string;
  name?: string;
  title?: string;
  slug: string;
  category?: string;
}

export interface UmkmListItemDto {
  id: string;
  name: string;
  slug: string;
  category: string;
  categorySlug?: string;
  description: string;
  logo: string;
  coverUrl?: string | null;
  phone?: string;
  whatsappNumber: string;
  address: string;
  mapsUrl?: string | null;
  ownerName: string;
  latitude?: number | null;
  longitude?: number | null;
  openDay?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  since?: number | null;
  publishedAt: string; // ISO string over the wire
}

export interface UmkmListResponse {
  items: UmkmListItemDto[];
  total: number;
}

export interface UmkmDetailDto extends UmkmListItemDto {
  latitude: number | null;
  longitude: number | null;
  gallery: string[];
  galleries?: string[];
  products: UmkmProductDto[];
  potential: UmkmPotentialSummaryDto | null;
}

export interface UmkmCategoryDto {
  id?: string;
  value: string;
  slug: string;
  label: string;
  name?: string;
  umkmCount: number;
}

export interface UmkmCategoryListResponse {
  items: UmkmCategoryDto[];
}

