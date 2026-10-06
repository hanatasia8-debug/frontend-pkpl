import { apiClient, IS_API_CONNECTED } from "@/shared/api/axios-instance";
import type { ApiSuccessBody } from "@/shared/api/response";
import type { AdminSettingsPayload } from "../model/admin.types";

const LOCAL_STORAGE_KEY = "app_admin_settings_v1";

const DEFAULT_ADMIN_SETTINGS: AdminSettingsPayload = {
  website_name: "Desa Pringgodani",
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
};

const listeners = new Set<() => void>();

export function subscribeStoredAdminSettings(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  if (typeof window !== "undefined") {
    window.addEventListener("storage", onStoreChange);
  }
  return () => {
    listeners.delete(onStoreChange);
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", onStoreChange);
    }
  };
}

export function getStoredAdminSettings(): AdminSettingsPayload {
  if (typeof window === "undefined") return { ...DEFAULT_ADMIN_SETTINGS };
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_ADMIN_SETTINGS };
    return { ...DEFAULT_ADMIN_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_ADMIN_SETTINGS };
  }
}

export function saveStoredAdminSettings(
  payload: Partial<AdminSettingsPayload>,
): AdminSettingsPayload {
  if (typeof window === "undefined") return { ...DEFAULT_ADMIN_SETTINGS };
  try {
    const current = getStoredAdminSettings();
    const merged = { ...current, ...payload };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(merged));
    listeners.forEach((listener) => {
      try {
        listener();
      } catch (e) {
        console.error("Error in admin settings subscriber:", e);
      }
    });
    return merged;
  } catch {
    return { ...DEFAULT_ADMIN_SETTINGS };
  }
}

export const AdminSettingsService = {
  async getSettings(): Promise<AdminSettingsPayload> {
    const stored = getStoredAdminSettings();

    if (IS_API_CONNECTED) {
      try {
        // The backend may answer in snake_case or camelCase, so the payload is
        // read as a loose record and normalised below.
        const { data } =
          await apiClient.get<
            ApiSuccessBody<Record<string, string | undefined>>
          >("/admin/settings");
        if (data?.data) {
          const raw = data.data;
          const mapped: AdminSettingsPayload = {
            website_name:
              raw.website_name || raw.websiteName || stored.website_name,
            logo_url: raw.logo_url || raw.logoUrl || stored.logo_url,
            favicon_url:
              raw.favicon_url || raw.faviconUrl || stored.favicon_url,
            contact_email:
              raw.contact_email ||
              raw.contactEmail ||
              raw.email ||
              stored.contact_email,
            contact_phone:
              raw.contact_phone ||
              raw.contactPhone ||
              raw.phone ||
              stored.contact_phone,
            address: raw.address || stored.address,
            social_facebook:
              raw.social_facebook ||
              raw.socialFacebook ||
              raw.facebook ||
              stored.social_facebook,
            social_instagram:
              raw.social_instagram ||
              raw.socialInstagram ||
              raw.instagram ||
              stored.social_instagram,
            social_youtube:
              raw.social_youtube ||
              raw.socialYoutube ||
              raw.youtube ||
              stored.social_youtube,
            social_tiktok:
              raw.social_tiktok ||
              raw.socialTiktok ||
              raw.tiktok ||
              stored.social_tiktok,
            jumlah_dusun:
              Number(raw.jumlah_dusun ?? raw.jumlahDusun) ||
              stored.jumlah_dusun ||
              4,
          };
          saveStoredAdminSettings(mapped);
          return mapped;
        }
      } catch (err) {
        console.error(
          "Gagal memuat pengaturan admin dari API, menggunakan draf tersimpan:",
          err,
        );
      }
    }
    return stored;
  },

  async updateSettings(
    payload: AdminSettingsPayload,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const { data } = await apiClient.put("/admin/settings", payload);
      saveStoredAdminSettings(payload);
      return {
        success: true,
        message: data?.message || "Pengaturan desa berhasil diperbarui.",
      };
    } catch (err) {
      console.error("Gagal menyimpan pengaturan admin ke API:", err);
      return {
        success: false,
        message: "Gagal menyimpan pengaturan. Silakan coba lagi.",
      };
    }
  },
};
