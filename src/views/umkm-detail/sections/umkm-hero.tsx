import { Icon } from "@/shared/ui/icon";
import { FallbackImage } from "@/shared/ui/fallback-image";
import { cn } from "@/shared/utils/cn";
import { getUmkmCategoryMeta } from "@/entities/umkm/model/category-meta";
import type { UmkmDetailDto } from "@/entities/umkm/model/types";

/**
 * Hero band of the detail prototype: photo, category badge, business name and
 * the owner/since line.
 *
 * Deviation from the mockup: the schema has no "established year" column, so
 * the second meta item states when the UMKM was published to the directory
 * ("Terdaftar sejak …") instead of inventing a founding year.
 */
export function UmkmHero({ umkm }: { umkm: UmkmDetailDto }) {
  const categoryMeta = getUmkmCategoryMeta(umkm.category);
  const registeredYear = new Date(umkm.publishedAt).getFullYear();
  const heroImage =
    umkm.coverUrl || umkm.logo || (umkm.gallery && umkm.gallery[0]) || "";

  return (
    <div className="group relative h-80 w-full overflow-hidden">
      <FallbackImage
        src={heroImage}
        alt={umkm.name}
        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        fallbackIcon="storefront"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

      <div className="absolute right-8 bottom-6 left-8">
        <span
          className={cn(
            "font-badge-xs text-badge-xs mb-4 inline-block rounded-full px-3 py-1 tracking-wider text-white uppercase",
            categoryMeta.badgeClass,
          )}
        >
          {categoryMeta.label}
        </span>
        <h1 className="font-headline-lg text-headline-lg mb-2 text-white">
          {umkm.name}
        </h1>
        <div className="font-label-sm text-label-sm flex flex-wrap items-center gap-4 text-white/90">
          <span className="flex items-center gap-1">
            <Icon name="person" className="text-sm" />
            Pemilik: {umkm.ownerName}
          </span>
          <span className="flex items-center gap-1">
            <Icon name="calendar_today" className="text-sm" />
            {umkm.since
              ? `Berdiri sejak Tahun ${umkm.since}`
              : `Terdaftar sejak ${registeredYear}`}
          </span>
          <span className="text-status-verified flex items-center gap-1">
            <Icon name="verified" filled className="text-sm" />
            Terverifikasi Pemerintah Desa
          </span>
        </div>
      </div>
    </div>
  );
}
