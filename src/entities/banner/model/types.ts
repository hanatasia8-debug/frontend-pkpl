export interface BannerDto {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl: string | null;
  order: number;
}

export interface BannerListResponse {
  items: BannerDto[];
}
