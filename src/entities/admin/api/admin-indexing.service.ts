import { apiClient } from "@/shared/api/axios-instance";
import type { ApiSuccessBody } from "@/shared/api/response";

export interface IndexingStatusInfo {
  isConfigured: boolean;
  clientEmail: string | null;
  projectId: string | null;
  siteUrl: string;
  endpoint: string;
}

export interface IndexingResultItem {
  url: string;
  type: "URL_UPDATED" | "URL_DELETED";
  success: boolean;
  status?: number;
  message?: string;
  notifyTime?: string;
}

export interface ReindexAllSummary {
  totalUrls: number;
  successCount: number;
  failureCount: number;
  results: IndexingResultItem[];
}

export const AdminIndexingService = {
  async getStatus(): Promise<IndexingStatusInfo | null> {
    try {
      const { data } = await apiClient.get<ApiSuccessBody<IndexingStatusInfo>>(
        "/admin/indexing",
      );
      return data?.data ?? null;
    } catch (err) {
      console.warn("Gagal memeriksa status indexing:", err);
      return null;
    }
  },

  async publishUrl(
    url: string,
    type: "URL_UPDATED" | "URL_DELETED" = "URL_UPDATED",
  ): Promise<{
    success: boolean;
    message: string;
    result?: IndexingResultItem;
  }> {
    try {
      const { data } = await apiClient.post<ApiSuccessBody<IndexingResultItem>>(
        "/admin/indexing",
        { url, type },
      );
      return {
        success: true,
        message: data?.message || "URL berhasil dikirim ke Google Indexing",
        result: data?.data,
      };
    } catch (err: unknown) {
      let errMsg = "Gagal mengirim URL ke Google Indexing";
      if (typeof err === "object" && err !== null) {
        const axErr = err as { response?: { data?: { message?: string } }; message?: string };
        errMsg = axErr.response?.data?.message || axErr.message || errMsg;
      }
      return {
        success: false,
        message: errMsg,
      };
    }
  },

  async reindexAll(): Promise<{
    success: boolean;
    message: string;
    summary?: ReindexAllSummary;
  }> {
    try {
      const { data } = await apiClient.post<ApiSuccessBody<ReindexAllSummary>>(
        "/admin/indexing",
        { action: "reindex_all" },
      );
      return {
        success: true,
        message:
          data?.message ||
          "Sinkronisasi konten ke Google Indexing berhasil diproses",
        summary: data?.data,
      };
    } catch (err: unknown) {
      let errMsg = "Gagal memproses sinkronisasi massal";
      if (typeof err === "object" && err !== null) {
        const axErr = err as { response?: { data?: { message?: string } }; message?: string };
        errMsg = axErr.response?.data?.message || axErr.message || errMsg;
      }
      return {
        success: false,
        message: errMsg,
      };
    }
  },
};
