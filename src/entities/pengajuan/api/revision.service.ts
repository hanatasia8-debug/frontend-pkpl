import { apiClient } from "@/shared/api/axios-instance";
import type { ApiSuccessBody } from "@/shared/api/response";
import type { RegisterUmkmDTO } from "@/entities/umkm/model/register-umkm.schema";
import type { RegisterNewsDTO } from "@/entities/berita/model/register-news.schema";
import type { RevisionLookup } from "../model/types";

export const RevisionService = {
  async getByToken(token: string): Promise<RevisionLookup | null> {
    try {
      const { data } = await apiClient.get<ApiSuccessBody<RevisionLookup>>(
        `/public/submissions/revision/${token}`,
      );
      return data.data;
    } catch (err) {
      console.error(`Gagal memuat data revisi untuk token ${token}:`, err);
      return null;
    }
  },

  async resubmitUmkm(
    token: string,
    payload: Partial<RegisterUmkmDTO>,
  ): Promise<{ success: boolean }> {
    try {
      await apiClient.put(`/public/submissions/revision/${token}`, payload);
      return { success: true };
    } catch (err) {
      console.error(`Gagal mengirim revisi UMKM (token ${token}):`, err);
      return { success: false };
    }
  },

  async resubmitNews(
    token: string,
    payload: Partial<RegisterNewsDTO>,
  ): Promise<{ success: boolean }> {
    try {
      await apiClient.put(`/public/submissions/revision/${token}`, payload);
      return { success: true };
    } catch (err) {
      console.error(`Gagal mengirim revisi berita (token ${token}):`, err);
      return { success: false };
    }
  },
};
