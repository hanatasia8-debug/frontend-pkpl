"use client";

import { usePendingSubmissions } from "../model/use-submission-tracker";
import { Icon } from "@/shared/ui/icon";

interface PendingStatusCardProps {
  type?: "UMKM" | "NEWS";
}

export function PendingStatusCard({ type = "NEWS" }: PendingStatusCardProps) {
  const isUmkm = type === "UMKM";
  const { items, isLoading } = usePendingSubmissions(type);

  return (
    <div className="bg-surface-container-low/80 border-outline-variant/30 space-y-4 rounded-2xl border p-5 shadow-sm">
      <div className="flex items-center justify-between border-b pb-3">
        <div className="flex items-center gap-2">
          <Icon
            name={isUmkm ? "storefront" : "newspaper"}
            className="text-primary text-lg"
          />
          <h3 className="font-label-sm text-on-surface text-xs font-bold tracking-wider uppercase">
            Status Pengajuan Pending ({isUmkm ? "UMKM" : "Berita"})
          </h3>
        </div>
        <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-900">
          {items.length} Pending
        </span>
      </div>

      {isLoading ? (
        <div className="space-y-2 py-2">
          <div className="h-12 w-full animate-pulse rounded-xl bg-slate-200/60" />
        </div>
      ) : items.length > 0 ? (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-surface-container-lowest border-outline-variant/20 flex items-center justify-between gap-3 rounded-xl border p-3.5 shadow-xs transition-all hover:border-amber-300"
            >
              <div className="min-w-0 flex-1">
                <h4 className="font-title-sm text-on-surface truncate text-xs font-bold">
                  {item.title}
                </h4>
                <p className="text-on-surface-variant mt-0.5 text-[11px]">
                  {item.createdAt}
                </p>
              </div>

              <span className="shrink-0 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-extrabold tracking-wide text-amber-800 uppercase">
                PENDING
              </span>
            </div>
          ))}

          <p className="text-on-surface-variant/80 text-[11px] leading-relaxed italic">
            ⏳ Seluruh pengajuan di atas sedang dalam proses verifikasi oleh
            Admin Desa Pringgodani (Maks 24 Jam).
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="bg-surface-container-lowest border-outline-variant/10 flex items-center justify-between gap-3 rounded-xl border p-3.5 shadow-xs">
            <div className="min-w-0 flex-1">
              <h4 className="font-title-sm text-on-surface-variant truncate text-xs font-semibold">
                Tidak Ada Pengajuan {isUmkm ? "UMKM" : "Berita"} Pending
              </h4>
              <p className="text-on-surface-variant/70 mt-0.5 text-[11px]">
                Semua pengajuan telah disetujui atau dipublikasikan
              </p>
            </div>

            <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold tracking-wide text-slate-600 uppercase">
              NIHIL
            </span>
          </div>

          <p className="text-on-surface-variant/70 text-[11px] leading-relaxed italic">
            Isi formulir di sebelah kiri untuk mengajukan{" "}
            {isUmkm ? "UMKM" : "berita"} baru ke portal desa.
          </p>
        </div>
      )}
    </div>
  );
}
