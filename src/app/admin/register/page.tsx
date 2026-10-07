"use client";

import { useState } from "react";
import Link from "next/link";
import { apiClient } from "@/shared/api/axios-instance";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AdminRegisterPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors: Record<string, string> = {};
    if (!fullName.trim()) {
      nextErrors.fullName = "Nama lengkap wajib diisi.";
    } else if (fullName.trim().length < 10 || fullName.length > 50) {
      nextErrors.fullName = "Nama lengkap harus terdiri dari 10–50 karakter.";
    }

    if (!email.trim()) {
      nextErrors.email = "Email wajib diisi.";
    } else if (email.length > 50 || !EMAIL_PATTERN.test(email)) {
      nextErrors.email = "Masukkan email valid (maksimal 50 karakter).";
    }
    if (!password) {
      nextErrors.password = "Kata sandi wajib diisi.";
    } else if (password.length < 8) {
      nextErrors.password = "Kata sandi minimal 8 karakter.";
    }
    if (!confirmPassword) {
      nextErrors.confirmPassword = "Konfirmasi kata sandi wajib diisi.";
    } else if (confirmPassword !== password) {
      nextErrors.confirmPassword = "Konfirmasi kata sandi tidak cocok.";
    }

    setFieldErrors(nextErrors);
    setSuccessMessage(null);
    setErrorMessage(null);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      await apiClient.post("/auth/register", {
        name: fullName.trim(),
        email: email.trim(),
        password,
      });
      setSuccessMessage(
        "Registrasi terkirim. Verifikasi email jika diminta; akun dibuat sebagai pengguna biasa dan akses admin menunggu persetujuan.",
      );
      setFullName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      const responseData = (
        error as { response?: { data?: { error?: string; message?: string } } }
      ).response?.data;
      setErrorMessage(
        responseData?.error ||
          responseData?.message ||
          "Registrasi gagal. Periksa koneksi atau hubungi administrator.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-center mb-2 text-2xl font-bold">Register Admin Baru</h1>
        <p className="text-center mb-6 text-gray-600">
          Daftar sebagai admin baru untuk mengelola website Pringgodani
        </p>
        
        {/* Notifikasi kesuksesan/kegagalan */}
        {successMessage && (
          <div className="bg-emerald-100 text-emerald-800 p-3 rounded-lg mb-6">
            {successMessage}
          </div>
        )}
        {errorMessage && (
          <div role="alert" className="mb-6 rounded-lg bg-red-100 p-3 text-red-800">
            {errorMessage}
          </div>
        )}
        
        <form
          className="space-y-4"
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
            <label className="block mb-2 text-sm font-medium text-gray-700" htmlFor="fullName">
              Nama Lengkap
            </label>
            <div className="relative">
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                minLength={10}
                maxLength={50}
                value={fullName}
                onChange={(event) => {
                  const value = event.target.value;
                  setFullName(value);
                  setSuccessMessage(null);
                  setFieldErrors((previous) => ({
                    ...previous,
                    fullName: !value.trim()
                      ? "Nama lengkap wajib diisi."
                      : value.trim().length < 10
                        ? "Nama minimal 10 karakter."
                        : "",
                  }));
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Masukkan nama lengkap"
                aria-describedby="fullName-error"
              />
            </div>
            <p className="text-xs text-gray-500" aria-live="polite">
              {fullName.length}/50 karakter (minimal 10)
            </p>
            {fieldErrors.fullName && (
              <p id="fullName-error" className="text-red-500 text-xs mt-1">
                {fieldErrors.fullName}
              </p>
            )}
          </div>
          
          <div>
            <label
              className="block mb-2 text-sm font-medium text-gray-900"
              htmlFor="email"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              minLength={5}
              maxLength={50}
              value={email}
              onChange={(event) => {
                const value = event.target.value;
                setEmail(value);
                setSuccessMessage(null);
                setFieldErrors((previous) => ({
                  ...previous,
                  email: !value.trim()
                    ? "Email wajib diisi."
                    : !EMAIL_PATTERN.test(value)
                      ? "Masukkan email dengan format yang valid."
                      : "",
                }));
              }}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="admin_baru@pringgodani.desa.id"
            />
            {fieldErrors.email && <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>}
          </div>

          <div>
            <label
              className="block mb-2 text-sm font-medium text-gray-900"
              htmlFor="password"
            >
              Kata Sandi
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              maxLength={50}
              value={password}
              onChange={(event) => {
                const value = event.target.value;
                setPassword(value);
                setSuccessMessage(null);
                setFieldErrors((previous) => ({
                  ...previous,
                  password: !value ? "Kata sandi wajib diisi." : value.length < 8 ? "Kata sandi minimal 8 karakter." : "",
                }));
              }}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Masukkan kata sandi"
              autoComplete="new-password"
            />
            {fieldErrors.password && <p className="mt-1 text-xs text-red-600">{fieldErrors.password}</p>}
          </div>

          <div>
            <label
              className="block mb-2 text-sm font-medium text-gray-900"
              htmlFor="confirmPassword"
            >
              Konfirmasi Kata Sandi
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              minLength={8}
              maxLength={50}
              value={confirmPassword}
              onChange={(event) => {
                const value = event.target.value;
                setConfirmPassword(value);
                setSuccessMessage(null);
                setFieldErrors((previous) => ({
                  ...previous,
                  confirmPassword: !value
                    ? "Konfirmasi kata sandi wajib diisi."
                    : value !== password
                      ? "Konfirmasi kata sandi tidak cocok."
                      : "",
                }));
              }}
              className="w-full px-4 py-3 rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Ulangi kata sandi"
              autoComplete="current-password"
            />
            {fieldErrors.confirmPassword && <p className="mt-1 text-xs text-red-600">{fieldErrors.confirmPassword}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white font-medium py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <span>Memproses Registrasi...</span>
            ) : (
              <span>Daftar sebagai Admin Baru</span>
            )}
          </button>
        </form>
        
        <div className="mt-6 border-t border-gray-200 pt-6">
          <p className="text-center text-sm text-gray-600">
            Sudah memiliki akun admin? 
            <Link
              href="/admin/login"
              className="font-medium text-blue-600 hover:text-blue-500 ml-1"
            >
              Kembali ke Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}