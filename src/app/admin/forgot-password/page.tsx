"use client";

import { useState } from "react";
import Link from "next/link";
import { apiClient } from "@/shared/api/axios-instance";

export default function ForgotPasswordPage() {
  const [isSending, setIsSending] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const error = !email.trim()
      ? "Email wajib diisi."
      : !isValidEmail
        ? "Masukkan email dengan format yang valid."
        : "";
    setEmailError(error);
    setSuccessMessage(null);
    setRequestError(null);
    if (error) return;

    setIsSending(true);
    try {
      const { data } = await apiClient.post<{ data?: { message?: string } }>(
        "/auth/forgot-password",
        { email: email.trim() },
      );
      setSuccessMessage(
        data?.data?.message ||
          "Jika email terdaftar, instruksi pemulihan akan dikirim.",
      );
    } catch (error) {
      const responseData = (
        error as { response?: { data?: { error?: string; message?: string } } }
      ).response?.data;
      setRequestError(
        responseData?.error ||
          responseData?.message ||
          "Permintaan reset gagal. Periksa konfigurasi email backend.",
      );
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-center mb-2 text-2xl font-bold">Lupa Kata Sandi</h1>
        <p className="text-center mb-6 text-gray-600">
          Masukkan email admin untuk mengirim link pemulihan
        </p>
        
        {/* Notifikasi kesuksesan */}
        {successMessage && (
          <div className="bg-emerald-100 text-emerald-800 p-3 rounded-lg mb-6">
            {successMessage}
          </div>
        )}
        {requestError && (
          <div role="alert" className="mb-6 rounded-lg bg-red-100 p-3 text-red-800">
            {requestError}
          </div>
        )}
        
        <form
          className="space-y-4"
          onSubmit={handleSubmit}
          onInvalid={(event) => {
            const field = event.target;
            if (field instanceof HTMLInputElement) {
              setEmailError(field.validationMessage);
            }
          }}
        >
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-900" htmlFor="email">
              Email Admin
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
                setEmail(event.target.value);
                setEmailError(
                  !event.target.value.trim()
                    ? "Email wajib diisi."
                    : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(event.target.value)
                      ? ""
                      : "Masukkan email dengan format yang valid.",
                );
              }}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="admin@pringgodani.desa.id"
            />
            {emailError && <p className="mt-1 text-xs text-red-600">{emailError}</p>}
          </div>
          
          <button
            type="submit"
            disabled={isSending}
            className="w-full bg-blue-600 text-white font-medium py-3 px-4 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSending ? (
              <span className="flex items-center justify-center gap-2">
                <span>Mengirim Link Pemulihan...</span>
              </span>
            ) : (
              <span>Kirim Link Pemulihan</span>
            )}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-600">
          <Link href="/admin/login" className="font-medium text-blue-600 hover:underline">
            Kembali ke login
          </Link>
        </p>
      </div>
    </div>
  );
}