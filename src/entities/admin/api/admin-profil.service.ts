import { apiClient, IS_API_CONNECTED } from "@/shared/api/axios-instance";
import type { ApiSuccessBody } from "@/shared/api/response";
import {
  getStoredVillageProfile,
  saveStoredVillageProfile,
} from "@/shared/utils/profile-storage";

export interface AdminOfficialItem {
  id: string;
  name: string;
  position: string;
  photoUrl: string;
  email?: string;
  greeting?: string;
}

export interface AdminProfilPayload {
  headName: string;
  headPosition: string;
  headPhoto: string;
  headGreeting: string;
  aboutText?: string;
  officials: AdminOfficialItem[];
}

export const AdminProfilService = {
  async getProfil(): Promise<AdminProfilPayload> {
    if (IS_API_CONNECTED) {
      try {
        const { data } =
          await apiClient.get<ApiSuccessBody<AdminProfilPayload>>(
            "/admin/profil",
          );
        if (data?.data) {
          saveStoredVillageProfile(data.data);
          return data.data;
        }
      } catch (err) {
        console.error(
          "Gagal memuat profil desa dari API, menggunakan draf lokal:",
          err,
        );
      }
    }
    return getStoredVillageProfile();
  },

  // Bug fix (same pattern as admin-submissions.service.ts): these used to
  // log the error then silently fall through to the local-mock success
  // path even when IS_API_CONNECTED and the real API call failed - admin
  // would see "berhasil diperbarui" but nothing was actually saved to the
  // backend (confirmed by UAT: "sambutan tidak dapat diperbaharui").
  async updateProfil(
    payload: Partial<AdminProfilPayload>,
  ): Promise<{ success: boolean }> {
    if (IS_API_CONNECTED) {
      try {
        await apiClient.put("/admin/profil", payload);
      } catch (err) {
        console.error("Gagal memperbarui profil desa ke API:", err);
        return { success: false };
      }
    }

    saveStoredVillageProfile(payload);
    return { success: true };
  },

  async addOfficial(
    official: Omit<AdminOfficialItem, "id">,
  ): Promise<AdminOfficialItem | null> {
    if (IS_API_CONNECTED) {
      try {
        const { data } = await apiClient.post<
          ApiSuccessBody<AdminOfficialItem>
        >("/admin/officials", official);
        if (data?.data) return data.data;
        return null;
      } catch (err) {
        console.error("Gagal menambah perangkat desa ke API:", err);
        return null;
      }
    }

    const current = getStoredVillageProfile();
    const newOfficial: AdminOfficialItem = {
      id: `official-${Date.now()}`,
      ...official,
    };
    const updatedOfficials = [newOfficial, ...current.officials];
    saveStoredVillageProfile({ officials: updatedOfficials });
    return newOfficial;
  },

  async updateOfficial(
    id: string,
    official: Partial<AdminOfficialItem>,
  ): Promise<{ success: boolean }> {
    if (IS_API_CONNECTED) {
      try {
        await apiClient.put(`/admin/officials/${id}`, official);
      } catch (err) {
        console.error(`Gagal merubah perangkat desa ${id}:`, err);
        return { success: false };
      }
    }

    const current = getStoredVillageProfile();
    const updatedOfficials = current.officials.map((o) =>
      o.id === id ? { ...o, ...official } : o,
    );
    saveStoredVillageProfile({ officials: updatedOfficials });
    return { success: true };
  },

  async deleteOfficial(id: string): Promise<{ success: boolean }> {
    if (IS_API_CONNECTED) {
      try {
        await apiClient.delete(`/admin/officials/${id}`);
      } catch (err) {
        console.error(`Gagal menghapus perangkat desa ${id}:`, err);
        return { success: false };
      }
    }

    const current = getStoredVillageProfile();
    const updatedOfficials = current.officials.filter((o) => o.id !== id);
    saveStoredVillageProfile({ officials: updatedOfficials });
    return { success: true };
  },
};
