export type NewsStatus = "PUBLISHED" | "PENDING" | "REJECTED" | "DRAFT";
export type UmkmStatus = "APPROVED" | "PENDING" | "REJECTED" | "DRAFT";

export interface PendingSubmissionsResponse {
  pendingNews: PendingNewsSubmission[];
  pendingUmkm: PendingUmkmSubmission[];
  totalPending: number;
}

export interface PendingNewsSubmission {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  categoryName: string;
  submittedAt: string;
  coverUrl?: string;
  authorName?: string;
  contentBlocks?: Array<{
    subHeading?: string;
    content: string;
    imageUrl?: string;
  }>;
}

export interface PendingUmkmSubmission {
  id: string;
  name: string;
  slug: string;
  ownerName: string;
  categoryName: string;
  description: string;
  phone: string;
  email?: string;
  address: string;
  latitude?: number;
  longitude?: number;
  mapsUrl?: string;
  since?: number;
  openDay?: string;
  startTime?: string;
  endTime?: string;
  submittedAt: string;
  coverUrl?: string;
  galleries?: string[];
  products?: Array<{
    name: string;
    price: number;
    description?: string;
    imageUrl?: string;
  }>;
}

export interface AdminNewsItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  categoryName: string;
  status: NewsStatus;
  rejectionReason?: string | null;
  publishedAt: string;
  coverUrl?: string;
}

export interface AdminUmkmItem {
  id: string;
  name: string;
  slug: string;
  ownerName: string;
  umkmCategoryId?: string;
  categoryName: string;
  categorySlug?: string;
  status: UmkmStatus;
  rejectionReason?: string | null;
  phone: string;
  address: string;
  coverUrl?: string;
  mapsUrl?: string;
  addressUrl?: string;
  description?: string;
  since?: number;
  openDay?: string;
  startTime?: string;
  endTime?: string;
  latitude?: number;
  longitude?: number;
  galleries?: Array<{ id?: string; imageUrl: string; caption?: string } | string>;
  products?: Array<{
    id?: string;
    name: string;
    price: number;
    description?: string;
    imageUrl?: string;
  }>;
}

export interface AdminMapLocation {
  id: string;
  name: string;
  slug?: string;
  categoryId: string;
  categoryName: string;
  shortDescription?: string;
  address?: string;
  latitude: number;
  longitude: number;
  googleMapsUrl?: string;
  mapsUrl?: string;
  imageUrl?: string;
}

export interface AdminMapCategory {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
  count?: number;
}

export interface AdminCategoryItem {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  newsCount?: number;
  umkmCount?: number;
  count?: number;
}

export interface AdminSettingsPayload {
  website_name: string;
  logo_url: string;
  favicon_url: string;
  contact_email: string;
  contact_phone: string;
  address: string;
  social_facebook?: string;
  social_instagram?: string;
  social_youtube?: string;
  social_tiktok?: string;
  jumlah_dusun?: number;
}
