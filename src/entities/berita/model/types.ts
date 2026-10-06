export interface TaggedUmkmDto {
  id: string;
  name: string;
  slug: string;
  address?: string;
  coverUrl?: string;
  categoryName?: string;
}

export interface TaggedProductDto {
  id: string;
  name: string;
  price: number | null;
  imageUrl?: string;
  umkmName?: string;
  umkmSlug?: string;
}

export interface TaggedPotentialDto {
  id: string;
  name: string;
  slug: string;
  coverUrl?: string;
  summary?: string;
}

export interface NewsArticleBlockDto {
  id?: string;
  blockOrder?: number;
  sectionTitle?: string | null;
  paragraph?: string;
  sectionImage?: string | null;
  title?: string | null;
  body?: string;
  imageUrl?: string | null;
  imageCaption?: string | null;
}

export type NewsContentSectionDto = NewsArticleBlockDto;

export interface NewsGalleryImageDto {
  id?: string;
  imageOrder?: number;
  imageUrl: string;
  caption?: string | null;
}

export interface NewsListItemDto {
  id: string;
  title: string;
  slug: string;
  summary: string;
  excerpt?: string;
  coverImage: string;
  coverUrl?: string;
  categoryName: string;
  categorySlug: string;
  typeName?: string;
  typeSlug?: string;
  authorName: string | null;
  publishedAt: string; // ISO string over the wire
}

export interface NewsListResponse {
  items: NewsListItemDto[];
  total: number;
}

export interface NewsDetailDto {
  id: string;
  title: string;
  slug: string;
  summary: string;
  excerpt?: string;
  coverImage: string;
  coverUrl?: string;
  coverCaption?: string;
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  typeName?: string;
  typeSlug?: string;
  authorName: string | null;
  authorRole: string | null;
  contentSections: NewsArticleBlockDto[];
  galleryImages?: NewsGalleryImageDto[];
  taggedUmkms?: TaggedUmkmDto[];
  taggedProducts?: TaggedProductDto[];
  taggedPotentials?: TaggedPotentialDto[];
  publishedAt: string;
  readingTimeMinutes: number;
}

export interface NewsCategoryDto {
  id: string;
  name: string;
  slug: string;
  newsCount: number;
}

export interface NewsCategoryListResponse {
  items: NewsCategoryDto[];
}

