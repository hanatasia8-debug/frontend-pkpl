import { apiClient } from "@/shared/api/axios-instance";

/**
 * AdminAuthService — client-side security session manager for Pringgodani Admin Panel.
 */

const SESSION_KEY = "pringgodani_admin_session";
const TOKEN_KEY = "pringgodani_admin_access_token";

export interface AdminUser {
  name: string;
  email: string;
  role: string;
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const nameEQ = name + "=";
  const ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

export const AdminAuthService = {
  async login(
    usernameInput: string,
    passwordInput: string,
  ): Promise<{ success: boolean; message?: string; user?: AdminUser }> {
    const cleanUser = usernameInput.trim().toLowerCase();
    const cleanPass = passwordInput.trim();

    try {
      const { data } = await apiClient.post("/auth/login", {
        email: cleanUser,
        password: cleanPass,
      });

      if (data?.success && data?.data) {
        const backendData = data.data;
        const user: AdminUser = {
          name:
            backendData.user_metadata?.name || backendData.name || "Admin Desa",
          email: backendData.email,
          role: "ADMIN",
        };

        if (typeof window !== "undefined") {
          // Store access_token in localStorage
          if (backendData.access_token) {
            localStorage.setItem(TOKEN_KEY, backendData.access_token);
          }

          // Store serialized user inside cookie with max-age
          const serialized = encodeURIComponent(JSON.stringify(user));
          const isSecure = window.location.protocol === "https:";
          const sameSite = isSecure ? "None" : "Lax";
          document.cookie = `${SESSION_KEY}=${serialized}; path=/; max-age=10800; SameSite=${sameSite}${isSecure ? "; Secure" : ""}`;
        }

        return { success: true, user };
      }

      return {
        success: false,
        message:
          "Email atau kata sandi salah atau akun Anda tidak memiliki hak akses admin.",
      };
    } catch (err) {
      const axiosError = err as {
        response?: { status?: number; data?: { message?: string } };
      };

      const rawMessage = axiosError.response?.data?.message || "";
      const status = axiosError.response?.status;

      let message =
        "Gagal menghubungi server autentikasi. Silakan periksa jaringan Anda atau coba beberapa saat lagi.";

      if (
        status === 400 ||
        status === 401 ||
        rawMessage.includes("Invalid login credentials") ||
        rawMessage.includes("credentials")
      ) {
        message =
          "Email atau kata sandi salah atau akun Anda tidak memiliki hak akses admin.";
      } else if (status === 403) {
        message =
          "Akun Anda tidak memiliki izin untuk mengakses halaman admin.";
      }

      return {
        success: false,
        message,
      };
    }
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post("/auth/logout");
    } catch (err) {
      console.error("Logout API error:", err);
    } finally {
      if (typeof window !== "undefined") {
        localStorage.removeItem(TOKEN_KEY);
        document.cookie = `${SESSION_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      }
    }
  },

  getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_KEY);
  },

  isAuthenticated(): boolean {
    if (typeof window === "undefined") return true;
    return !!getCookie(SESSION_KEY) || !!localStorage.getItem(TOKEN_KEY);
  },

  getAdminUser(): AdminUser | null {
    if (typeof window === "undefined") return null;
    try {
      const val = getCookie(SESSION_KEY);
      return val ? JSON.parse(decodeURIComponent(val)) : null;
    } catch {
      return null;
    }
  },
};
