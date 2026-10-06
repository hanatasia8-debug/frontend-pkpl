import axios from "axios";

import { apiClient } from "@/shared/api/axios-instance";
import type { ApiSuccessBody } from "@/shared/api/response";
import type {
  NewsCategoryListResponse,
  NewsDetailDto,
  NewsListResponse,
} from "../model/types";
import type { RegisterNewsDTO } from "../model/register-news.schema";

export interface GetLatestNewsParams {
  limit?: number;
}

export interface GetPaginatedNewsParams {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  exclude?: string;
}

export interface GetRelatedNewsParams {
  categoryId: string;
  excludeId: string;
  limit?: number;
}

export const BeritaService = {
  async getLatestPublished({
    limit = 3,
  }: GetLatestNewsParams = {}): Promise<NewsListResponse> {
    try {
      const { data } = await apiClient.get<ApiSuccessBody<NewsListResponse>>(
        "/public/news",
        { params: { limit, sort: "publishedAt_desc" } },
      );
      if (data?.data) return data.data;
    } catch (err) {
      console.error("Gagal memuat berita terbaru dari API:", err);
    }
    return { items: [], total: 0 };
  },

  async getPaginated({
    page = 1,
    limit = 6,
    category,
    search,
    exclude,
  }: GetPaginatedNewsParams = {}): Promise<NewsListResponse> {
    try {
      const { data } = await apiClient.get<ApiSuccessBody<NewsListResponse>>(
        "/public/news",
        {
          params: {
            page,
            limit,
            ...(category ? { category } : {}),
            ...(search ? { search } : {}),
            ...(exclude ? { exclude } : {}),
          },
        },
      );
      if (data?.data) return data.data;
    } catch (err) {
      console.error("Gagal memuat daftar berita dari API:", err);
    }
    return { items: [], total: 0 };
  },

  async getBySlug(slug: string): Promise<NewsDetailDto | null> {
    try {
      const { data } = await apiClient.get<ApiSuccessBody<NewsDetailDto>>(
        `/public/news/${encodeURIComponent(slug)}`,
      );
      if (data?.data) return data.data;
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 404) return null;
      console.error(`Gagal memuat detail berita '${slug}' dari API:`, err);
    }
    return null;
  },

  async getRelated({
    categoryId,
    excludeId,
    limit = 3,
  }: GetRelatedNewsParams): Promise<NewsListResponse> {
    return this.getPaginated({
      category: categoryId,
      exclude: excludeId,
      limit,
    });
  },

  async getCategories({
    all = false,
  }: { all?: boolean } = {}): Promise<NewsCategoryListResponse> {
    try {
      const { data } = await apiClient.get<
        ApiSuccessBody<NewsCategoryListResponse>
      >("/public/news/categories", {
        params: all ? { all: "true" } : undefined,
      });
      if (data?.data) return data.data;
    } catch (err) {
      console.error("Gagal memuat kategori berita dari API:", err);
    }
    return { items: [] };
  },

  async submit(
    payload: Partial<RegisterNewsDTO>,
  ): Promise<{ id: string; slug: string; title: string }> {
    const { data } = await apiClient.post<
      ApiSuccessBody<{ id: string; slug: string; title: string }>
    >("/public/news/register", payload);
    return data.data;
  },
};
