import axios from "axios";

import { apiClient } from "@/shared/api/axios-instance";
import type { ApiSuccessBody } from "@/shared/api/response";
import type { PotensiDetailDto, PotensiListResponse } from "../model/types";

export const PotensiService = {
  async getList(): Promise<PotensiListResponse> {
    try {
      const { data } =
        await apiClient.get<ApiSuccessBody<PotensiListResponse>>(
          "/public/potentials",
        );
      if (data?.data) return data.data;
    } catch (err) {
      console.error("Gagal memuat potensi desa dari API:", err);
    }
    return { items: [], total: 0 };
  },

  async getBySlug(slug: string): Promise<PotensiDetailDto | null> {
    try {
      const { data } = await apiClient.get<ApiSuccessBody<PotensiDetailDto>>(
        `/public/potentials/${encodeURIComponent(slug)}`,
      );
      if (data?.data) return data.data;
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        return null;
      }
      console.error(`Gagal memuat detail potensi '${slug}' dari API:`, err);
    }
    return null;
  },
};
