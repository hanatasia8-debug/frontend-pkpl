/**
 * Unit Test — AdminSubmissionsService (Fitur 6: Validasi Pengajuan Usaha Warga — RQ-006 / FS-006)
 *
 * Target utama : AdminSubmissionsService.getPendingSubmissions() + updateNewsStatus() / updateUmkmStatus()
 *                (src/entities/admin/api/admin-submissions.service.ts)
 * Pola         : Arrange – Act – Assert (AAA)
 *
 * Test Double yang dipakai:
 *  1. STUB  → `apiClient.get` & `apiClient.patch` diprogram mengembalikan payload lengkap,
 *             payload minimal/alternatif key, payload kosong, dan error API.
 *  2. MOCK  → `apiClient.patch` diverifikasi menerima endpoint & payload persetujuan/penolakan
 *             (`status`, `rejectionReason`, `reason`).
 *  3. SPY   → `vi.spyOn(console, "error")` merekam pencatatan kegagalan panggilan backend.
 *  4. FAKE  → `vi.useFakeTimers()` + `vi.setSystemTime()` menyediakan jam sistem palsu
 *             agar nilai fallback `new Date().toISOString()` deterministik.
 */
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/shared/api/axios-instance", () => ({
  apiClient: {
    get: vi.fn(),
    patch: vi.fn(),
  },
}));

import { apiClient } from "@/shared/api/axios-instance";
import { AdminSubmissionsService } from "./admin-submissions.service";

const getMock = vi.mocked(apiClient.get);
const patchMock = vi.mocked(apiClient.patch);

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  getMock.mockReset();
  patchMock.mockReset();
});

describe("AdminSubmissionsService.getPendingSubmissions() — White-Box Test Cases (Fitur 6)", () => {
  it("TC-01: payload lengkap (news & umkm penuh) → seluruh field dipetakan persis tanpa fallback (B1, B3, B5, B7, B9)", async () => {
    // Arrange
    getMock.mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          news: [
            {
              id: "n-1",
              title: "Panen Raya Padi",
              slug: "panen-raya-padi",
              summary: "Ringkasan panen",
              categoryName: "Pertanian",
              submittedAt: "2026-10-15T10:00:00.000Z",
              coverImage: "https://cdn.desa.id/panen.jpg",
              authorName: "Pak Tani",
              contentBlocks: [{ subHeading: "Pembuka", content: "Isi berita panen." }],
            },
          ],
          umkm: [
            {
              id: "u-1",
              name: "Warung Kopi Lereng",
              slug: "warung-kopi-lereng",
              ownerName: "Mas Budi",
              categoryName: "Kuliner",
              description: "Kopi robusta lokal",
              phone: "081234567890",
              email: "kopi@desa.id",
              address: "Dusun Krajan",
              latitude: -8.29,
              longitude: 112.57,
              mapsUrl: "https://maps.google.com/?q=-8.29,112.57",
              since: 2019,
              openDay: "Senin - Minggu",
              startTime: "07:00",
              endTime: "21:00",
              submittedAt: "2026-10-15T11:00:00.000Z",
              coverUrl: "https://cdn.desa.id/kopi.jpg",
              galleries: ["https://cdn.desa.id/g1.jpg"],
              products: [{ name: "Kopi Tubruk", price: 10000 }],
            },
          ],
          totalPending: 5,
        },
      },
    }); // STUB

    // Act
    const result = await AdminSubmissionsService.getPendingSubmissions();

    // Assert
    expect(getMock).toHaveBeenCalledWith("/admin/submissions"); // MOCK
    expect(result.totalPending).toBe(5);
    expect(result.pendingNews[0]).toMatchObject({
      id: "n-1",
      title: "Panen Raya Padi",
      excerpt: "Ringkasan panen",
      coverUrl: "https://cdn.desa.id/panen.jpg",
      contentBlocks: [{ subHeading: "Pembuka", content: "Isi berita panen." }],
    });
    expect(result.pendingUmkm[0]).toMatchObject({
      id: "u-1",
      name: "Warung Kopi Lereng",
      email: "kopi@desa.id",
      latitude: -8.29,
      longitude: 112.57,
      since: 2019,
      galleries: ["https://cdn.desa.id/g1.jpg"],
      products: [{ name: "Kopi Tubruk", price: 10000 }],
    });
  });

  it("TC-02: payload memakai alias alternatif (pendingNews, pendingUmkm, excerpt, coverUrl, whatsappNumber, gallery)", async () => {
    // Arrange
    getMock.mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          pendingNews: [
            {
              id: "n-2",
              excerpt: "Ringkasan dari excerpt",
              coverUrl: "https://cdn.desa.id/alt-news.jpg",
            },
          ],
          pendingUmkm: [
            {
              id: "u-2",
              summary: "Deskripsi dari summary",
              whatsappNumber: "6281234567890",
              coverImage: "https://cdn.desa.id/alt-umkm.jpg",
              gallery: ["https://cdn.desa.id/alt-g1.jpg"],
            },
          ],
        },
      },
    }); // STUB
    vi.useFakeTimers(); // FAKE clock
    vi.setSystemTime(new Date("2026-10-20T09:00:00.000Z"));

    // Act
    const result = await AdminSubmissionsService.getPendingSubmissions();

    // Assert
    expect(result.totalPending).toBe(2);
    expect(result.pendingNews[0]).toMatchObject({
      title: "Pengajuan Berita",
      excerpt: "Ringkasan dari excerpt",
      coverUrl: "https://cdn.desa.id/alt-news.jpg",
      submittedAt: "2026-10-20T09:00:00.000Z",
      contentBlocks: [{ subHeading: "Uraian Berita", content: "Ringkasan dari excerpt" }],
    });
    expect(result.pendingUmkm[0]).toMatchObject({
      name: "Pengajuan UMKM",
      description: "Deskripsi dari summary",
      phone: "6281234567890",
      latitude: -8.2811,
      longitude: 112.5664,
      since: undefined,
      email: undefined,
      coverUrl: "https://cdn.desa.id/alt-umkm.jpg",
      galleries: ["https://cdn.desa.id/alt-g1.jpg"],
      products: [],
    });
  });

  it("TC-03: payload minimal (tanpa field opsional & tanpa gallery/news/umkm) → semua fallback default aktif", async () => {
    // Arrange
    getMock.mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          news: [{ id: "n-3" }],
          umkm: [{ id: "u-3", latitude: null, longitude: null, since: null }],
        },
      },
    }); // STUB
    vi.useFakeTimers(); // FAKE
    vi.setSystemTime(new Date("2026-10-21T12:00:00.000Z"));

    // Act
    const result = await AdminSubmissionsService.getPendingSubmissions();

    // Assert
    expect(result.pendingNews[0].contentBlocks[0].content).toBe("Liputan berita warga.");
    expect(result.pendingNews[0].coverUrl).toContain("unsplash.com");
    expect(result.pendingUmkm[0].phone).toBe("081234567890");
    expect(result.pendingUmkm[0].galleries).toEqual([]);
    expect(result.pendingUmkm[0].latitude).toBe(-8.2811);
    expect(result.pendingUmkm[0].longitude).toBe(112.5664);
    expect(result.pendingUmkm[0].since).toBeUndefined();
  });

  it("TC-04: data.data ada tapi news & umkm tidak ada, serta respons data.data kosong → totalPending 0", async () => {
    // Arrange
    getMock
      .mockResolvedValueOnce({ data: { success: true, data: {} } })
      .mockResolvedValueOnce({ data: { success: true } }); // STUB

    // Act
    const emptyLists = await AdminSubmissionsService.getPendingSubmissions();
    const noData = await AdminSubmissionsService.getPendingSubmissions();

    // Assert
    expect(emptyLists).toEqual({ pendingNews: [], pendingUmkm: [], totalPending: 0 });
    expect(noData).toEqual({ pendingNews: [], pendingUmkm: [], totalPending: 0 });
  });

  it("TC-05: API melempar error jaringan → mencatat console.error & mengembalikan respons kosong aman (B2)", async () => {
    // Arrange
    const networkErr = new Error("503 Service Unavailable");
    getMock.mockRejectedValueOnce(networkErr); // STUB
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {}); // SPY

    // Act
    const result = await AdminSubmissionsService.getPendingSubmissions();

    // Assert
    expect(result).toEqual({ pendingNews: [], pendingUmkm: [], totalPending: 0 });
    expect(errorSpy).toHaveBeenCalledWith(
      "Gagal memuat pengajuan admin dari API backend:",
      networkErr,
    ); // SPY
  });
});

describe("AdminSubmissionsService — aksi persetujuan & penolakan status (RQ-006)", () => {
  it("updateUmkmStatus() menyetujui (PUBLISHED), menolak (REJECTED + reason), dan menangani error", async () => {
    // Arrange
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {}); // SPY
    patchMock
      .mockResolvedValueOnce({ data: { success: true } })
      .mockResolvedValueOnce({ data: { success: true } })
      .mockRejectedValueOnce(new Error("500")); // STUB

    // Act
    const approved = await AdminSubmissionsService.updateUmkmStatus("u-1", "PUBLISHED");
    const rejected = await AdminSubmissionsService.updateUmkmStatus(
      "u-2",
      "REJECTED",
      "Foto produk kurang jelas",
    );
    const failed = await AdminSubmissionsService.updateUmkmStatus("u-3", "PUBLISHED");

    // Assert
    expect(approved).toEqual({ success: true });
    expect(rejected).toEqual({ success: true });
    expect(failed).toEqual({ success: false });
    expect(patchMock).toHaveBeenNthCalledWith(1, "/admin/umkm/u-1/status", {
      status: "PUBLISHED",
      rejectionReason: undefined,
      reason: undefined,
    }); // MOCK
    expect(patchMock).toHaveBeenNthCalledWith(2, "/admin/umkm/u-2/status", {
      status: "REJECTED",
      rejectionReason: "Foto produk kurang jelas",
      reason: "Foto produk kurang jelas",
    }); // MOCK
    expect(errSpy).toHaveBeenCalledTimes(1);
  });

  it("updateNewsStatus() menyetujui/menolak pengajuan berita warga dan menangani error", async () => {
    // Arrange
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {}); // SPY
    patchMock
      .mockResolvedValueOnce({ data: { success: true } })
      .mockRejectedValueOnce(new Error("500")); // STUB

    // Act
    const rejected = await AdminSubmissionsService.updateNewsStatus(
      "n-1",
      "REJECTED",
      "Sumber belum terverifikasi",
    );
    const failed = await AdminSubmissionsService.updateNewsStatus("n-2", "PUBLISHED");

    // Assert
    expect(rejected).toEqual({ success: true });
    expect(failed).toEqual({ success: false });
    expect(patchMock).toHaveBeenNthCalledWith(1, "/admin/news/n-1/status", {
      status: "REJECTED",
      rejectionReason: "Sumber belum terverifikasi",
      reason: "Sumber belum terverifikasi",
    }); // MOCK
    expect(errSpy).toHaveBeenCalledTimes(1);
  });
});
