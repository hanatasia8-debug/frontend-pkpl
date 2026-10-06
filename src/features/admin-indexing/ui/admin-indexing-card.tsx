"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/shared/ui/icon";
import {
  AdminIndexingService,
  IndexingStatusInfo,
  ReindexAllSummary,
} from "@/entities/admin/api/admin-indexing.service";

export function AdminIndexingCard() {
  const [status, setStatus] = useState<IndexingStatusInfo | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);

  // Manual URL state
  const [manualUrl, setManualUrl] = useState("");
  const [manualType, setManualType] = useState<"URL_UPDATED" | "URL_DELETED">(
    "URL_UPDATED",
  );
  const [isSubmittingManual, setIsSubmittingManual] = useState(false);
  const [manualFeedback, setManualFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Bulk Reindex state
  const [isSubmittingBulk, setIsSubmittingBulk] = useState(false);
  const [bulkFeedback, setBulkFeedback] = useState<{
    type: "success" | "error";
    message: string;
    summary?: ReindexAllSummary;
  } | null>(null);

  const [copiedEmail, setCopiedEmail] = useState(false);

  useEffect(() => {
    AdminIndexingService.getStatus()
      .then((data) => {
        if (data) {
          setStatus(data);
          setManualUrl((prev) => prev || `${data.siteUrl}/`);
        }
      })
      .finally(() => setIsLoadingStatus(false));
  }, []);

  const handleCopyEmail = () => {
    if (status?.clientEmail) {
      navigator.clipboard.writeText(status.clientEmail);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualUrl.trim()) return;

    setIsSubmittingManual(true);
    setManualFeedback(null);

    const res = await AdminIndexingService.publishUrl(
      manualUrl.trim(),
      manualType,
    );
    if (res.success) {
      setManualFeedback({
        type: "success",
        message:
          res.message ||
          `URL berhasil dikirim ke Google Indexing queue (${manualType})`,
      });
    } else {
      setManualFeedback({
        type: "error",
        message: res.message || "Gagal mengirimkan notifikasi indexing",
      });
    }
    setIsSubmittingManual(false);
  };

  const handleBulkReindex = async () => {
    const confirm = window.confirm(
      "Apakah Anda yakin ingin menyinkronkan seluruh konten (Berita, UMKM, Produk, Profil) ke antrean Google Indexing?",
    );
    if (!confirm) return;

    setIsSubmittingBulk(true);
    setBulkFeedback(null);

    const res = await AdminIndexingService.reindexAll();
    if (res.success) {
      setBulkFeedback({
        type: "success",
        message:
          res.message ||
          "Seluruh konten berhasil disinkronkan ke Google Indexing",
        summary: res.summary,
      });
    } else {
      setBulkFeedback({
        type: "error",
        message: res.message || "Gagal melakukan sinkronisasi massal",
      });
    }
    setIsSubmittingBulk(false);
  };

  return (
    <div className="border-outline-variant/30 bg-surface-container-lowest overflow-hidden rounded-3xl border p-6 shadow-sm md:p-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-outline-variant/20 pb-6 md:flex-row md:items-center">
        <div className="flex items-center gap-3.5">
          <div className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-2xl">
            <Icon name="travel_explore" className="text-2xl" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-headline-md text-primary text-xl font-bold">
                Pusat Web Indexing (Google Indexing API v3)
              </h3>
            </div>
            <p className="text-on-surface-variant mt-0.5 text-xs md:text-sm">
              Kelola dan percepat perayapan (crawling) halaman web desa di mesin
              pencari Google secara otomatis dan instan.
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div>
          {isLoadingStatus ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-container px-3 py-1 text-xs font-semibold text-on-surface-variant">
              <Icon name="sync" className="animate-spin text-sm" /> Memeriksa
              Status...
            </span>
          ) : status?.isConfigured ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3.5 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Service Account Terhubung
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3.5 py-1 text-xs font-bold text-amber-700 dark:text-amber-300">
              <Icon name="warning" className="text-sm" />
              Kredensial Belum Terpasang
            </span>
          )}
        </div>
      </div>

      {/* Info Service Account */}
      {status?.clientEmail && (
        <div className="mt-6 flex flex-col items-start justify-between gap-3 rounded-2xl bg-surface-container-low px-4 py-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2 text-xs text-on-surface-variant">
            <Icon name="vpn_key" className="text-primary text-sm" />
            <span>Service Account Google:</span>
            <code className="bg-surface font-mono text-primary font-medium rounded px-2 py-0.5">
              {status.clientEmail}
            </code>
          </div>
          <button
            type="button"
            onClick={handleCopyEmail}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
          >
            <Icon
              name={copiedEmail ? "check" : "content_copy"}
              className="text-sm"
            />
            {copiedEmail ? "Tersalin!" : "Salin Email"}
          </button>
        </div>
      )}

      {/* Action Grid */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Kolom 1: Sinkronisasi Massal */}
        <div className="flex flex-col justify-between rounded-2xl border border-outline-variant/30 bg-surface p-5">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
                <Icon name="sync" className="text-xl" />
              </div>
              <h4 className="font-headline-sm text-sm font-bold text-on-surface">
                Sinkronisasi Massal Seluruh Konten
              </h4>
            </div>
            <p className="text-on-surface-variant mt-2 text-xs leading-relaxed">
              Kirim seluruh halaman publik terbitan desa (Berita, UMKM, Produk,
              Peta, dan Profil) ke antrean prioritas Google Indexing dalam satu
              klik.
            </p>
          </div>

          <div className="mt-5 space-y-3">
            {bulkFeedback && (
              <div
                className={`rounded-xl p-3 text-xs ${
                  bulkFeedback.type === "success"
                    ? "bg-emerald-500/10 text-emerald-800 dark:text-emerald-200 border border-emerald-500/20"
                    : "bg-rose-500/10 text-rose-800 dark:text-rose-200 border border-rose-500/20"
                }`}
              >
                <div className="flex items-start gap-2">
                  <Icon
                    name={
                      bulkFeedback.type === "success" ? "check_circle" : "error"
                    }
                    className="text-base shrink-0 mt-0.5"
                  />
                  <span>{bulkFeedback.message}</span>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={handleBulkReindex}
              disabled={isSubmittingBulk || !status?.isConfigured}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-xs font-bold text-on-primary shadow-sm transition hover:bg-primary/90 disabled:opacity-50"
            >
              <Icon
                name="bolt"
                className={`text-base ${isSubmittingBulk ? "animate-spin" : ""}`}
              />
              {isSubmittingBulk
                ? "Memproses Sinkronisasi ke Google..."
                : "Sinkronkan Seluruh Konten ke Google"}
            </button>
          </div>
        </div>

        {/* Kolom 2: Index Manual URL Tertentu */}
        <div className="flex flex-col justify-between rounded-2xl border border-outline-variant/30 bg-surface p-5">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon name="link" className="text-xl" />
              </div>
              <h4 className="font-headline-sm text-sm font-bold text-on-surface">
                Index URL Spesifik Secara Manual
              </h4>
            </div>
            <p className="text-on-surface-variant mt-2 text-xs leading-relaxed">
              Masukkan tautan halaman spesifik untuk meminta Google segera
              merayapi pembaruan atau penghapusan URL.
            </p>
          </div>

          <form onSubmit={handleManualSubmit} className="mt-4 space-y-3">
            <div className="flex gap-2">
              <input
                type="url"
                required
                value={manualUrl}
                onChange={(e) => setManualUrl(e.target.value)}
                placeholder="https://lokalpringgodani.my.id/berita/..."
                className="flex-1 rounded-xl border border-outline-variant/50 bg-surface-container-lowest px-3 py-2 text-xs text-on-surface placeholder:text-outline focus:border-primary focus:outline-none"
              />
              <select
                value={manualType}
                onChange={(e) =>
                  setManualType(e.target.value as "URL_UPDATED" | "URL_DELETED")
                }
                className="rounded-xl border border-outline-variant/50 bg-surface-container-lowest px-2.5 py-2 text-xs text-on-surface focus:border-primary focus:outline-none font-medium"
              >
                <option value="URL_UPDATED">Update / Baru</option>
                <option value="URL_DELETED">Hapus</option>
              </select>
            </div>

            {manualFeedback && (
              <div
                className={`rounded-xl p-3 text-xs ${
                  manualFeedback.type === "success"
                    ? "bg-emerald-500/10 text-emerald-800 dark:text-emerald-200 border border-emerald-500/20"
                    : "bg-rose-500/10 text-rose-800 dark:text-rose-200 border border-rose-500/20"
                }`}
              >
                <div className="flex items-start gap-2">
                  <Icon
                    name={
                      manualFeedback.type === "success"
                        ? "check_circle"
                        : "error"
                    }
                    className="text-base shrink-0 mt-0.5"
                  />
                  <span>{manualFeedback.message}</span>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmittingManual || !status?.isConfigured}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-secondary-container px-4 py-2.5 text-xs font-bold text-on-secondary-container shadow-sm transition hover:bg-secondary-container/80 disabled:opacity-50"
            >
              <Icon
                name="send"
                className={`text-base ${isSubmittingManual ? "animate-spin" : ""}`}
              />
              {isSubmittingManual
                ? "Mengirim ke Google..."
                : "Index URL Sekarang"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
