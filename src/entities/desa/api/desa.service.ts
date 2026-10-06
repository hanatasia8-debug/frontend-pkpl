import { apiClient } from "@/shared/api/axios-instance";
import type { ApiSuccessBody } from "@/shared/api/response";
import type { VillageProfileResponse, VillageStatsDto } from "../model/types";
import { getStoredVillageProfile } from "@/shared/utils/profile-storage";

export const DesaService = {
  async getProfileWithStats(): Promise<VillageProfileResponse> {
    let apiProfile = null;
    let stats: VillageStatsDto = {
      umkmCount: 0,
      productCount: 0,
      newsCount: 0,
      dusunCount: 4,
    };

    try {
      const { data } =
        await apiClient.get<ApiSuccessBody<VillageProfileResponse>>(
          "/public/profil",
        );
      if (data?.data) {
        apiProfile = data.data.profile;
        if (data.data.stats) {
          stats = data.data.stats;
        }
      }
    } catch (err) {
      console.error("Gagal memuat profil desa dari API:", err);
    }

    const stored = getStoredVillageProfile();

    const profile = apiProfile
      ? {
          villageName: apiProfile.villageName || "Desa Pringgodani",
          headGreeting: apiProfile.headGreeting || "",
          headPhoto: apiProfile.headPhoto || "/images/placeholder-avatar.jpg",
          headName: apiProfile.headName || "Kepala Desa",
          headPosition: apiProfile.headPosition || "Kepala Desa",
          aboutText: apiProfile.aboutText || "",
          address: apiProfile.address || "",
          phone: apiProfile.phone || "",
          email: apiProfile.email || "",
          officials: apiProfile.officials || [],
        }
      : {
          villageName: "Desa Pringgodani",
          headGreeting: stored.headGreeting || "",
          headPhoto: stored.headPhoto || "/images/placeholder-avatar.jpg",
          headName: stored.headName || "Kepala Desa",
          headPosition: stored.headPosition || "Kepala Desa",
          aboutText: stored.aboutText || "",
          address: "",
          phone: "",
          email: "",
          officials:
            stored.officials?.map((o) => ({
              name: String(o.name || ""),
              position: String(o.position || ""),
              photo: String(o.photoUrl || ""),
              greeting: o.greeting ? String(o.greeting) : undefined,
              email: o.email ? String(o.email) : undefined,
            })) || [],
        };

    return { profile, stats };
  },
};
