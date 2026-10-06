import Link from "next/link";
import { Icon } from "@/shared/ui/icon";
import { FallbackImage } from "@/shared/ui/fallback-image";
import { formatRelativeTime } from "@/shared/utils/format-date";
import { cn } from "@/shared/utils/cn";
import { WhatsappCta } from "@/features/whatsapp-contact/ui/whatsapp-cta";
import { getUmkmCategoryMeta } from "../model/category-meta";
import type { UmkmListItemDto } from "../model/types";

export type UmkmCardVariant = "compact" | "listing" | "similar";

interface UmkmCardProps {
  umkm: UmkmListItemDto;
  variant?: UmkmCardVariant;
  className?: string;
}

export function UmkmCard({
  umkm,
  variant = "listing",
  className,
}: UmkmCardProps) {
  const categoryMeta = getUmkmCategoryMeta(umkm.category);
  const isCompact = variant === "compact";
  const isSimilar = variant === "similar";

  return (
    <article
      className={cn(
        "group bg-surface-container-lowest border-outline-variant/30 hover:border-primary/50 hover:shadow-xl relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border shadow-xs transition-all duration-300 hover:-translate-y-1",
        className,
      )}
    >
      <div>
        {/* Cover / Logo Banner */}
        <div className="bg-surface-container relative aspect-[16/10] w-full overflow-hidden">
          <Link href={`/umkm/${umkm.slug}`} className="block h-full w-full">
            <FallbackImage
              src={umkm.logo}
              alt={umkm.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              fallbackIcon="storefront"
            />
          </Link>

          {/* Badge Kategori */}
          <div className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5">
            <span
              className={cn(
                "font-label-sm rounded-md px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold tracking-wider text-white uppercase shadow-xs backdrop-blur-xs",
                categoryMeta.badgeClass,
              )}
            >
              {categoryMeta.label}
            </span>
          </div>

          {/* Badge Terverifikasi */}
          <div className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5">
            <span
              className="bg-primary text-on-primary flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full shadow-xs"
              title="UMKM Terverifikasi Pemerintah Desa"
            >
              <Icon name="verified" filled className="text-[10px] sm:text-xs text-white" />
            </span>
          </div>
        </div>

        {/* Info Konten */}
        <div className="p-3 sm:p-4">
          <div className="mb-1 flex items-start justify-between gap-1">
            <h3 className="font-headline-md text-on-surface group-hover:text-primary line-clamp-1 text-xs sm:text-base font-bold transition">
              <Link href={`/umkm/${umkm.slug}`}>{umkm.name}</Link>
            </h3>
            {isCompact && (
              <span className="text-on-surface-variant/70 shrink-0 text-[9px] sm:text-[10px] font-medium">
                {formatRelativeTime(umkm.publishedAt)}
              </span>
            )}
          </div>

          {/* Pemilik Usaha */}
          <p className="text-on-surface-variant mb-1.5 flex items-center gap-1 text-[10px] sm:text-[11px] font-medium">
            <Icon name="person" className="shrink-0 text-xs text-slate-400" />
            <span className="truncate">
              Pemilik: <span className="font-semibold">{umkm.ownerName}</span>
            </span>
          </p>

          {/* Deskripsi Singkat */}
          <p className="text-on-surface-variant/80 line-clamp-2 text-[11px] sm:text-xs leading-relaxed">
            {umkm.description}
          </p>
        </div>
      </div>

      {/* Footer Kartu */}
      <div className="border-outline-variant/15 bg-surface/40 border-t p-2.5 sm:p-3">
        {isCompact ? (
          <WhatsappCta
            phone={umkm.whatsappNumber}
            umkmName={umkm.name}
            className="w-full"
          />
        ) : isSimilar ? (
          <div className="flex items-center justify-between gap-2">
            <span className="text-on-surface-variant truncate text-[11px] sm:text-xs font-semibold">
              {umkm.ownerName}
            </span>
            <Link
              href={`/umkm/${umkm.slug}`}
              className="text-primary hover:text-primary/80 inline-flex shrink-0 items-center gap-1 text-[11px] sm:text-xs font-bold transition hover:underline"
            >
              <span>Detail</span>
              <Icon name="chevron_right" className="text-sm" />
            </Link>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-1.5">
            <span className="text-on-surface-variant/80 flex min-w-0 items-center gap-1 text-[10px] sm:text-[11px]">
              <Icon
                name="location_on"
                className="shrink-0 text-xs text-slate-400"
              />
              <span className="truncate">
                {umkm.address || "Desa Pringgodani"}
              </span>
            </span>
            <Link
              href={`/umkm/${umkm.slug}`}
              className="bg-primary/10 text-primary hover:bg-primary hover:text-on-primary inline-flex shrink-0 items-center gap-1 rounded-xl px-2.5 py-1 text-[11px] sm:text-xs font-bold transition-all"
            >
              <span>Kunjungi</span>
              <Icon name="arrow_forward" className="text-xs" />
            </Link>
          </div>
        )}
      </div>
    </article>
  );
}
