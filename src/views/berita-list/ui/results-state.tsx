import Link from "next/link";
import { Icon } from "@/shared/ui/icon";

/**
 * Empty state for the news grid. The copy distinguishes "nothing matched your
 * filters" from "nothing published yet" — the two look identical to the code
 * but mean very different things to a visitor.
 */
export function NewsEmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="border-outline-variant/30 bg-surface-container-low flex flex-col items-center gap-3 rounded-xl border border-dashed px-6 py-20 text-center">
      <Icon name="search_off" className="text-outline-variant text-5xl" />
      <p className="font-headline-md text-headline-md text-primary">
        {hasFilters
          ? "Belum ada berita yang cocok dengan pencarian Anda"
          : "Belum ada berita yang dipublikasikan"}
      </p>
      <p className="font-body-base text-body-base text-on-surface-variant max-w-md">
        {hasFilters
          ? "Coba gunakan kata kunci lain atau pilih kategori yang berbeda."
          : "Pemerintah Desa Pringgodani belum menerbitkan berita. Silakan kembali lagi nanti."}
      </p>
      {hasFilters && (
        <Link
          href="/berita"
          className="bg-primary text-on-primary font-label-sm mt-2 rounded-full px-6 py-2.5 font-bold transition-all hover:opacity-90 active:scale-95"
        >
          Tampilkan Semua Berita
        </Link>
      )}
    </div>
  );
}

/** Error state — shown when the Service Layer call itself fails. */
export function NewsErrorState() {
  return (
    <div className="border-error/30 bg-error-container/40 flex flex-col items-center gap-3 rounded-xl border px-6 py-20 text-center">
      <Icon name="error" className="text-error text-5xl" />
      <p className="font-headline-md text-headline-md text-on-error-container">
        Gagal memuat berita
      </p>
      <p className="font-body-base text-body-base text-on-surface-variant max-w-md">
        Terjadi gangguan saat mengambil data berita. Silakan muat ulang halaman
        beberapa saat lagi.
      </p>
    </div>
  );
}
