/**
 * Unit Test — AdminNewsService (Fitur 4: Manajemen Berita Desa CRUD — RQ-004 / FS-004)
 *
 * Target utama : AdminNewsService.getCategories() + seluruh operasi CRUD
 *                (src/entities/admin/api/admin-news.service.ts)
 * Pola         : Arrange – Act – Assert (AAA)
 *
 * Test Double yang dipakai:
 *  1. STUB  → `apiClient.get/post/put/patch/delete` diprogram mengembalikan respons kalengan
 *             (data valid, payload kosong/null, dan error) tanpa server backend.
 *  2. MOCK  → `apiClient` diverifikasi urutan pemanggilan endpoint-nya (termasuk fallback
 *             "/admin/news/categories" → "/public/news/categories?all=true") serta payload CRUD.
 *  3. SPY   → `vi.spyOn(console, "warn")` dan `vi.spyOn(console, "error")` merekam logging
 *             peringatan fallback dan error tanpa memutus alur kode.
 */
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/shared/api/axios-instance", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

import { apiClient } from "@/shared/api/axios-instance";
import type { AdminCategoryItem, AdminNewsItem } from "../model/admin.types";
import { AdminNewsService } from "./admin-news.service";

const getMock = vi.mocked(apiClient.get);
const postMock = vi.mocked(apiClient.post);
const putMock = vi.mocked(apiClient.put);
const patchMock = vi.mocked(apiClient.patch);
const deleteMock = vi.mocked(apiClient.delete);

const SAMPLE_CATEGORIES: AdminCategoryItem[] = [
  { id: "cat-1", name: "Kegiatan Desa", slug: "kegiatan-desa" },
  { id: "cat-2", name: "Pemerintahan", slug: "pemerintahan" },
];

const SAMPLE_NEWS: AdminNewsItem = {
  id: "news-1",
  title: "Kerja Bakti Dusun Krajan",
  slug: "kerja-bakti-dusun-krajan",
  excerpt: "Warga membersihkan saluran irigasi desa.",
  categoryName: "Kegiatan Desa",
  authorName: "Admin Desa",
  status: "PUBLISHED",
  publishedAt: "2026-10-20T08:00:00.000Z",
};

afterEach(() => {
  vi.restoreAllMocks();
  getMock.mockReset();
  postMock.mockReset();
  putMock.mockReset();
  patchMock.mockReset();
  deleteMock.mockReset();
});

describe("AdminNewsService.getCategories() — White-Box Test Cases (Fitur 4)", () => {
  it("TC-01: endpoint admin sukses dengan items → kembalikan kategori admin tanpa fallback (B1, B3)", async () => {
    // Arrange
    getMock.mockResolvedValueOnce({
      data: { success: true, data: { items: SAMPLE_CATEGORIES } },
    }); // STUB
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {}); // SPY

    // Act
    const result = await AdminNewsService.getCategories();

    // Assert
    expect(result).toEqual(SAMPLE_CATEGORIES);
    expect(getMock).toHaveBeenCalledTimes(1); // MOCK
    expect(getMock).toHaveBeenCalledWith("/admin/news/categories");
    expect(warnSpy).not.toHaveBeenCalled(); // SPY
  });

  it("TC-02: endpoint admin sukses namun data.items kosong/undefined → kembalikan array kosong (B1, B4)", async () => {
    // Arrange
    getMock.mockResolvedValueOnce({ data: { success: true, data: {} } }); // STUB

    // Act
    const result = await AdminNewsService.getCategories();

    // Assert
    expect(result).toEqual([]);
    expect(getMock).toHaveBeenCalledTimes(1); // MOCK
  });

  it("TC-03: endpoint admin error → fallback ke public categories sukses & mencatat console.warn (B2, B5, B7)", async () => {
    // Arrange
    const adminErr = new Error("403 Admin Forbidden");
    getMock
      .mockRejectedValueOnce(adminErr) // STUB primary gagal
      .mockResolvedValueOnce({
        data: { success: true, data: { items: SAMPLE_CATEGORIES } },
      }); // STUB fallback sukses
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {}); // SPY

    // Act
    const result = await AdminNewsService.getCategories();

    // Assert
    expect(result).toEqual(SAMPLE_CATEGORIES);
    expect(getMock).toHaveBeenNthCalledWith(1, "/admin/news/categories"); // MOCK
    expect(getMock).toHaveBeenNthCalledWith(2, "/public/news/categories?all=true"); // MOCK
    expect(warnSpy).toHaveBeenCalledWith(
      "Gagal memuat kategori berita admin, fallback ke public:",
      adminErr,
    ); // SPY
  });

  it("TC-04: endpoint admin error, fallback publik tanpa items → kembalikan array kosong (B2, B5, B8)", async () => {
    // Arrange
    getMock
      .mockRejectedValueOnce(new Error("Admin down"))
      .mockResolvedValueOnce({ data: { success: true, data: null } }); // STUB
    vi.spyOn(console, "warn").mockImplementation(() => {}); // SPY

    // Act
    const result = await AdminNewsService.getCategories();

    // Assert
    expect(result).toEqual([]);
    expect(getMock).toHaveBeenCalledTimes(2); // MOCK
  });

  it("TC-05: endpoint admin error & fallback publik juga error → log warn+error & kembalikan [] (B2, B6)", async () => {
    // Arrange
    const fallbackErr = new Error("Public timeout");
    getMock
      .mockRejectedValueOnce(new Error("Admin timeout"))
      .mockRejectedValueOnce(fallbackErr); // STUB
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {}); // SPY
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {}); // SPY

    // Act
    const result = await AdminNewsService.getCategories();

    // Assert
    expect(result).toEqual([]);
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(errorSpy).toHaveBeenCalledWith("Gagal memuat kategori berita:", fallbackErr);
  });
});

describe("AdminNewsService — operasi CRUD berita & kategori (supplementary)", () => {
  it("getAllNews() sukses, data kosong, dan error API", async () => {
    // Arrange
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {}); // SPY
    getMock
      .mockResolvedValueOnce({ data: { data: { items: [SAMPLE_NEWS], total: 1 } } })
      .mockResolvedValueOnce({ data: {} })
      .mockRejectedValueOnce(new Error("API Error")); // STUB

    // Act
    const ok = await AdminNewsService.getAllNews();
    const empty = await AdminNewsService.getAllNews();
    const failed = await AdminNewsService.getAllNews();

    // Assert
    expect(ok).toEqual({ items: [SAMPLE_NEWS], total: 1 });
    expect(empty).toEqual({ items: [], total: 0 });
    expect(failed).toEqual({ items: [], total: 0 });
    expect(errSpy).toHaveBeenCalledTimes(1);
  });

  it("getNewsById() sukses, data null, dan error API", async () => {
    // Arrange
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    getMock
      .mockResolvedValueOnce({ data: { data: SAMPLE_NEWS } })
      .mockResolvedValueOnce({ data: {} })
      .mockRejectedValueOnce(new Error("404"));

    // Act
    const ok = await AdminNewsService.getNewsById("news-1");
    const empty = await AdminNewsService.getNewsById("news-2");
    const failed = await AdminNewsService.getNewsById("news-3");

    // Assert
    expect(ok).toEqual(SAMPLE_NEWS);
    expect(empty).toBeNull();
    expect(failed).toBeNull();
    expect(getMock).toHaveBeenCalledWith("/admin/news/news-1");
    expect(errSpy).toHaveBeenCalledTimes(1);
  });

  it("createNews() mengirim POST /admin/news dan mengembalikan berita baru", async () => {
    // Arrange
    postMock.mockResolvedValueOnce({ data: { data: SAMPLE_NEWS } }); // STUB
    const payload = { title: SAMPLE_NEWS.title, status: "DRAFT" as const };

    // Act
    const created = await AdminNewsService.createNews(payload);

    // Assert
    expect(created).toEqual(SAMPLE_NEWS);
    expect(postMock).toHaveBeenCalledWith("/admin/news", payload); // MOCK
  });

  it("updateNews() sukses & gagal mengembalikan status boolean yang sesuai", async () => {
    // Arrange
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    putMock
      .mockResolvedValueOnce({ data: { success: true } })
      .mockRejectedValueOnce(new Error("500"));

    // Act
    const ok = await AdminNewsService.updateNews("news-1", { title: "Judul Baru" });
    const fail = await AdminNewsService.updateNews("news-1", { title: "Judul Baru" });

    // Assert
    expect(ok).toEqual({ success: true });
    expect(fail).toEqual({ success: false });
    expect(putMock).toHaveBeenCalledWith("/admin/news/news-1", { title: "Judul Baru" });
    expect(errSpy).toHaveBeenCalledTimes(1);
  });

  it("updateNewsStatus() mengubah status ke PUBLISHED dan menangani error", async () => {
    // Arrange
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    patchMock
      .mockResolvedValueOnce({ data: { success: true } })
      .mockRejectedValueOnce(new Error("500"));

    // Act
    const ok = await AdminNewsService.updateNewsStatus("news-1", "PUBLISHED");
    const fail = await AdminNewsService.updateNewsStatus("news-1", "REJECTED");

    // Assert
    expect(ok).toEqual({ success: true });
    expect(fail).toEqual({ success: false });
    expect(patchMock).toHaveBeenCalledWith("/admin/news/news-1/status", {
      status: "PUBLISHED",
    });
    expect(errSpy).toHaveBeenCalledTimes(1);
  });

  it("deleteNews() menghapus berita via DELETE dan menangani error", async () => {
    // Arrange
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    deleteMock
      .mockResolvedValueOnce({ data: { success: true } })
      .mockRejectedValueOnce(new Error("500"));

    // Act
    const ok = await AdminNewsService.deleteNews("news-1");
    const fail = await AdminNewsService.deleteNews("news-1");

    // Assert
    expect(ok).toEqual({ success: true });
    expect(fail).toEqual({ success: false });
    expect(deleteMock).toHaveBeenCalledWith("/admin/news/news-1");
    expect(errSpy).toHaveBeenCalledTimes(1);
  });

  it("createCategory() sukses, data undefined (null), dan error API", async () => {
    // Arrange
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    postMock
      .mockResolvedValueOnce({ data: { data: SAMPLE_CATEGORIES[0] } })
      .mockResolvedValueOnce({ data: {} })
      .mockRejectedValueOnce(new Error("Duplicate"));

    // Act
    const ok = await AdminNewsService.createCategory({ name: "Kegiatan Desa" });
    const empty = await AdminNewsService.createCategory({ name: "Kosong" });
    const fail = await AdminNewsService.createCategory({ name: "Duplikat" });

    // Assert
    expect(ok).toEqual(SAMPLE_CATEGORIES[0]);
    expect(empty).toBeNull();
    expect(fail).toBeNull();
    expect(errSpy).toHaveBeenCalledTimes(1);
  });
});
