import axios from "axios";

import { apiClient } from "@/shared/api/axios-instance";
import type { ApiSuccessBody } from "@/shared/api/response";
import type {
  UmkmCategoryListResponse,
  UmkmDetailDto,
  UmkmListResponse,
} from "../model/types";
import type { RegisterUmkmDTO } from "../model/register-umkm.schema";

export interface GetLatestUmkmParams {
  limit?: number;
}

export interface GetPaginatedUmkmParams {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  exclude?: string;
}

export interface GetSimilarUmkmParams {
  category: string;
  excludeId: string;
  limit?: number;
}

export const UmkmService = {
  async getLatestPublished({
    limit = 3,
  }: GetLatestUmkmParams = {}): Promise<UmkmListResponse> {
    try {
      const { data } = await apiClient.get<ApiSuccessBody<UmkmListResponse>>(
        "/public/umkm",
        { params: { limit, sort: "publishedAt_desc" } },
      );
      if (data?.data) return data.data;
    } catch (err) {
      console.error("Gagal memuat UMKM terbaru dari API:", err);
    }
    return { items: [], total: 0 };
  },

  async getPaginated({
    page = 1,
    limit = 8,
    category,
    search,
    exclude,
  }: GetPaginatedUmkmParams = {}): Promise<UmkmListResponse> {
    try {
      const { data } = await apiClient.get<ApiSuccessBody<UmkmListResponse>>(
        "/public/umkm",
        {
          params: {
            page,
            limit,
            category,
            search,
            exclude,
            sort: "publishedAt_desc",
          },
        },
      );
      if (data?.data) return data.data;
    } catch (err) {
      console.error("Gagal memuat daftar UMKM dari API:", err);
    }
    return { items: [], total: 0 };
  },

  async getBySlug(slug: string): Promise<UmkmDetailDto | null> {
    try {
      const { data } = await apiClient.get<ApiSuccessBody<UmkmDetailDto>>(
        `/public/umkm/${slug}`,
      );
      if (data?.data) return data.data;
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        return null;
      }
      console.error(`Gagal memuat detail UMKM '${slug}' dari API:`, err);
    }
    return null;
  },

  async getSimilar({
    category,
    excludeId,
    limit = 3,
  }: GetSimilarUmkmParams): Promise<UmkmListResponse> {
    return this.getPaginated({ page: 1, limit, category, exclude: excludeId });
  },

  async getCategories({
    all = false,
  }: { all?: boolean } = {}): Promise<UmkmCategoryListResponse> {
    try {
      const { data } = await apiClient.get<
        ApiSuccessBody<UmkmCategoryListResponse>
      >("/public/umkm/categories", {
        params: all ? { all: "true" } : undefined,
      });
      if (data?.data) return data.data;
    } catch (err) {
      console.error("Gagal memuat kategori UMKM dari API:", err);
    }
    return { items: [] };
  },

  async register(
    payload: Partial<RegisterUmkmDTO>,
  ): Promise<{ id: string; slug: string; name: string }> {
    const { data } = await apiClient.post<
      ApiSuccessBody<{ id: string; slug: string; name: string }>
    >("/public/umkm/register", payload);
    return data.data;
  },
};
