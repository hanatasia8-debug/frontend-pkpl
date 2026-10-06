import { apiClient } from "@/shared/api/axios-instance";
import type { ApiSuccessBody } from "@/shared/api/response";
import type { BannerListResponse } from "../model/types";

export const BannerService = {
  async getActive(): Promise<BannerListResponse> {
    try {
      const { data } =
        await apiClient.get<ApiSuccessBody<BannerListResponse>>(
          "/public/banners",
        );
      if (data?.data) return data.data;
    } catch (err) {
      console.error("Gagal memuat banner dari API:", err);
    }
    return { items: [] };
  },
};
