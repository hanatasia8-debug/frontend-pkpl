import { apiClient } from "@/shared/api/axios-instance";
import type { ApiSuccessBody } from "@/shared/api/response";
import type {
  AdminNewsItem,
  NewsStatus,
  AdminCategoryItem,
} from "../model/admin.types";

export const AdminNewsService = {
  async getAllNews(): Promise<{ items: AdminNewsItem[]; total: number }> {
    try {
      const { data } =
        await apiClient.get<
          ApiSuccessBody<{ items: AdminNewsItem[]; total: number }>
        >("/admin/news");
      if (data?.data) return data.data;
    } catch (err) {
      console.error("Gagal memuat berita admin dari API:", err);
    }
    return { items: [], total: 0 };
  },

  async getNewsById(id: string): Promise<AdminNewsItem | null> {
    try {
      const { data } = await apiClient.get<ApiSuccessBody<AdminNewsItem>>(
        `/admin/news/${id}`,
      );
      if (data?.data) return data.data;
    } catch (err) {
      console.error(`Gagal memuat detail berita ${id} dari API:`, err);
    }
    return null;
  },

  async createNews(payload: Partial<AdminNewsItem>): Promise<AdminNewsItem> {
    const { data } = await apiClient.post<ApiSuccessBody<AdminNewsItem>>(
      "/admin/news",
      payload,
    );
    return data.data;
  },

  async updateNews(
    id: string,
    payload: Partial<AdminNewsItem>,
  ): Promise<{ success: boolean }> {
    try {
      await apiClient.put(`/admin/news/${id}`, payload);
      return { success: true };
    } catch (err) {
      console.error(`Gagal merubah berita ${id}:`, err);
      return { success: false };
    }
  },

  async updateNewsStatus(
    id: string,
    status: NewsStatus,
  ): Promise<{ success: boolean }> {
    try {
      await apiClient.patch(`/admin/news/${id}/status`, { status });
      return { success: true };
    } catch (err) {
      console.error(`Gagal merubah status berita ${id}:`, err);
      return { success: false };
    }
  },

  async deleteNews(id: string): Promise<{ success: boolean }> {
    try {
      await apiClient.delete(`/admin/news/${id}`);
      return { success: true };
    } catch (err) {
      console.error(`Gagal menghapus berita ${id}:`, err);
      return { success: false };
    }
  },

  async getCategories(): Promise<AdminCategoryItem[]> {
    try {
      const { data } = await apiClient.get<
        ApiSuccessBody<{ items: AdminCategoryItem[] }>
      >("/admin/news/categories");
      if (data?.data?.items) return data.data.items;
    } catch (err) {
      console.warn("Gagal memuat kategori berita admin, fallback ke public:", err);
      try {
        const { data } = await apiClient.get<
          ApiSuccessBody<{ items: AdminCategoryItem[] }>
        >("/public/news/categories?all=true");
        if (data?.data?.items) return data.data.items;
      } catch (fallbackErr) {
        console.error("Gagal memuat kategori berita:", fallbackErr);
      }
    }
    return [];
  },

  async createCategory(payload: {
    name: string;
    description?: string;
  }): Promise<AdminCategoryItem | null> {
    try {
      const { data } = await apiClient.post<ApiSuccessBody<AdminCategoryItem>>(
        "/admin/news/categories",
        payload,
      );
      return data?.data ?? null;
    } catch (err) {
      console.error("Gagal membuat kategori berita:", err);
      return null;
    }
  },
};
