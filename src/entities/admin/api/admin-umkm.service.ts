import { apiClient } from "@/shared/api/axios-instance";
import type { ApiSuccessBody } from "@/shared/api/response";
import type {
  AdminUmkmItem,
  UmkmStatus,
  AdminCategoryItem,
} from "../model/admin.types";

export const AdminUmkmService = {
  async getAllUmkm(
    status: string = "ALL",
  ): Promise<{ items: AdminUmkmItem[]; total: number }> {
    try {
      const { data } =
        await apiClient.get<
          ApiSuccessBody<{ items: AdminUmkmItem[]; total: number }>
        >(`/admin/umkm?status=${status}&limit=1000`);
      if (data?.data) return data.data;
    } catch (err) {
      console.error("Gagal memuat UMKM admin dari API:", err);
    }
    return { items: [], total: 0 };
  },

  async createUmkm(payload: Partial<AdminUmkmItem>): Promise<AdminUmkmItem> {
    const { data } = await apiClient.post<ApiSuccessBody<AdminUmkmItem>>(
      "/admin/umkm",
      payload,
    );
    return data.data;
  },

  async updateUmkmStatus(
    id: string,
    status: UmkmStatus,
  ): Promise<{ success: boolean }> {
    try {
      await apiClient.patch(`/admin/umkm/${id}/status`, { status });
      return { success: true };
    } catch (err) {
      console.error(`Gagal merubah status UMKM ${id}:`, err);
      return { success: false };
    }
  },

  async deleteUmkm(id: string): Promise<{ success: boolean }> {
    try {
      await apiClient.delete(`/admin/umkm/${id}`);
      return { success: true };
    } catch (err) {
      console.error(`Gagal menghapus UMKM ${id}:`, err);
      return { success: false };
    }
  },

  async getUmkmById(id: string): Promise<AdminUmkmItem | null> {
    try {
      const { data } = await apiClient.get<ApiSuccessBody<AdminUmkmItem>>(
        `/admin/umkm/${id}`,
      );
      if (data?.data) return data.data;
    } catch (err) {
      console.error(`Gagal memuat UMKM ${id}:`, err);
    }
    return null;
  },

  async updateUmkm(
    id: string,
    payload: Partial<AdminUmkmItem>,
  ): Promise<{ success: boolean }> {
    try {
      await apiClient.put(`/admin/umkm/${id}`, payload);
      return { success: true };
    } catch (err) {
      console.error(`Gagal memperbarui UMKM ${id}:`, err);
      return { success: false };
    }
  },

  async getCategories(): Promise<AdminCategoryItem[]> {
    try {
      const { data } = await apiClient.get<
        ApiSuccessBody<{ items: AdminCategoryItem[] }>
      >("/admin/umkm/categories");
      if (data?.data?.items) return data.data.items;
    } catch (err) {
      console.warn("Gagal memuat kategori UMKM admin, fallback ke public:", err);
      try {
        const { data } = await apiClient.get<
          ApiSuccessBody<{ items: AdminCategoryItem[] }>
        >("/public/umkm/categories?all=true");
        if (data?.data?.items) return data.data.items;
      } catch (fallbackErr) {
        console.error("Gagal memuat kategori UMKM:", fallbackErr);
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
        "/admin/umkm/categories",
        payload,
      );
      return data?.data ?? null;
    } catch (err) {
      console.error("Gagal membuat kategori UMKM:", err);
      return null;
    }
  },
};
