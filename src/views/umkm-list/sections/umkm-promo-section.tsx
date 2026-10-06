import Link from "next/link";
import { Icon } from "@/shared/ui/icon";

/**
 * "Punya Usaha di Pringgodani?" promo band that closes the directory
 * prototype. The second prototype button ("Panduan Pendaftaran") has no page
 * behind it in the sitemap, so the CTA pair collapses to the one real
 * destination — the community submission form — rather than shipping a link to
 * a 404.
 */
export function UmkmPromoSection() {
  return (
    <section className="mt-section-padding max-w-container-max px-gutter mx-auto">
      <div
        suppressHydrationWarning
        className="bg-primary scroll-reveal relative flex flex-col items-center justify-between gap-8 overflow-hidden rounded-2xl p-8 md:flex-row md:p-12"
      >
        <div className="relative z-10 md:max-w-xl">
          <h2 className="font-headline-lg text-headline-lg text-on-primary mb-4">
            Punya Usaha di Pringgodani?
          </h2>
          <p className="font-body-lg text-body-lg text-on-primary mb-8 opacity-90">
            Daftarkan UMKM Anda secara gratis untuk menjangkau pasar yang lebih
            luas dan mendapatkan verifikasi resmi dari pemerintah desa.
          </p>
          <Link
            href="/submit/umkm"
            className="bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm inline-block rounded-full px-8 py-3 font-bold shadow-lg transition-all hover:shadow-xl active:scale-95"
          >
            Daftar Sekarang
          </Link>
        </div>

        <div className="relative z-10 flex w-full justify-center md:w-1/3">
          <div className="rotate-3 transform rounded-2xl border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur-md">
            {/* `!` on the size: Google's Material Symbols stylesheet sets an
                unlayered `font-size: 24px` that beats layered utilities. */}
            <Icon name="storefront" className="text-[120px]! text-white" />
          </div>
        </div>

        {/* Subtle background decoration, as in the prototype. */}
        <div className="bg-secondary absolute -right-20 -bottom-20 h-80 w-80 rounded-full opacity-30 blur-3xl" />
        <div className="bg-status-verified absolute -top-20 -left-20 h-60 w-60 rounded-full opacity-20 blur-3xl" />
      </div>
    </section>
  );
}
