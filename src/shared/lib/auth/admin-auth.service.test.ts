/**
 * Unit Test — AdminAuthService (Modul 4: White-Box & Unit Testing)
 *
 * Target utama : AdminAuthService.login()  (src/shared/lib/auth/admin-auth.service.ts)
 * Pola         : Arrange – Act – Assert (AAA)
 *
 * Test Double yang dipakai:
 *  1. STUB  → `apiClient.post` diprogram mengembalikan respons kalengan (resolve / reject),
 *             serta objek `window` palsu (protokol https / tidak ada window = SSR).
 *  2. MOCK  → `apiClient.post` diverifikasi perilakunya: dipanggil 1x, ke endpoint
 *             "/auth/login", dengan payload email yang sudah di-trim + lowercase.
 *  3. SPY   → `vi.spyOn` pada `localStorage.setItem` dan setter `document.cookie`
 *             untuk merekam efek samping tanpa mengganti perilaku aslinya.
 *  4. FAKE  → `FakeLocalStorage`, implementasi Storage berbasis Map in-memory yang
 *             benar-benar bekerja (pengganti localStorage browser).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// ---------------------------------------------------------------------------
// Isolasi dependensi HTTP: modul axios-instance diganti test double.
// ---------------------------------------------------------------------------
vi.mock("@/shared/api/axios-instance", () => ({
  apiClient: { post: vi.fn() },
}));

import { apiClient } from "@/shared/api/axios-instance";
import { AdminAuthService } from "./admin-auth.service";

const TOKEN_KEY = "pringgodani_admin_access_token";
const SESSION_KEY = "pringgodani_admin_session";
const MSG_INVALID =
  "Email atau kata sandi salah atau akun Anda tidak memiliki hak akses admin.";
const MSG_FORBIDDEN =
  "Akun Anda tidak memiliki izin untuk mengakses halaman admin.";
const MSG_NETWORK =
  "Gagal menghubungi server autentikasi. Silakan periksa jaringan Anda atau coba beberapa saat lagi.";

/** FAKE: implementasi Storage sederhana namun berfungsi penuh (in-memory). */
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

const postMock = vi.mocked(apiClient.post);
let fakeStorage: FakeLocalStorage;

function clearSessionCookie() {
  document.cookie = `${SESSION_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

beforeEach(() => {
  fakeStorage = new FakeLocalStorage();
  vi.stubGlobal("localStorage", fakeStorage);
  clearSessionCookie();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  postMock.mockReset();
  clearSessionCookie();
});

describe("AdminAuthService.login() — White-Box Test Cases", () => {
  it("TC-01: login sukses dengan access_token di HTTP → token & cookie Lax tersimpan (B1, B3, B5, B8, B10)", async () => {
    // Arrange
    postMock.mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          email: "admin@pringgodani.desa.id",
          access_token: "jwt-token-123",
          user_metadata: { name: "Sekdes Pringgodani" },
        },
      },
    }); // STUB: respons sukses kalengan
    const setItemSpy = vi.spyOn(fakeStorage, "setItem"); // SPY pada FAKE storage
    const cookieSpy = vi.spyOn(document, "cookie", "set"); // SPY pada setter cookie

    // Act
    const result = await AdminAuthService.login(
      "  Admin@Pringgodani.Desa.ID ",
      "  Rahasia@2026  ",
    );

    // Assert
    expect(postMock).toHaveBeenCalledTimes(1); // MOCK: verifikasi interaksi
    expect(postMock).toHaveBeenCalledWith("/auth/login", {
      email: "admin@pringgodani.desa.id",
      password: "Rahasia@2026",
    });
    expect(result).toEqual({
      success: true,
      user: {
        name: "Sekdes Pringgodani",
        email: "admin@pringgodani.desa.id",
        role: "ADMIN",
      },
    });
    expect(setItemSpy).toHaveBeenCalledWith(TOKEN_KEY, "jwt-token-123");
    expect(fakeStorage.getItem(TOKEN_KEY)).toBe("jwt-token-123");
    const cookieValue = cookieSpy.mock.calls[0][0] as string;
    expect(cookieValue).toContain(`${SESSION_KEY}=`);
    expect(cookieValue).toContain("SameSite=Lax");
    expect(cookieValue).not.toContain("Secure");
  });

  it("TC-02: login sukses tanpa access_token di HTTPS → token tidak disimpan, cookie SameSite=None; Secure (B1, B3, B6, B7, B9)", async () => {
    // Arrange
    postMock.mockResolvedValueOnce({
      data: {
        success: true,
        data: { email: "operator@pringgodani.desa.id", name: "Operator Desa" },
      },
    }); // STUB: sukses tanpa token
    vi.stubGlobal("window", { location: { protocol: "https:" } }); // STUB: window HTTPS
    const setItemSpy = vi.spyOn(fakeStorage, "setItem"); // SPY
    const cookieSpy = vi.spyOn(document, "cookie", "set"); // SPY

    // Act
    const result = await AdminAuthService.login(
      "operator@pringgodani.desa.id",
      "Operator@2026",
    );

    // Assert
    expect(result.success).toBe(true);
    expect(result.user?.name).toBe("Operator Desa");
    expect(setItemSpy).not.toHaveBeenCalled();
    expect(fakeStorage.getItem(TOKEN_KEY)).toBeNull();
    const cookieValue = cookieSpy.mock.calls[0][0] as string;
    expect(cookieValue).toContain("SameSite=None");
    expect(cookieValue).toContain("; Secure");
  });

  it("TC-03: login sukses di lingkungan server/SSR (window undefined) → tidak menyentuh storage & cookie (B1, B4)", async () => {
    // Arrange
    postMock.mockResolvedValueOnce({
      data: {
        success: true,
        data: { email: "ssr@pringgodani.desa.id", access_token: "ssr-token" },
      },
    }); // STUB
    vi.stubGlobal("window", undefined); // STUB: simulasi SSR
    const setItemSpy = vi.spyOn(fakeStorage, "setItem"); // SPY
    const cookieSpy = vi.spyOn(document, "cookie", "set"); // SPY

    // Act
    const result = await AdminAuthService.login(
      "ssr@pringgodani.desa.id",
      "ServerSide@1",
    );

    // Assert
    expect(result).toEqual({
      success: true,
      user: { name: "Admin Desa", email: "ssr@pringgodani.desa.id", role: "ADMIN" },
    });
    expect(setItemSpy).not.toHaveBeenCalled();
    expect(cookieSpy).not.toHaveBeenCalled();
  });

  it("TC-04: backend merespons success=false → login ditolak dengan pesan kredensial (B2)", async () => {
    // Arrange
    postMock.mockResolvedValueOnce({ data: { success: false, data: null } }); // STUB

    // Act
    const result = await AdminAuthService.login("admin@desa.id", "SalahSandi1");

    // Assert
    expect(result).toEqual({ success: false, message: MSG_INVALID });
    expect(fakeStorage.getItem(TOKEN_KEY)).toBeNull();
  });

  it("TC-05: backend melempar HTTP 401 → pesan kredensial salah (B11)", async () => {
    // Arrange
    postMock.mockRejectedValueOnce({
      response: { status: 401, data: { message: "Unauthorized" } },
    }); // STUB: error 401

    // Act
    const result = await AdminAuthService.login("admin@desa.id", "SalahSandi1");

    // Assert
    expect(result).toEqual({ success: false, message: MSG_INVALID });
  });

  it("TC-06: backend melempar HTTP 403 → pesan tidak memiliki izin (B12, B13)", async () => {
    // Arrange
    postMock.mockRejectedValueOnce({
      response: { status: 403, data: { message: "Forbidden" } },
    }); // STUB: error 403

    // Act
    const result = await AdminAuthService.login("warga@desa.id", "BukanAdmin1");

    // Assert
    expect(result).toEqual({ success: false, message: MSG_FORBIDDEN });
  });

  it("TC-07: gangguan jaringan (tanpa response) → pesan gagal menghubungi server (B12, B14)", async () => {
    // Arrange
    postMock.mockRejectedValueOnce(new Error("Network Error")); // STUB: network error

    // Act
    const result = await AdminAuthService.login("admin@desa.id", "Rahasia@2026");

    // Assert
    expect(result).toEqual({ success: false, message: MSG_NETWORK });
  });

  // Kasus tambahan untuk menutup sub-kondisi (short-circuit) pada decision D6.
  it.each([
    ["HTTP 400", { response: { status: 400, data: {} } }],
    [
      "pesan 'Invalid login credentials' (HTTP 500)",
      { response: { status: 500, data: { message: "Invalid login credentials" } } },
    ],
    [
      "pesan mengandung 'credentials' (HTTP 422)",
      { response: { status: 422, data: { message: "Bad credentials supplied" } } },
    ],
  ])("TC-08: %s → dipetakan ke pesan kredensial salah (B11)", async (_label, error) => {
    // Arrange
    postMock.mockRejectedValueOnce(error); // STUB

    // Act
    const result = await AdminAuthService.login("admin@desa.id", "Rahasia@2026");

    // Assert
    expect(result).toEqual({ success: false, message: MSG_INVALID });
  });
});

describe("AdminAuthService — metode sesi pendukung (supplementary)", () => {
  it("logout() sukses → memanggil /auth/logout lalu menghapus token & cookie", async () => {
    // Arrange
    postMock.mockResolvedValueOnce({ data: { success: true } }); // STUB
    fakeStorage.setItem(TOKEN_KEY, "jwt-token-123");
    const removeSpy = vi.spyOn(fakeStorage, "removeItem"); // SPY

    // Act
    await AdminAuthService.logout();

    // Assert
    expect(postMock).toHaveBeenCalledWith("/auth/logout"); // MOCK
    expect(removeSpy).toHaveBeenCalledWith(TOKEN_KEY);
    expect(fakeStorage.getItem(TOKEN_KEY)).toBeNull();
  });

  it("logout() saat API gagal → error dicatat dan sesi lokal tetap dibersihkan", async () => {
    // Arrange
    postMock.mockRejectedValueOnce(new Error("Server down")); // STUB
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {}); // SPY
    fakeStorage.setItem(TOKEN_KEY, "jwt-token-123");

    // Act
    await AdminAuthService.logout();

    // Assert
    expect(consoleSpy).toHaveBeenCalledWith("Logout API error:", expect.any(Error));
    expect(fakeStorage.getItem(TOKEN_KEY)).toBeNull();
  });

  it("logout() di SSR → tidak menyentuh storage", async () => {
    // Arrange
    postMock.mockResolvedValueOnce({ data: {} }); // STUB
    vi.stubGlobal("window", undefined); // STUB
    const removeSpy = vi.spyOn(fakeStorage, "removeItem"); // SPY

    // Act
    await AdminAuthService.logout();

    // Assert
    expect(removeSpy).not.toHaveBeenCalled();
  });

  it("getToken() mengembalikan token dari storage, dan null di SSR", () => {
    // Arrange
    fakeStorage.setItem(TOKEN_KEY, "abc");

    // Act
    const browserToken = AdminAuthService.getToken();
    vi.stubGlobal("window", undefined);
    const ssrToken = AdminAuthService.getToken();

    // Assert
    expect(browserToken).toBe("abc");
    expect(ssrToken).toBeNull();
  });

  it("isAuthenticated() → true via cookie, true via token, false bila kosong, true di SSR", () => {
    // Arrange
    const results: boolean[] = [];

    // Act
    results.push(AdminAuthService.isAuthenticated()); // kosong
    fakeStorage.setItem(TOKEN_KEY, "abc");
    results.push(AdminAuthService.isAuthenticated()); // token
    fakeStorage.clear();
    document.cookie = `other=1; path=/`;
    document.cookie = `${SESSION_KEY}=x; path=/`;
    results.push(AdminAuthService.isAuthenticated()); // cookie
    vi.stubGlobal("window", undefined);
    results.push(AdminAuthService.isAuthenticated()); // SSR

    // Assert
    expect(results).toEqual([false, true, true, true]);
    document.cookie = `other=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  });

  it("isAuthenticated() tanpa objek document → getCookie() aman mengembalikan null", () => {
    // Arrange
    document.cookie = `${SESSION_KEY}=x; path=/`;
    vi.stubGlobal("document", undefined); // STUB: lingkungan tanpa DOM document

    // Act
    const withoutToken = AdminAuthService.isAuthenticated();
    fakeStorage.setItem(TOKEN_KEY, "abc");
    const withToken = AdminAuthService.isAuthenticated();

    // Assert
    expect(withoutToken).toBe(false); // cookie diabaikan karena document tidak ada
    expect(withToken).toBe(true);
  });

  it("getAdminUser() → parse cookie valid, null bila kosong/rusak, null di SSR", () => {
    // Arrange
    const user = { name: "Admin Desa", email: "a@desa.id", role: "ADMIN" };
    const results: unknown[] = [];

    // Act
    results.push(AdminAuthService.getAdminUser()); // kosong
    document.cookie = `${SESSION_KEY}=${encodeURIComponent(JSON.stringify(user))}; path=/`;
    results.push(AdminAuthService.getAdminUser()); // valid
    document.cookie = `${SESSION_KEY}=%7Bbukan-json; path=/`;
    results.push(AdminAuthService.getAdminUser()); // rusak → catch
    vi.stubGlobal("window", undefined);
    results.push(AdminAuthService.getAdminUser()); // SSR

    // Assert
    expect(results).toEqual([null, user, null, null]);
  });
});
