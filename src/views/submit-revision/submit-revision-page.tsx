"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/shared/ui/icon";
import { RevisionService } from "@/entities/pengajuan/api/revision.service";
import type { RevisionLookup } from "@/entities/pengajuan/model/types";
import { UmkmRevisionForm } from "./umkm-revision-form";
import { NewsRevisionForm } from "./news-revision-form";

interface SubmitRevisionPageProps {
  token: string;
}

type PageStatus = "loading" | "not-found" | "form" | "success";

export function SubmitRevisionPage({ token }: SubmitRevisionPageProps) {
  const router = useRouter();
  const [status, setStatus] = useState<PageStatus>("loading");
  const [lookup, setLookup] = useState<RevisionLookup | null>(null);
  const [submittedTitle, setSubmittedTitle] = useState("");

  useEffect(() => {
    let ignore = false;
    RevisionService.getByToken(token).then((res) => {
      if (ignore) return;
      if (res) {
        setLookup(res);
        setStatus("form");
      } else {
        setStatus("not-found");
      }
    });
    return () => {
      ignore = true;
    };
  }, [token]);

  const handleResubmitted = (title: string) => {
    setSubmittedTitle(title);
    setStatus("success");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (status === "loading") {
    return (
      <div className="max-w-container-max px-gutter mx-auto mt-24 flex min-h-[50vh] items-center justify-center pb-20">
        <div className="text-on-surface-variant flex items-center gap-3 text-sm font-medium">
          <span className="border-primary h-5 w-5 animate-spin rounded-full border-2 border-t-transparent" />
          Memeriksa tautan revisi...
        </div>
      </div>
    );
  }

  if (status === "not-found") {
    return (
      <div className="max-w-container-max px-gutter mx-auto mt-24 pb-20">
        <div className="border-outline-variant/30 bg-surface-container-lowest mx-auto max-w-lg space-y-4 rounded-3xl border p-10 text-center shadow-sm">
          <div className="bg-error/10 text-error mx-auto flex h-16 w-16 items-center justify-center rounded-2xl">
            <Icon name="error" className="text-3xl" />
          </div>
          <h1 className="font-headline-md text-primary text-xl font-bold">
            Tautan Revisi Tidak Ditemukan
          </h1>
          <p className="text-on-surface-variant text-sm leading-relaxed">
            Tautan ini tidak valid, sudah kedaluwarsa, atau pengajuan sudah
            pernah direvisi sebelumnya. Silakan hubungi perangkat Desa
            Pringgodani atau periksa kembali pesan pemberitahuan penolakan Anda.
          </p>
          <button
            onClick={() => router.push("/")}
            className="bg-primary text-on-primary mx-auto mt-2 rounded-full px-6 py-3 text-sm font-bold shadow-md transition hover:opacity-90"
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="max-w-container-max px-gutter mx-auto mt-24 pb-20">
        <div className="border-outline-variant/30 bg-surface-container-lowest mx-auto max-w-lg space-y-4 rounded-3xl border p-10 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
            <Icon name="check_circle" className="text-3xl" />
          </div>
          <h1 className="font-headline-md text-primary text-xl font-bold">
            Revisi Berhasil Dikirim
          </h1>
          <p className="text-on-surface-variant text-sm leading-relaxed">
            Terima kasih! Pengajuan <strong>{submittedTitle}</strong> yang sudah
            Anda perbarui akan ditinjau ulang oleh perangkat Desa Pringgodani.
          </p>
          <button
            onClick={() => router.push("/")}
            className="bg-primary text-on-primary mx-auto mt-2 rounded-full px-6 py-3 text-sm font-bold shadow-md transition hover:opacity-90"
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    );
  }

  if (!lookup) return null;

  return (
    <div className="max-w-container-max px-gutter mx-auto mt-24 pb-20">
      {/* Header */}
      <header className="mb-8 text-center">
        <span className="bg-primary/10 text-primary mb-2 inline-block rounded-full px-3 py-1 text-xs font-bold tracking-wider uppercase">
          Revisi Pengajuan Warga
        </span>
        <h1 className="font-headline-lg text-headline-lg text-primary mb-2">
          {lookup.type === "UMKM"
            ? "Perbaiki Pendaftaran UMKM Anda"
            : "Perbaiki Pengajuan Berita Anda"}
        </h1>
        <p className="text-on-surface-variant mx-auto max-w-2xl text-sm leading-relaxed">
          Pengajuan Anda ditolak oleh perangkat desa. Lihat alasannya di bawah,
          perbaiki data yang diperlukan, lalu kirim ulang untuk ditinjau
          kembali.
        </p>
      </header>

      {/* Rejection reason banner — the whole point of #296: explanation
          shown + data can be modified. */}
      <div className="mx-auto mb-8 max-w-3xl rounded-2xl border border-red-200 bg-red-50 p-5 text-red-900 shadow-sm">
        <div className="flex items-start gap-3">
          <Icon name="error" className="mt-0.5 shrink-0 text-xl text-red-600" />
          <div>
            <h3 className="text-sm font-bold text-red-800">Alasan Penolakan</h3>
            <p className="mt-1 text-sm leading-relaxed text-red-700">
              {lookup.rejectionReason}
            </p>
            <p className="mt-2 text-xs text-red-600">
              Ditolak pada{" "}
              {new Date(lookup.rejectedAt).toLocaleDateString("id-ID", {
                dateStyle: "long",
              })}
            </p>
          </div>
        </div>
      </div>

      {lookup.type === "UMKM" ? (
        <UmkmRevisionForm
          token={token}
          initialData={lookup.data}
          onResubmitted={handleResubmitted}
        />
      ) : (
        <NewsRevisionForm
          token={token}
          initialData={lookup.data}
          onResubmitted={handleResubmitted}
        />
      )}
    </div>
  );
}
