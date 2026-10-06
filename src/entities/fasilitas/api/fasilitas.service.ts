import { apiClient } from "@/shared/api/axios-instance";
import type { ApiSuccessBody } from "@/shared/api/response";
import type {
  MapCategoryListResponse,
  MapCategoryDto,
  MapLocationDto,
  MapLocationListResponse,
} from "../model/types";

export interface GetFacilitiesParams {
  categorySlug?: string;
  category?: string;
  search?: string;
  limit?: number;
}

export const FasilitasService = {
  async getFacilities({
    categorySlug,
    category,
    search,
    limit,
  }: GetFacilitiesParams = {}): Promise<MapLocationListResponse> {
    const slugFilter = categorySlug || category;

    try {
      const { data } = await apiClient.get<any>(
        "/public/maps",
        {
          params: {
            categorySlug: slugFilter,
            q: search,
          },
        },
      );

      let raw = data?.data;
      let items: MapLocationDto[] = Array.isArray(raw) ? raw : (raw?.items || []);
      if (limit) {
        items = items.slice(0, limit);
      }
      return { items };
    } catch (err) {
      console.error("Gagal memuat titik peta dari API:", err);
    }
    return { items: [] };
  },

  async getCategories(): Promise<MapCategoryListResponse> {
    try {
      const { data } = await apiClient.get<ApiSuccessBody<MapCategoryDto[]>>(
        "/public/maps/categories",
      );
      return { items: data?.data || [] };
    } catch (err) {
      console.error("Gagal memuat kategori peta dari API:", err);
    }
    return { items: [] };
  },
};
