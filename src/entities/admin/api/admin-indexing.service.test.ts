import { describe, expect, it, vi } from "vitest";
import { AdminIndexingService } from "./admin-indexing.service";
import { apiClient } from "@/shared/api/axios-instance";

describe("AdminIndexingService", () => {
  it("getStatus retrieves service account configuration status", async () => {
    const mockData = {
      isConfigured: true,
      clientEmail: "google-indexer@lokal-desa.iam.gserviceaccount.com",
      projectId: "lokal-desa",
      siteUrl: "https://lokalpringgodani.my.id",
      endpoint: "https://indexing.googleapis.com/v3/urlNotifications:publish",
    };

    vi.spyOn(apiClient, "get").mockResolvedValueOnce({
      data: { success: true, data: mockData },
    } as any);

    const result = await AdminIndexingService.getStatus();
    expect(result).toEqual(mockData);
    expect(result?.isConfigured).toBe(true);
  });

  it("publishUrl handles successful single URL notification", async () => {
    vi.spyOn(apiClient, "post").mockResolvedValueOnce({
      data: {
        success: true,
        message: "URL berhasil dikirim ke Google Indexing queue",
        data: {
          url: "https://lokalpringgodani.my.id/berita/sample",
          type: "URL_UPDATED",
          success: true,
        },
      },
    } as any);

    const result = await AdminIndexingService.publishUrl(
      "https://lokalpringgodani.my.id/berita/sample",
      "URL_UPDATED",
    );

    expect(result.success).toBe(true);
    expect(result.result?.url).toBe("https://lokalpringgodani.my.id/berita/sample");
  });

  it("publishUrl handles API errors gracefully without throwing", async () => {
    vi.spyOn(apiClient, "post").mockRejectedValueOnce({
      response: {
        data: { message: "Google API rate limit exceeded" },
      },
    });

    const result = await AdminIndexingService.publishUrl(
      "https://lokalpringgodani.my.id/berita/sample",
      "URL_UPDATED",
    );

    expect(result.success).toBe(false);
    expect(result.message).toContain("Google API rate limit exceeded");
  });

  it("reindexAll handles mass content indexing response", async () => {
    const mockSummary = {
      totalUrls: 12,
      successCount: 12,
      failureCount: 0,
      results: [],
    };

    vi.spyOn(apiClient, "post").mockResolvedValueOnce({
      data: {
        success: true,
        message: "Berhasil memproses sinkronisasi 12 URL",
        data: mockSummary,
      },
    } as any);

    const result = await AdminIndexingService.reindexAll();
    expect(result.success).toBe(true);
    expect(result.summary?.totalUrls).toBe(12);
  });
});
