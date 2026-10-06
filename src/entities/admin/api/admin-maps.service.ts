import { apiClient } from "@/shared/api/axios-instance";
import type { ApiSuccessBody } from "@/shared/api/response";
import type { AdminMapLocation, AdminMapCategory } from "../model/admin.types";

export const AdminMapsService = {
  async getLocations(): Promise<AdminMapLocation[]> {
    try {
      const { data } = await apiClient.get<ApiSuccessBody<AdminMapLocation[]>>(
        "/admin/maps/locations",
      );
      if (data?.data) return data.data;
    } catch (err) {
      console.error("Gagal memuat titik peta dari API:", err);
    }
    return [];
  },

  async createLocation(
    payload: Partial<AdminMapLocation>,
  ): Promise<AdminMapLocation> {
    const { data } = await apiClient.post<ApiSuccessBody<AdminMapLocation>>(
      "/admin/maps/locations",
      payload,
    );
    return data.data;
  },

  async updateLocation(
    id: string,
    payload: Partial<AdminMapLocation>,
  ): Promise<{ success: boolean }> {
    try {
      await apiClient.put(`/admin/maps/locations/${id}`, payload);
      return { success: true };
    } catch (err) {
      console.error(`Gagal merubah peta ${id}:`, err);
      return { success: false };
    }
  },

  async deleteLocation(id: string): Promise<{ success: boolean }> {
    try {
      await apiClient.delete(`/admin/maps/locations/${id}`);
      return { success: true };
    } catch (err) {
      console.error(`Gagal menghapus peta ${id}:`, err);
      return { success: false };
    }
  },

  async getCategories(): Promise<AdminMapCategory[]> {
    try {
      const { data } = await apiClient.get<ApiSuccessBody<AdminMapCategory[]>>(
        "/admin/maps/categories",
      );
      if (data?.data) return data.data;
    } catch (err) {
      console.error("Gagal memuat kategori peta dari API:", err);
    }
    return [];
  },
};
