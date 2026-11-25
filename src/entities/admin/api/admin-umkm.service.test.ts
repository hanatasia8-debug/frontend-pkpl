/**
 * Unit Test — AdminUmkmService (Fitur 5: Manajemen Produk UMKM CRUD — RQ-005 / FS-005)
 *
 * Target utama : AdminUmkmService.getCategories() + seluruh operasi CRUD UMKM & Produk
 *                (src/entities/admin/api/admin-umkm.service.ts)
 * Pola         : Arrange – Act – Assert (AAA)
 *
 * Test Double yang dipakai:
 *  1. STUB  → `apiClient.get/post/put/patch/delete` diprogram mengembalikan respons kalengan
 *             (daftar UMKM beserta produk & harga non-negatif, data kosong, dan error).
 *  2. MOCK  → `apiClient` diverifikasi endpoint, query string status, dan payload produk/harga.
 *  3. SPY   → `vi.spyOn(console, "warn")` & `vi.spyOn(console, "error")` merekam log fallback
 *             dan pencatatan galat API.
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
import type { AdminCategoryItem, AdminUmkmItem } from "../model/admin.types";
import { AdminUmkmService } from "./admin-umkm.service";

const getMock = vi.mocked(apiClient.get);
const postMock = vi.mocked(apiClient.post);
const putMock = vi.mocked(apiClient.put);
const patchMock = vi.mocked(apiClient.patch);
const deleteMock = vi.mocked(apiClient.delete);

const SAMPLE_UMKM_CATEGORIES: AdminCategoryItem[] = [
  { id: "umkm-cat-1", name: "Kuliner", slug: "kuliner" },
  { id: "umkm-cat-2", name: "Kerajinan", slug: "kerajinan" },
];

const SAMPLE_UMKM: AdminUmkmItem = {
  id: "umkm-1",
  name: "Keripik Singkong Berkah",
  slug: "keripik-singkong-berkah",
  ownerName: "Ibu Siti",
  categoryName: "Kuliner",
  phone: "081234567890",
  address: "Dusun Krajan RT 02/RW 01",
  status: "PUBLISHED",
  products: [
    { name: "Sampel Promosi", price: 0, description: "Gratis cicip" },
    { name: "Keripik Balado 250g", price: 25000, description: "Gurih pedas" },
  ],
};

afterEach(() => {
  vi.restoreAllMocks();
  getMock.mockReset();
  postMock.mockReset();
  putMock.mockReset();
  patchMock.mockReset();
  deleteMock.mockReset();
});

describe("AdminUmkmService.getCategories() — White-Box Test Cases (Fitur 5)", () => {
  it("TC-01: endpoint kategori UMKM admin sukses dengan items → kembalikan daftar tanpa fallback (B1, B3)", async () => {
    // Arrange
    getMock.mockResolvedValueOnce({
      data: { success: true, data: { items: SAMPLE_UMKM_CATEGORIES } },
    }); // STUB
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {}); // SPY

    // Act
    const result = await AdminUmkmService.getCategories();

    // Assert
    expect(result).toEqual(SAMPLE_UMKM_CATEGORIES);
    expect(getMock).toHaveBeenCalledTimes(1); // MOCK
    expect(getMock).toHaveBeenCalledWith("/admin/umkm/categories");
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it("TC-02: endpoint admin sukses tanpa properti items → kembalikan array kosong (B1, B4)", async () => {
    // Arrange
    getMock.mockResolvedValueOnce({ data: { success: true, data: {} } }); // STUB

    // Act
    const result = await AdminUmkmService.getCategories();

    // Assert
    expect(result).toEqual([]);
    expect(getMock).toHaveBeenCalledTimes(1); // MOCK
  });

  it("TC-03: endpoint admin error → fallback ke /public/umkm/categories?all=true sukses (B2, B5, B7)", async () => {
    // Arrange
    const adminErr = new Error("Unauthorized");
    getMock
      .mockRejectedValueOnce(adminErr)
      .mockResolvedValueOnce({
        data: { success: true, data: { items: SAMPLE_UMKM_CATEGORIES } },
      }); // STUB
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {}); // SPY

    // Act
    const result = await AdminUmkmService.getCategories();

    // Assert
    expect(result).toEqual(SAMPLE_UMKM_CATEGORIES);
    expect(getMock).toHaveBeenNthCalledWith(1, "/admin/umkm/categories"); // MOCK
    expect(getMock).toHaveBeenNthCalledWith(2, "/public/umkm/categories?all=true"); // MOCK
    expect(warnSpy).toHaveBeenCalledWith(
      "Gagal memuat kategori UMKM admin, fallback ke public:",
      adminErr,
    );
  });

  it("TC-04: endpoint admin error, fallback publik tanpa items → kembalikan [] (B2, B5, B8)", async () => {
    // Arrange
    getMock
      .mockRejectedValueOnce(new Error("Admin error"))
      .mockResolvedValueOnce({ data: { success: true, data: null } }); // STUB
    vi.spyOn(console, "warn").mockImplementation(() => {});

    // Act
    const result = await AdminUmkmService.getCategories();

    // Assert
    expect(result).toEqual([]);
  });

  it("TC-05: endpoint admin & fallback publik keduanya error → log warn+error & return [] (B2, B6)", async () => {
    // Arrange
    const fallbackErr = new Error("Public API down");
    getMock
      .mockRejectedValueOnce(new Error("Admin API down"))
      .mockRejectedValueOnce(fallbackErr); // STUB
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {}); // SPY
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {}); // SPY

    // Act
    const result = await AdminUmkmService.getCategories();

    // Assert
    expect(result).toEqual([]);
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(errorSpy).toHaveBeenCalledWith("Gagal memuat kategori UMKM:", fallbackErr);
  });
});

describe("AdminUmkmService — operasi CRUD UMKM & produk (supplementary)", () => {
  it("getAllUmkm() mendukung default status='ALL', filter status spesifik, data kosong, dan error", async () => {
    // Arrange
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    getMock
      .mockResolvedValueOnce({ data: { data: { items: [SAMPLE_UMKM], total: 1 } } })
      .mockResolvedValueOnce({ data: {} })
      .mockRejectedValueOnce(new Error("Timeout"));

    // Act
    const allRes = await AdminUmkmService.getAllUmkm();
    const pendingRes = await AdminUmkmService.getAllUmkm("PENDING");
    const errRes = await AdminUmkmService.getAllUmkm("PUBLISHED");

    // Assert
    expect(allRes).toEqual({ items: [SAMPLE_UMKM], total: 1 });
    expect(pendingRes).toEqual({ items: [], total: 0 });
    expect(errRes).toEqual({ items: [], total: 0 });
    expect(getMock).toHaveBeenNthCalledWith(1, "/admin/umkm?status=ALL&limit=1000"); // MOCK
    expect(getMock).toHaveBeenNthCalledWith(2, "/admin/umkm?status=PENDING&limit=1000"); // MOCK
    expect(errSpy).toHaveBeenCalledTimes(1);
  });

  it("createUmkm() mengirim payload UMKM beserta produk berharga 0 dan 25000 ke POST /admin/umkm", async () => {
    // Arrange
    postMock.mockResolvedValueOnce({ data: { data: SAMPLE_UMKM } }); // STUB
    const payload: Partial<AdminUmkmItem> = {
      name: SAMPLE_UMKM.name,
      products: SAMPLE_UMKM.products,
    };

    // Act
    const created = await AdminUmkmService.createUmkm(payload);

    // Assert
    expect(created).toEqual(SAMPLE_UMKM);
    expect(postMock).toHaveBeenCalledWith("/admin/umkm", payload); // MOCK
  });

  it("getUmkmById() sukses, data kosong, dan error API", async () => {
    // Arrange
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    getMock
      .mockResolvedValueOnce({ data: { data: SAMPLE_UMKM } })
      .mockResolvedValueOnce({ data: {} })
      .mockRejectedValueOnce(new Error("404"));

    // Act
    const ok = await AdminUmkmService.getUmkmById("umkm-1");
    const empty = await AdminUmkmService.getUmkmById("umkm-2");
    const fail = await AdminUmkmService.getUmkmById("umkm-3");

    // Assert
    expect(ok).toEqual(SAMPLE_UMKM);
    expect(empty).toBeNull();
    expect(fail).toBeNull();
    expect(errSpy).toHaveBeenCalledTimes(1);
  });

  it("updateUmkm() memperbarui produk/harga via PUT dan menangani error", async () => {
    // Arrange
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    putMock
      .mockResolvedValueOnce({ data: { success: true } })
      .mockRejectedValueOnce(new Error("500"));
    const updatedPayload = {
      products: [{ name: "Keripik Balado 500g", price: 45000 }],
    };

    // Act
    const ok = await AdminUmkmService.updateUmkm("umkm-1", updatedPayload);
    const fail = await AdminUmkmService.updateUmkm("umkm-1", updatedPayload);

    // Assert
    expect(ok).toEqual({ success: true });
    expect(fail).toEqual({ success: false });
    expect(putMock).toHaveBeenCalledWith("/admin/umkm/umkm-1", updatedPayload); // MOCK
    expect(errSpy).toHaveBeenCalledTimes(1);
  });

  it("updateUmkmStatus() & deleteUmkm() sukses maupun gagal mengembalikan boolean akurat", async () => {
    // Arrange
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    patchMock
      .mockResolvedValueOnce({ data: { success: true } })
      .mockRejectedValueOnce(new Error("500"));
    deleteMock
      .mockResolvedValueOnce({ data: { success: true } })
      .mockRejectedValueOnce(new Error("500"));

    // Act
    const statusOk = await AdminUmkmService.updateUmkmStatus("umkm-1", "PUBLISHED");
    const statusFail = await AdminUmkmService.updateUmkmStatus("umkm-1", "REJECTED");
    const delOk = await AdminUmkmService.deleteUmkm("umkm-1");
    const delFail = await AdminUmkmService.deleteUmkm("umkm-1");

    // Assert
    expect(statusOk).toEqual({ success: true });
    expect(statusFail).toEqual({ success: false });
    expect(delOk).toEqual({ success: true });
    expect(delFail).toEqual({ success: false });
    expect(errSpy).toHaveBeenCalledTimes(2);
  });

  it("createCategory() sukses, data undefined, dan error API", async () => {
    // Arrange
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    postMock
      .mockResolvedValueOnce({ data: { data: SAMPLE_UMKM_CATEGORIES[0] } })
      .mockResolvedValueOnce({ data: {} })
      .mockRejectedValueOnce(new Error("Conflict"));

    // Act
    const ok = await AdminUmkmService.createCategory({ name: "Kuliner" });
    const empty = await AdminUmkmService.createCategory({ name: "Kosong" });
    const fail = await AdminUmkmService.createCategory({ name: "Konflik" });

    // Assert
    expect(ok).toEqual(SAMPLE_UMKM_CATEGORIES[0]);
    expect(empty).toBeNull();
    expect(fail).toBeNull();
    expect(errSpy).toHaveBeenCalledTimes(1);
  });
});
