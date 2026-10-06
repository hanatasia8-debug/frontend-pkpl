import Link from "next/link";
import { Icon } from "@/shared/ui/icon";

/**
 * Empty state for the UMKM grid. The copy distinguishes "nothing matched your
 * filters" from "no UMKM registered yet" — identical to the code, very
 * different to a visitor.
 */
export function UmkmEmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="border-outline-variant/30 bg-surface-container-low flex flex-col items-center gap-3 rounded-xl border border-dashed px-6 py-20 text-center">
      <Icon name="storefront" className="text-outline-variant text-5xl!" />
      <p className="font-headline-md text-headline-md text-primary">
        {hasFilters
          ? "Belum ada UMKM yang cocok dengan pencarian Anda"
          : "Belum ada UMKM yang terdaftar"}
      </p>
      <p className="font-body-base text-body-base text-on-surface-variant max-w-md">
        {hasFilters
          ? "Coba gunakan kata kunci lain atau pilih kategori yang berbeda."
          : "Direktori UMKM Desa Pringgodani masih kosong. Pelaku usaha dapat mendaftarkan usahanya melalui formulir pengajuan."}
      </p>
      {hasFilters ? (
        <Link
          href="/umkm"
          className="bg-primary text-on-primary font-label-sm mt-2 rounded-full px-6 py-2.5 font-bold transition-all hover:opacity-90 active:scale-95"
        >
          Tampilkan Semua UMKM
        </Link>
      ) : (
        <Link
          href="/submit/umkm"
          className="bg-primary text-on-primary font-label-sm mt-2 rounded-full px-6 py-2.5 font-bold transition-all hover:opacity-90 active:scale-95"
        >
          Daftarkan UMKM Anda
        </Link>
      )}
    </div>
  );
}

/** Error state — shown when the Service Layer call itself fails. */
export function UmkmErrorState() {
  return (
    <div className="border-error/30 bg-error-container/40 flex flex-col items-center gap-3 rounded-xl border px-6 py-20 text-center">
      <Icon name="error" className="text-error text-5xl" />
      <p className="font-headline-md text-headline-md text-on-error-container">
        Gagal memuat direktori UMKM
      </p>
      <p className="font-body-base text-body-base text-on-surface-variant max-w-md">
        Terjadi gangguan saat mengambil data UMKM. Silakan muat ulang halaman
        beberapa saat lagi.
      </p>
    </div>
  );
}
