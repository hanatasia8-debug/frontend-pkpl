"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Icon } from "@/shared/ui/icon";
import { AdminAuthService } from "@/shared/lib/auth/admin-auth.service";

export default function AdminLoginPage() {
  const router = useRouter();
  const passwordInputRef = useRef<HTMLInputElement>(null);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "verifying" | "redirecting" | "error">("idle");

  const isBusy = status === "verifying" || status === "redirecting";

  // Prefetch admin dashboard for instant transition
  useEffect(() => {
    try {
      router.prefetch("/admin/dashboard");
    } catch {
      // Ignore in unsupported environments
    }

    if (AdminAuthService.isAuthenticated()) {
      router.replace("/admin/dashboard");
    }
  }, [router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isBusy) return;

    const nextErrors: Record<string, string> = {};
    const isDevelopmentAdminAlias =
      process.env.NODE_ENV === "development" &&
      username.trim().toLowerCase() === "admin";
    if (!username.trim()) {
      nextErrors.username = "Email wajib diisi.";
    } else if (
      !isDevelopmentAdminAlias &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(username)
    ) {
      nextErrors.username = "Masukkan alamat email dengan format yang valid.";
    }
    if (!password) {
      nextErrors.password = "Kata sandi wajib diisi.";
    } else if (password.length < 8) {
      nextErrors.password = "Kata sandi minimal 8 karakter.";
    }

    setFieldErrors(nextErrors);
    setErrorMsg(null);
    setSuccessMsg(null);
    if (Object.keys(nextErrors).length > 0) {
      setStatus("error");
      if (nextErrors.username) {
        document.getElementById("username")?.focus();
      } else {
        passwordInputRef.current?.focus();
      }
      return;
    }

    setStatus("verifying");
    try {
      const result = await AdminAuthService.login(username, password);

      if (!result.success) {
        setStatus("error");
        setErrorMsg(result.message || "Gagal masuk. Periksa email dan kata sandi Anda.");
        passwordInputRef.current?.focus();
        return;
      }

      setStatus("redirecting");
      setSuccessMsg("Login berhasil. Mengalihkan ke dashboard admin...");
      router.replace("/admin/dashboard");
      router.refresh();
    } catch (error) {
      console.error("Gagal memproses login admin:", error);
      setStatus("error");
      setErrorMsg("Tidak dapat terhubung ke server autentikasi. Coba lagi.");
    }
  };

  return (
    <div className="flex min-h-[85vh] items-center justify-center py-12 px-4 sm:px-6">
      <div className="border-outline-variant/30 bg-surface-container-lowest text-on-surface relative w-full max-w-md overflow-hidden rounded-[2.5rem] border p-8 shadow-2xl transition-all duration-300">
        
        {/* Animated Progress Indicator Bar during verification / redirecting */}
        {isBusy && (
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-primary/20 overflow-hidden">
            <div
              className={`h-full bg-primary transition-all duration-500 ${
                status === "redirecting"
                  ? "w-full animate-none bg-emerald-500"
                  : "w-1/2 animate-[progress_1.2s_ease-in-out_infinite]"
              }`}
            />
          </div>
        )}

        {/* Header Branding */}
        <div className="space-y-3 text-center">
          <div className="bg-primary/10 text-primary mx-auto flex h-16 w-16 items-center justify-center rounded-2xl shadow-xs transition-transform duration-300">
            <Icon name="admin_panel_settings" className="text-3xl" />
          </div>
          <div>
            <h2 className="font-headline-md text-headline-md text-primary text-2xl font-bold tracking-tight">
              Panel Admin Lokal Pringgodani
            </h2>
            <p className="font-body-base text-on-surface-variant mt-1.5 text-xs sm:text-sm leading-relaxed">
              Masuk untuk mengelola direktori UMKM, hasil bumi, warta desa, peta, dan pengajuan warga.
            </p>
          </div>
        </div>

        {/* Error Feedback Box */}
        {errorMsg && (
          <div className="bg-error-container text-on-error-container mt-6 flex items-start gap-3 rounded-2xl p-4 text-xs sm:text-sm font-medium animate-in fade-in slide-in-from-top-2 duration-200 border border-error/20">
            <Icon name="error" className="text-xl shrink-0 mt-0.5" />
            <span className="leading-snug">{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-xs font-semibold text-emerald-800">
            {successMsg}
          </div>
        )}

        {/* Success Redirecting Feedback Box */}
        {status === "redirecting" && (
          <div className="bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 mt-6 flex items-center gap-3 rounded-2xl p-4 text-xs sm:text-sm font-bold animate-in fade-in zoom-in-95 duration-200 border border-emerald-500/20">
            <Icon name="check_circle" className="text-xl text-emerald-600 dark:text-emerald-400 shrink-0 animate-bounce" />
            <span>Kredensial valid! Memuat dashboard admin...</span>
          </div>
        )}

        {/* Form Controls */}
        <form
          className="mt-6 space-y-4"
          onSubmit={handleSubmit}
          onInvalid={(event) => {
            const field = event.target;
            if (field instanceof HTMLInputElement) {
              setFieldErrors((previous) => ({
                ...previous,
                [field.id]: field.validationMessage,
              }));
            }
          }}
        >
          <div>
            <label
              className="font-label-sm text-on-surface-variant mb-1.5 block text-xs font-bold uppercase tracking-wider"
              htmlFor="username"
            >
              Username / Email Admin
            </label>
            <div className="relative">
              <span className="text-on-surface-variant absolute inset-y-0 left-4 flex items-center">
                <Icon name="person" className="text-lg" />
              </span>
              <input
                id="username"
                type="text"
                required
                minLength={5}
                maxLength={50}
                disabled={isBusy}
                value={username}
                onChange={(e) => {
                  const value = e.target.value;
                  setUsername(value);
                  const isDevelopmentAlias =
                    process.env.NODE_ENV === "development" &&
                    value.trim().toLowerCase() === "admin";
                  setFieldErrors((previous) => ({
                    ...previous,
                    username: !value.trim()
                      ? "Email wajib diisi."
                      : isDevelopmentAlias ||
                          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
                        ? ""
                        : "Masukkan alamat email dengan format yang valid.",
                  }));
                  setSuccessMsg(null);
                }}
                className="bg-surface border-outline-variant text-on-surface focus:border-primary w-full rounded-2xl border py-3.5 pr-4 pl-11 text-sm transition outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                placeholder="Admin (development) atau email admin"
                autoComplete="username"
              />
            </div>
            {fieldErrors.username && (
              <p className="mt-1.5 text-xs font-semibold text-red-600">{fieldErrors.username}</p>
            )}
          </div>

          <div>
            <label
              className="font-label-sm text-on-surface-variant mb-1.5 block text-xs font-bold uppercase tracking-wider"
              htmlFor="password"
            >
              Kata Sandi
            </label>
            <div className="relative">
              <span className="text-on-surface-variant absolute inset-y-0 left-4 flex items-center">
                <Icon name="lock" className="text-lg" />
              </span>
              <input
                ref={passwordInputRef}
                id="password"
                type={showPassword ? "text" : "password"}
                required
                minLength={8}
                maxLength={50}
                disabled={isBusy}
                value={password}
                onChange={(e) => {
                  const value = e.target.value;
                  setPassword(value);
                  setFieldErrors((previous) => ({
                    ...previous,
                    password: !value
                      ? "Kata sandi wajib diisi."
                      : value.length < 8
                        ? "Kata sandi minimal 8 karakter."
                        : "",
                  }));
                  setSuccessMsg(null);
                }}
                className="bg-surface border-outline-variant text-on-surface focus:border-primary w-full rounded-2xl border py-3.5 pr-11 pl-11 text-sm transition outline-none disabled:opacity-60 disabled:cursor-not-allowed font-mono"
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <button
                type="button"
                disabled={isBusy}
                onClick={() => setShowPassword(!showPassword)}
                className="text-on-surface-variant hover:text-primary absolute inset-y-0 right-4 flex items-center transition disabled:opacity-50"
                title={
                  showPassword
                    ? "Sembunyikan Kata Sandi"
                    : "Tampilkan Kata Sandi"
                }
              >
                <Icon
                  name={showPassword ? "visibility_off" : "visibility"}
                  className="text-lg"
                />
              </button>
            </div>
            {fieldErrors.password && (
              <p className="mt-1.5 text-xs font-semibold text-red-600">{fieldErrors.password}</p>
            )}
          </div>

          {/* Action Button with Dynamic State UX */}
          <button
            type="submit"
            disabled={isBusy}
            className={`font-label-sm relative flex w-full items-center justify-center gap-2.5 rounded-2xl py-4 text-sm font-bold shadow-md transition-all duration-200 ${
              status === "redirecting"
                ? "bg-emerald-600 text-white hover:bg-emerald-600 cursor-wait shadow-emerald-600/30"
                : status === "verifying"
                ? "bg-primary/80 text-on-primary cursor-wait"
                : "bg-primary text-on-primary hover:bg-primary/90 active:scale-[0.99]"
            }`}
          >
            {status === "verifying" ? (
              <>
                <Icon name="sync" className="animate-spin text-xl" />
                <span>Memverifikasi Kredensial...</span>
              </>
            ) : status === "redirecting" ? (
              <>
                <Icon name="check_circle" className="text-xl animate-pulse" />
                <span>Login Berhasil! Mengalihkan...</span>
              </>
            ) : (
              <>
                <Icon name="login" className="text-xl" />
                <span>Masuk ke Admin Panel</span>
              </>
            )}
          </button>
        </form>

        {/* Back Link to Public Website */}
        <div className="mt-6 border-t border-outline-variant/20 pt-4 text-center">
          <div className="mb-4 flex justify-center gap-4 text-xs font-semibold">
            <Link href="/admin/forgot-password" className="text-primary hover:underline">
              Lupa kata sandi?
            </Link>
            <Link href="/admin/register" className="text-primary hover:underline">
              Daftar admin
            </Link>
          </div>
          <Link
            href="/"
            className="text-on-surface-variant hover:text-primary inline-flex items-center gap-1.5 text-xs font-semibold transition"
          >
            <Icon name="arrow_back" className="text-sm" />
            <span>Kembali ke Website Publik Desa Pringgodani</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
