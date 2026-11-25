/**
 * Unit Test — AdminSettingsService (Fitur 8: Pengaturan Informasi Transparansi — RQ-008 / FS-008)
 *
 * Target utama : AdminSettingsService.getSettings() + updateSettings() & storage helpers
 *                (src/entities/admin/api/admin-settings.service.ts)
 * Pola         : Arrange – Act – Assert (AAA)
 *
 * Test Double yang dipakai:
 *  1. STUB  → `apiClient.get` / `apiClient.put` (respons snake_case, camelCase, alias pendek
 *             `phone`/`email`, kosong, error), flag `IS_API_CONNECTED`, dan `window = undefined` (SSR).
 *  2. MOCK  → `apiClient.get/put` diverifikasi endpoint "/admin/settings" & payload kontak WA,
 *             serta callback subscriber (`vi.fn()`) diverifikasi pemanggilannya.
 *  3. SPY   → `vi.spyOn(fakeStorage, "setItem")`, `vi.spyOn(window, "addEventListener")`,
 *             `vi.spyOn(window, "removeEventListener")`, dan `vi.spyOn(console, "error")`.
 *  4. FAKE  → `FakeLocalStorage` (implementasi Storage berbasis Map in-memory yang bekerja penuh).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

let mockIsApiConnected = true;

vi.mock("@/shared/api/axios-instance", () => ({
  get IS_API_CONNECTED() {
    return mockIsApiConnected;
  },
  apiClient: {
    get: vi.fn(),
    put: vi.fn(),
  },
}));

import { apiClient } from "@/shared/api/axios-instance";
import type { AdminSettingsPayload } from "../model/admin.types";
import {
  AdminSettingsService,
  getStoredAdminSettings,
  saveStoredAdminSettings,
  subscribeStoredAdminSettings,
} from "./admin-settings.service";

const LOCAL_STORAGE_KEY = "app_admin_settings_v1";
const getMock = vi.mocked(apiClient.get);
const putMock = vi.mocked(apiClient.put);

/** FAKE: implementasi Storage berbasis Map in-memory. */
class FakeLocalStorage implements Storage {
  private store = new Map<string, string>();
  get length() {
    return this.store.size;
  }
  clear() {
    this.store.clear();
  }
  getItem(key: string) {
    return this.store.get(key) ?? null;
  }
  key(index: number) {
    return Array.from(this.store.keys())[index] ?? null;
  }
  removeItem(key: string) {
    this.store.delete(key);
  }
  setItem(key: string, value: string) {
    this.store.set(key, String(value));
  }
}

let fakeStorage: FakeLocalStorage;

beforeEach(() => {
  mockIsApiConnected = true;
  fakeStorage = new FakeLocalStorage();
  vi.stubGlobal("localStorage", fakeStorage);
  getMock.mockReset();
  putMock.mockReset();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("AdminSettingsService.getSettings() — White-Box Test Cases (Fitur 8)", () => {
  it("TC-01: IS_API_CONNECTED=true & respons snake_case → petakan kontak WA, simpan ke storage (B1, B3)", async () => {
    // Arrange
    getMock.mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          website_name: "Desa Pringgodani Resmi",
          logo_url: "/logo.webp",
          favicon_url: "/fav.webp",
          contact_email: "info@pringgodani.desa.id",
          contact_phone: "081234567890",
          address: "Jl. Raya Pringgodani No. 1",
          social_facebook: "https://fb.com/pringgodani",
          social_instagram: "https://ig.com/pringgodani",
          social_youtube: "https://yt.com/pringgodani",
          social_tiktok: "https://tiktok.com/@pringgodani",
          jumlah_dusun: "5",
        },
      },
    }); // STUB
    const setItemSpy = vi.spyOn(fakeStorage, "setItem"); // SPY pada FAKE

    // Act
    const result = await AdminSettingsService.getSettings();

    // Assert
    expect(getMock).toHaveBeenCalledWith("/admin/settings"); // MOCK
    expect(result).toMatchObject({
      website_name: "Desa Pringgodani Resmi",
      contact_phone: "081234567890",
      contact_email: "info@pringgodani.desa.id",
      jumlah_dusun: 5,
    });
    expect(setItemSpy).toHaveBeenCalledWith(LOCAL_STORAGE_KEY, expect.any(String)); // SPY
    expect(JSON.parse(fakeStorage.getItem(LOCAL_STORAGE_KEY)!).contact_phone).toBe(
      "081234567890",
    );
  });

  it("TC-02: respons camelCase & alias pendek (phone/email/facebook) → dinormalisasi ke skema standar", async () => {
    // Arrange
    getMock
      .mockResolvedValueOnce({
        data: {
          data: {
            websiteName: "Pringgodani Camel",
            logoUrl: "/c-logo.png",
            faviconUrl: "/c-fav.png",
            contactEmail: "camel@pringgodani.desa.id",
            contactPhone: "6281234567890",
            socialFacebook: "fb-camel",
            socialInstagram: "ig-camel",
            socialYoutube: "yt-camel",
            socialTiktok: "tt-camel",
            jumlahDusun: "6",
          },
        },
      })
      .mockResolvedValueOnce({
        data: {
          data: {
            email: "alias@pringgodani.desa.id",
            phone: "085700001111",
            facebook: "fb-alias",
            instagram: "ig-alias",
            youtube: "yt-alias",
            tiktok: "tt-alias",
            jumlah_dusun: "0",
          },
        },
      }); // STUB

    // Act
    const camelRes = await AdminSettingsService.getSettings();
    const aliasRes = await AdminSettingsService.getSettings();

    // Assert
    expect(camelRes.contact_phone).toBe("6281234567890");
    expect(camelRes.jumlah_dusun).toBe(6);
    expect(aliasRes.contact_phone).toBe("085700001111");
    expect(aliasRes.contact_email).toBe("alias@pringgodani.desa.id");
    expect(aliasRes.jumlah_dusun).toBe(6); // fallback ke stored (6) saat "0" falsy
  });

  it("TC-03: respons API berisi data kosong (field undefined) & stored.jumlah_dusun=0 → fallback ke default (4)", async () => {
    // Arrange
    saveStoredAdminSettings({ contact_phone: "081111111111", jumlah_dusun: 0 });
    getMock.mockResolvedValueOnce({ data: { data: {} } }); // STUB

    // Act
    const result = await AdminSettingsService.getSettings();

    // Assert
    expect(result.contact_phone).toBe("081111111111");
    expect(result.jumlah_dusun).toBe(4);
  });

  it("TC-04: respons API tanpa data.data → kembalikan pengaturan lokal tersimpan (B1, B4)", async () => {
    // Arrange
    saveStoredAdminSettings({ contact_phone: "082222222222" });
    getMock.mockResolvedValueOnce({ data: { success: true } }); // STUB

    // Act
    const result = await AdminSettingsService.getSettings();

    // Assert
    expect(result.contact_phone).toBe("082222222222");
  });

  it("TC-05: API gagal / throw error → mencatat console.error & fallback ke draf lokal (B1, B5)", async () => {
    // Arrange
    const apiErr = new Error("500 Internal Server Error");
    saveStoredAdminSettings({ contact_phone: "083333333333" });
    getMock.mockRejectedValueOnce(apiErr); // STUB
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {}); // SPY

    // Act
    const result = await AdminSettingsService.getSettings();

    // Assert
    expect(result.contact_phone).toBe("083333333333");
    expect(errorSpy).toHaveBeenCalledWith(
      "Gagal memuat pengaturan admin dari API, menggunakan draf tersimpan:",
      apiErr,
    ); // SPY
  });

  it("TC-06: IS_API_CONNECTED=false → lewati panggilan API, langsung kembalikan data lokal (B2)", async () => {
    // Arrange
    mockIsApiConnected = false; // STUB mode offline/mock
    saveStoredAdminSettings({ contact_phone: "084444444444" });

    // Act
    const result = await AdminSettingsService.getSettings();

    // Assert
    expect(getMock).not.toHaveBeenCalled(); // MOCK
    expect(result.contact_phone).toBe("084444444444");
  });
});

describe("AdminSettingsService — updateSettings & storage/subscriber helpers", () => {
  const samplePayload: AdminSettingsPayload = {
    website_name: "Desa Pringgodani",
    logo_url: "/logo.png",
    favicon_url: "/fav.png",
    contact_email: "info@pringgodani.desa.id",
    contact_phone: "081234567890",
    address: "Balai Desa Pringgodani",
    social_facebook: "",
    social_instagram: "",
    social_youtube: "",
    social_tiktok: "",
    jumlah_dusun: 4,
  };

  it("updateSettings() sukses dengan pesan kustom, pesan default, dan gagal saat API error", async () => {
    // Arrange
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {}); // SPY
    putMock
      .mockResolvedValueOnce({ data: { message: "Kontak WhatsApp tersimpan!" } })
      .mockResolvedValueOnce({ data: {} })
      .mockRejectedValueOnce(new Error("Network fail")); // STUB

    // Act
    const okCustom = await AdminSettingsService.updateSettings(samplePayload);
    const okDefault = await AdminSettingsService.updateSettings(samplePayload);
    const failed = await AdminSettingsService.updateSettings(samplePayload);

    // Assert
    expect(putMock).toHaveBeenCalledWith("/admin/settings", samplePayload); // MOCK
    expect(okCustom).toEqual({ success: true, message: "Kontak WhatsApp tersimpan!" });
    expect(okDefault).toEqual({
      success: true,
      message: "Pengaturan desa berhasil diperbarui.",
    });
    expect(failed).toEqual({
      success: false,
      message: "Gagal menyimpan pengaturan. Silakan coba lagi.",
    });
    expect(errSpy).toHaveBeenCalledTimes(1);
  });

  it("subscribeStoredAdminSettings & saveStoredAdminSettings memanggil listener, isolasi listener error, dan cleanup", () => {
    // Arrange
    const addSpy = vi.spyOn(window, "addEventListener"); // SPY
    const removeSpy = vi.spyOn(window, "removeEventListener"); // SPY
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {}); // SPY
    const goodListener = vi.fn(); // MOCK
    const badListener = vi.fn(() => {
      throw new Error("Subscriber crash");
    });

    // Act
    const unsubGood = subscribeStoredAdminSettings(goodListener);
    const unsubBad = subscribeStoredAdminSettings(badListener);
    saveStoredAdminSettings({ contact_phone: "089988776655" });
    unsubGood();
    unsubBad();

    // Assert
    expect(addSpy).toHaveBeenCalledWith("storage", goodListener);
    expect(goodListener).toHaveBeenCalledTimes(1);
    expect(badListener).toHaveBeenCalledTimes(1);
    expect(errSpy).toHaveBeenCalledWith(
      "Error in admin settings subscriber:",
      expect.any(Error),
    );
    expect(removeSpy).toHaveBeenCalledWith("storage", goodListener);
  });

  it("storage helpers aman terhadap JSON korup, kegagalan setItem, dan lingkungan SSR (window undefined)", () => {
    // Arrange — JSON korup di FakeLocalStorage
    fakeStorage.setItem(LOCAL_STORAGE_KEY, "{not-valid-json");
    const fromCorrupt = getStoredAdminSettings();

    // Arrange — setItem melempar QuotaExceededError
    vi.spyOn(fakeStorage, "setItem").mockImplementationOnce(() => {
      throw new Error("QuotaExceededError");
    });
    const fromQuotaErr = saveStoredAdminSettings({ contact_phone: "0812" });

    // Arrange — lingkungan SSR
    vi.stubGlobal("window", undefined); // STUB SSR
    const ssrGet = getStoredAdminSettings();
    const ssrSave = saveStoredAdminSettings({ contact_phone: "0812" });
    const unsubSsr = subscribeStoredAdminSettings(() => {});
    unsubSsr();

    // Assert
    expect(fromCorrupt.website_name).toBe("Desa Pringgodani");
    expect(fromQuotaErr.website_name).toBe("Desa Pringgodani");
    expect(ssrGet.website_name).toBe("Desa Pringgodani");
    expect(ssrSave.website_name).toBe("Desa Pringgodani");
  });
});
