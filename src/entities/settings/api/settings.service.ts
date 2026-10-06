import { apiClient } from "@/shared/api/axios-instance";
import type { ApiSuccessBody } from "@/shared/api/response";
import type { SettingsResponse } from "../model/types";

const DEFAULT_SETTINGS: SettingsResponse = {
  settings: {
    website_name: "Lokal Pringgodani",
    logo_url: "/images/logo-desa.png",
    favicon_url: "/images/favicon.png",
    contact_email: "",
    contact_phone: "",
    address: "",
    social_facebook: "",
    social_instagram: "",
    social_youtube: "",
    social_tiktok: "",
    jumlah_dusun: 4,
  },
};

/**
 * SettingsService — public, read-only site settings (contact info, social
 * links, maintenance mode, etc.), used by widgets like the Footer that
 * appear on every page.
 */
export const SettingsService = {
  async getAll(): Promise<SettingsResponse> {
    try {
      const { data } =
        await apiClient.get<ApiSuccessBody<SettingsResponse>>(
          "/public/settings",
        );
      if (data?.data) return data.data;
    } catch (err) {
      console.error("Gagal memuat pengaturan website dari API:", err);
    }
    return DEFAULT_SETTINGS;
  },
};
