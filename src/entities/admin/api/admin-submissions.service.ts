import { apiClient } from "@/shared/api/axios-instance";
import type { ApiSuccessBody } from "@/shared/api/response";
import type {
  PendingSubmissionsResponse,
  PendingNewsSubmission,
  PendingUmkmSubmission,
  NewsStatus,
  UmkmStatus,
} from "../model/admin.types";

export const AdminSubmissionsService = {
  async getPendingSubmissions(): Promise<PendingSubmissionsResponse> {
    try {
      const { data } =
        await apiClient.get<ApiSuccessBody<Record<string, unknown>>>(
          "/admin/submissions",
        );
      if (data?.data) {
        const raw = data.data;
        const newsList = (raw.news || raw.pendingNews || []) as Array<
          Record<string, unknown>
        >;
        const umkmList = (raw.umkm || raw.pendingUmkm || []) as Array<
          Record<string, unknown>
        >;

        const pendingNews: PendingNewsSubmission[] = newsList.map((n) => ({
          id: String(n.id),
          title: String(n.title || "Pengajuan Berita"),
          slug: String(n.slug || "pengajuan-berita"),
          excerpt: String(n.summary || n.excerpt || ""),
          categoryName: String(n.categoryName || "Kegiatan Desa"),
          submittedAt: String(n.submittedAt || new Date().toISOString()),
          coverUrl: String(
            n.coverImage ||
              n.coverUrl ||
              "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80",
          ),
          authorName: String(n.authorName || "Warga Desa"),
          contentBlocks: (n.contentBlocks as Array<{
            subHeading?: string;
            content: string;
            imageUrl?: string;
          }>) || [
            {
              subHeading: "Uraian Berita",
              content: String(
                n.summary || n.excerpt || "Liputan berita warga.",
              ),
            },
          ],
        }));

        const pendingUmkm: PendingUmkmSubmission[] = umkmList.map((u) => ({
          id: String(u.id),
          name: String(u.name || "Pengajuan UMKM"),
          slug: String(u.slug || "pengajuan-umkm"),
          ownerName: String(u.ownerName || "Pemilik UMKM"),
          categoryName: String(u.categoryName || "Kuliner"),
          description: String(u.description || u.summary || ""),
          phone: String(u.phone || u.whatsappNumber || "081234567890"),
          email: u.email ? String(u.email) : undefined,
          address: String(u.address || "Desa Pringgodani"),
          latitude:
            u.latitude !== undefined && u.latitude !== null
              ? Number(u.latitude)
              : -8.2811,
          longitude:
            u.longitude !== undefined && u.longitude !== null
              ? Number(u.longitude)
              : 112.5664,
          mapsUrl: u.mapsUrl ? String(u.mapsUrl) : undefined,
          since:
            u.since !== undefined && u.since !== null
              ? Number(u.since)
              : undefined,
          openDay: u.openDay ? String(u.openDay) : undefined,
          startTime: u.startTime ? String(u.startTime) : undefined,
          endTime: u.endTime ? String(u.endTime) : undefined,
          submittedAt: String(u.submittedAt || new Date().toISOString()),
          coverUrl: String(
            u.coverUrl ||
              u.coverImage ||
              "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80",
          ),
          galleries: Array.isArray(u.galleries)
            ? (u.galleries as string[])
            : Array.isArray(u.gallery)
            ? (u.gallery as string[])
            : [],
          products:
            (u.products as Array<{
              name: string;
              price: number;
              description?: string;
              imageUrl?: string;
            }>) || [],
        }));

        return {
          pendingNews,
          pendingUmkm,
          totalPending:
            Number(raw.totalPending) || pendingNews.length + pendingUmkm.length,
        };
      }
    } catch (err) {
      console.error("Gagal memuat pengajuan admin dari API backend:", err);
    }

    return {
      pendingNews: [],
      pendingUmkm: [],
      totalPending: 0,
    };
  },

  async updateNewsStatus(
    id: string,
    status: NewsStatus,
    reason?: string,
  ): Promise<{ success: boolean }> {
    try {
      await apiClient.patch(`/admin/news/${id}/status`, {
        status,
        rejectionReason: reason,
        reason,
      });
      return { success: true };
    } catch (err) {
      console.error(`Gagal mengubah status berita ${id}:`, err);
      return { success: false };
    }
  },

  async updateUmkmStatus(
    id: string,
    status: UmkmStatus,
    reason?: string,
  ): Promise<{ success: boolean }> {
    try {
      await apiClient.patch(`/admin/umkm/${id}/status`, {
        status,
        rejectionReason: reason,
        reason,
      });
      return { success: true };
    } catch (err) {
      console.error(`Gagal mengubah status UMKM ${id}:`, err);
      return { success: false };
    }
  },
};
