"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/shared/ui/icon";
import { AdminSubmissionsService } from "@/entities/admin/api/admin-submissions.service";
import type {
  PendingNewsSubmission,
  PendingUmkmSubmission,
} from "@/entities/admin/model/admin.types";
import { SubmissionReviewModal } from "./components/submission-review-modal";

export function AdminPengajuanPage() {
  const [activeTab, setActiveTab] = useState<"NEWS" | "UMKM">("NEWS");
  const [pendingNews, setPendingNews] = useState<PendingNewsSubmission[]>([]);
  const [pendingUmkm, setPendingUmkm] = useState<PendingUmkmSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastVariant, setToastVariant] = useState<"success" | "error">(
    "success",
  );

  const [selectedReviewItem, setSelectedReviewItem] = useState<{
    type: "NEWS" | "UMKM";
    data: PendingNewsSubmission | PendingUmkmSubmission;
  } | null>(null);

  const loadData = () => {
    setIsLoading(true);
    AdminSubmissionsService.getPendingSubmissions()
      .then((res) => {
        setPendingNews(res.pendingNews);
        setPendingUmkm(res.pendingUmkm);
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    let ignore = false;
    AdminSubmissionsService.getPendingSubmissions()
      .then((res) => {
        if (!ignore) {
          setPendingNews(res.pendingNews);
          setPendingUmkm(res.pendingUmkm);
        }
      })
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, []);

  const showToast = (msg: string, variant: "success" | "error" = "success") => {
    setToastMessage(msg);
    setToastVariant(variant);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Bug fix: these previously ignored the { success } result entirely and
  // always showed a "berhasil" toast, even when the API call actually
  // failed (see AdminSubmissionsService.updateNewsStatus/updateUmkmStatus -
  // that layer had its own matching bug, also fixed). An admin approving/
  // rejecting a submission needs to know if it genuinely went through.
  const handleApproveNews = async (id: string) => {
    const { success } = await AdminSubmissionsService.updateNewsStatus(
      id,
      "PUBLISHED",
    );
    showToast(
      success
        ? "Pengajuan berita berhasil disetujui dan terbit di halaman publik."
        : "Gagal menyetujui pengajuan berita. Silakan coba lagi.",
      success ? "success" : "error",
    );
    loadData();
  };

  const handleRejectNews = async (id: string, reason: string) => {
    const { success } = await AdminSubmissionsService.updateNewsStatus(
      id,
      "REJECTED",
      reason,
    );
    showToast(
      success
        ? "Pengajuan berita telah ditolak."
        : "Gagal menolak pengajuan berita. Silakan coba lagi.",
      success ? "success" : "error",
    );
    loadData();
  };

  const handleApproveUmkm = async (id: string) => {
    const { success } = await AdminSubmissionsService.updateUmkmStatus(
      id,
      "APPROVED",
    );
    showToast(
      success
        ? "Pendaftaran UMKM berhasil disetujui dan tampil di katalog desa."
        : "Gagal menyetujui pendaftaran UMKM. Silakan coba lagi.",
      success ? "success" : "error",
    );
    loadData();
  };

  const handleRejectUmkm = async (id: string, reason: string) => {
    const { success } = await AdminSubmissionsService.updateUmkmStatus(
      id,
      "REJECTED",
      reason,
    );
    showToast(
      success
        ? "Pendaftaran UMKM telah ditolak."
        : "Gagal menolak pendaftaran UMKM. Silakan coba lagi.",
      success ? "success" : "error",
    );
    loadData();
  };

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`animate-fade-in fixed right-6 bottom-6 z-50 flex items-center gap-3 rounded-2xl px-6 py-4 text-sm font-semibold shadow-2xl ${
            toastVariant === "success"
              ? "bg-primary text-on-primary"
              : "bg-error text-on-error"
          }`}
        >
          <Icon
            name={toastVariant === "success" ? "check_circle" : "error"}
            className="text-xl"
          />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Halaman */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="text-on-surface-variant font-label-sm text-xs font-bold tracking-wider uppercase">
            Sistem Otorisasi Warga
          </span>
          <h2 className="font-headline-lg text-primary mt-1 text-3xl font-bold">
            Antrean Persetujuan Pengajuan Warga
          </h2>
          <p className="text-on-surface-variant mt-1 text-sm">
            Tinjau, pratinjau, dan beri persetujuan untuk liputan berita serta
            UMKM dari warga Desa Pringgodani.
          </p>
        </div>

        <button
          onClick={loadData}
          className="bg-surface-container-high border-outline-variant/30 text-on-surface hover:bg-surface-container-highest inline-flex items-center gap-2 self-start rounded-2xl border px-4 py-2.5 text-xs font-bold transition sm:self-auto"
        >
          <Icon name="sync" className="text-base" /> Muat Ulang Data
        </button>
      </div>

      {/* Navigasi Tab */}
      <div className="border-outline-variant/30 bg-surface-container-lowest flex w-fit gap-2 rounded-2xl border p-2">
        <button
          onClick={() => setActiveTab("NEWS")}
          className={`font-label-sm flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition ${
            activeTab === "NEWS"
              ? "bg-primary text-on-primary shadow-sm"
              : "text-on-surface-variant hover:bg-surface-container-high"
          }`}
        >
          <Icon name="newspaper" className="text-lg" />
          Pengajuan Berita
          {pendingNews.length > 0 && (
            <span className="bg-error text-on-error ml-1 rounded-full px-2 py-0.5 text-[10px] font-extrabold">
              {pendingNews.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("UMKM")}
          className={`font-label-sm flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition ${
            activeTab === "UMKM"
              ? "bg-primary text-on-primary shadow-sm"
              : "text-on-surface-variant hover:bg-surface-container-high"
          }`}
        >
          <Icon name="storefront" className="text-lg" />
          Pendaftaran UMKM
          {pendingUmkm.length > 0 && (
            <span className="bg-error text-on-error ml-1 rounded-full px-2 py-0.5 text-[10px] font-extrabold">
              {pendingUmkm.length}
            </span>
          )}
        </button>
      </div>

      {/* Daftar Kartu Antrean Pengajuan Berita */}
      {activeTab === "NEWS" && (
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-on-surface-variant py-12 text-center text-sm font-medium">
              Memuat pengajuan berita...
            </div>
          ) : pendingNews.length === 0 ? (
            <div className="border-outline-variant/30 bg-surface-container-lowest space-y-3 rounded-3xl border p-12 text-center">
              <div className="bg-primary/10 text-primary mx-auto flex h-14 w-14 items-center justify-center rounded-2xl">
                <Icon name="task_alt" className="text-3xl" />
              </div>
              <h3 className="font-headline-md text-primary text-lg font-bold">
                Tidak Ada Antrean Berita
              </h3>
              <p className="text-on-surface-variant mx-auto max-w-md text-xs">
                Seluruh pengajuan berita warga telah selesai ditinjau. Pengajuan
                baru akan muncul di sini.
              </p>
            </div>
          ) : (
            pendingNews.map((item) => (
              <div
                key={item.id}
                className="border-outline-variant/30 bg-surface-container-lowest flex flex-col justify-between gap-6 rounded-3xl border p-6 shadow-sm transition hover:shadow-md md:flex-row md:items-center"
              >
                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="bg-warning-container text-on-warning-container rounded-full px-3 py-0.5 text-xs font-bold">
                      PENDING
                    </span>
                    <span className="bg-surface-container text-on-surface-variant rounded-full px-3 py-0.5 text-xs font-semibold">
                      {item.categoryName}
                    </span>
                    <span className="text-on-surface-variant text-xs">
                      •{" "}
                      {new Date(item.submittedAt).toLocaleDateString("id-ID", {
                        dateStyle: "medium",
                      })}
                    </span>
                  </div>
                  <h3 className="font-headline-md text-primary text-lg font-bold">
                    {item.title}
                  </h3>
                  <p className="text-on-surface-variant line-clamp-2 text-xs leading-relaxed">
                    {item.excerpt}
                  </p>
                </div>

                <div className="flex items-center gap-3 self-end whitespace-nowrap md:self-center">
                  <button
                    onClick={() =>
                      setSelectedReviewItem({ type: "NEWS", data: item })
                    }
                    className="bg-primary text-on-primary hover:bg-primary/90 flex items-center gap-2 rounded-2xl px-5 py-3 text-xs font-bold shadow-sm transition"
                  >
                    <Icon name="visibility" className="text-base" />
                    Tinjau & Pratinjau
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Daftar Kartu Antrean Pendaftaran UMKM */}
      {activeTab === "UMKM" && (
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-on-surface-variant py-12 text-center text-sm font-medium">
              Memuat pengajuan UMKM...
            </div>
          ) : pendingUmkm.length === 0 ? (
            <div className="border-outline-variant/30 bg-surface-container-lowest space-y-3 rounded-3xl border p-12 text-center">
              <div className="bg-secondary/10 text-secondary mx-auto flex h-14 w-14 items-center justify-center rounded-2xl">
                <Icon name="task_alt" className="text-3xl" />
              </div>
              <h3 className="font-headline-md text-primary text-lg font-bold">
                Tidak Ada Antrean Pendaftaran UMKM
              </h3>
              <p className="text-on-surface-variant mx-auto max-w-md text-xs">
                Seluruh pendaftaran UMKM warga telah selesai ditinjau.
              </p>
            </div>
          ) : (
            pendingUmkm.map((item) => (
              <div
                key={item.id}
                className="border-outline-variant/30 bg-surface-container-lowest flex flex-col justify-between gap-6 rounded-3xl border p-6 shadow-sm transition hover:shadow-md md:flex-row md:items-center"
              >
                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="bg-warning-container text-on-warning-container rounded-full px-3 py-0.5 text-xs font-bold">
                      PENDING
                    </span>
                    <span className="bg-surface-container text-on-surface-variant rounded-full px-3 py-0.5 text-xs font-semibold">
                      {item.categoryName}
                    </span>
                    <span className="text-on-surface-variant text-xs">
                      • Pemilik: {item.ownerName}
                    </span>
                  </div>
                  <h3 className="font-headline-md text-primary text-lg font-bold">
                    {item.name}
                  </h3>
                  <p className="text-on-surface-variant line-clamp-2 text-xs leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="flex items-center gap-3 self-end whitespace-nowrap md:self-center">
                  <button
                    onClick={() =>
                      setSelectedReviewItem({ type: "UMKM", data: item })
                    }
                    className="bg-primary text-on-primary hover:bg-primary/90 flex items-center gap-2 rounded-2xl px-5 py-3 text-xs font-bold shadow-sm transition"
                  >
                    <Icon name="visibility" className="text-base" />
                    Tinjau & Pratinjau
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal Review Live Split-View */}
      {selectedReviewItem && (
        <SubmissionReviewModal
          type={selectedReviewItem.type}
          data={selectedReviewItem.data}
          onClose={() => setSelectedReviewItem(null)}
          onApprove={async (id) => {
            if (selectedReviewItem.type === "NEWS") {
              await handleApproveNews(id);
            } else {
              await handleApproveUmkm(id);
            }
          }}
          onReject={async (id, reason) => {
            if (selectedReviewItem.type === "NEWS") {
              await handleRejectNews(id, reason);
            } else {
              await handleRejectUmkm(id, reason);
            }
          }}
        />
      )}
    </div>
  );
}
