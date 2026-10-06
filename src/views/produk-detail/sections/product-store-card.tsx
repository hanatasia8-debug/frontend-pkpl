import Link from "next/link";
import { Icon } from "@/shared/ui/icon";
import { FallbackImage } from "@/shared/ui/fallback-image";
import { createWhatsappUrl } from "@/entities/umkm/model/whatsapp-link";
import type { ProductOwnerUmkmDto } from "@/entities/produk/model/types";

interface ProductStoreCardProps {
  umkm: ProductOwnerUmkmDto;
}

export function ProductStoreCard({ umkm }: ProductStoreCardProps) {
  const waContactUrl = umkm.phone
    ? createWhatsappUrl(
        umkm.phone,
        `Halo ${umkm.name}, saya ingin mengetahui lebih lanjut mengenai usaha dan produk Anda yang terdaftar di Lokal Pringgodani.`,
      )
    : null;

  return (
    <div className="bg-surface-container-low border-outline-variant/25 rounded-2xl sm:rounded-3xl border p-4 sm:p-6 shadow-xs">
      <div className="flex items-center justify-between gap-2 mb-3 sm:mb-4">
        <span className="text-primary font-label-sm text-[11px] sm:text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shrink-0">
          <Icon name="storefront" className="text-sm" />
          Diproduksi Oleh
        </span>
        <Link
          href={`/umkm/${umkm.slug}`}
          className="text-primary hover:text-primary-container inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold transition group shrink-0"
        >
          <span>Kunjungi Toko</span>
          <Icon name="arrow_forward" className="text-xs transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      <div className="flex items-start gap-3 sm:gap-4">
        {/* Store Avatar / Thumbnail */}
        <div className="relative h-12 w-12 sm:h-14 sm:w-14 shrink-0 overflow-hidden rounded-xl sm:rounded-2xl bg-surface-container border border-outline-variant/20 shadow-xs">
          <FallbackImage
            src={umkm.coverUrl}
            alt={umkm.name}
            className="h-full w-full object-cover"
            fallbackIcon="storefront"
          />
        </div>

        {/* Store Info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h4 className="font-headline-md text-on-surface truncate text-sm sm:text-base font-bold">
              {umkm.name}
            </h4>
            <span
              className="text-emerald-600 shrink-0"
              title="UMKM Terverifikasi Resmi"
            >
              <Icon name="verified" className="text-sm" />
            </span>
          </div>

          {umkm.category && (
            <p className="text-on-surface-variant text-[11px] sm:text-xs font-medium mt-0.5 truncate">
              Kategori: <span className="font-semibold text-primary">{umkm.category.name}</span>
            </p>
          )}

          {umkm.address && (
            <p className="text-on-surface-variant/80 flex items-center gap-1 text-[11px] sm:text-xs mt-0.5 sm:mt-1 truncate">
              <Icon name="location_on" className="text-slate-400 text-xs shrink-0" />
              <span className="truncate">{umkm.address}</span>
            </p>
          )}
        </div>
      </div>

      {/* Action Row */}
      <div className="mt-4 sm:mt-5 grid grid-cols-2 gap-2 sm:gap-2.5 pt-3 sm:pt-4 border-t border-outline-variant/15">
        <Link
          href={`/umkm/${umkm.slug}`}
          className="bg-surface-container-lowest hover:bg-surface-container border-outline-variant/30 text-on-surface flex items-center justify-center gap-1.5 rounded-xl border py-2 sm:py-2.5 text-[11px] sm:text-xs font-bold transition text-center truncate"
        >
          <Icon name="storefront" className="text-primary text-xs shrink-0" />
          <span className="truncate">Katalog Toko</span>
        </Link>

        {waContactUrl ? (
          <a
            href={waContactUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#25D366]/10 text-emerald-800 hover:bg-[#25D366]/20 border-emerald-500/20 flex items-center justify-center gap-1.5 rounded-xl border py-2 sm:py-2.5 text-[11px] sm:text-xs font-bold transition text-center truncate"
          >
            <Icon name="chat" className="text-emerald-600 text-xs shrink-0" />
            <span className="truncate">Chat Penjual</span>
          </a>
        ) : (
          <div className="bg-surface-container text-on-surface-variant/70 rounded-xl py-2 sm:py-2.5 text-center text-xs truncate">
            Hubungi via Pemdes
          </div>
        )}
      </div>
    </div>
  );
}
