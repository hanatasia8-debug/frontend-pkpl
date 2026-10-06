export interface ProductOwnerUmkmDto {
  id: string;
  name: string;
  slug: string;
  address?: string;
  phone?: string;
  coverUrl?: string | null;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface ProductItemDto {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  umkmId: string;
  umkm?: ProductOwnerUmkmDto;
  whatsappLink?: string;
}

export interface ProductListResponse {
  items: ProductItemDto[];
  total: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

export interface ProductDetailDto extends ProductItemDto {
  umkm: ProductOwnerUmkmDto;
  otherProducts?: ProductItemDto[];
  relatedNews?: {
    id: string;
    title: string;
    slug: string;
    coverUrl?: string;
    categoryName?: string;
    publishedAt: string;
  }[];
}
