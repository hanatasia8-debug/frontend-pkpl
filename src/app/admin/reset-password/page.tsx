"use client";

import { useState } from "react";
import Link from "next/link";
import { apiClient } from "@/shared/api/axios-instance";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (password.length < 8) {
      setErrorMessage("Kata sandi baru minimal 8 karakter.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("Konfirmasi kata sandi tidak cocok.");
      return;
    }

    setErrorMessage("");
    setIsSaving(true);
    try {
      await apiClient.post("/auth/update-password", { password });
      setSuccessMessage("Kata sandi berhasil diperbarui. Silakan masuk kembali.");
    } catch (error) {
      const responseData = (
        error as { response?: { data?: { error?: string; message?: string } } }
      ).response?.data;
      setErrorMessage(
        responseData?.error ||
          responseData?.message ||
          "Tautan reset tidak valid atau sudah kedaluwarsa. Minta tautan baru.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center p-4">
      <div className="w-full max-w-md rounded-3xl border border-outline-variant/30 bg-surface-container-lowest p-8 shadow-lg">
        <h1 className="text-center text-2xl font-bold text-primary">
          Atur Kata Sandi Baru
        </h1>
        <p className="mt-2 text-center text-sm text-on-surface-variant">
          Masukkan kata sandi baru untuk akun Anda.
        </p>

        {errorMessage && (
          <p role="alert" className="mt-5 rounded-xl bg-red-100 p-3 text-sm text-red-800">
            {errorMessage}
          </p>
        )}
        {successMessage && (
          <p role="status" className="mt-5 rounded-xl bg-emerald-100 p-3 text-sm text-emerald-800">
            {successMessage}
          </p>
        )}

        {!successMessage && (
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <label className="block text-sm font-medium" htmlFor="new-password">
              Kata sandi baru
              <input
                id="new-password"
                type="password"
                required
                minLength={8}
                maxLength={50}
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-2 w-full rounded-xl border border-outline-variant bg-surface px-4 py-3"
              />
            </label>
            <label
              className="block text-sm font-medium"
              htmlFor="confirm-password"
            >
              Konfirmasi kata sandi
              <input
                id="confirm-password"
                type="password"
                required
                minLength={8}
                maxLength={50}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="mt-2 w-full rounded-xl border border-outline-variant bg-surface px-4 py-3"
              />
            </label>
            <button
              type="submit"
              disabled={isSaving}
              className="w-full rounded-xl bg-primary px-4 py-3 font-semibold text-on-primary disabled:opacity-60"
            >
              {isSaving ? "Menyimpan..." : "Simpan kata sandi"}
            </button>
          </form>
        )}
        <p className="mt-5 text-center text-sm">
          <Link href="/admin/login" className="text-primary hover:underline">
            Kembali ke login
          </Link>
        </p>
      </div>
    </div>
  );
}
