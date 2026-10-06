import { getPotensiCategoryMeta } from "@/entities/potensi/model/category-meta";
import { FallbackImage } from "@/shared/ui/fallback-image";
import type { PotensiDetailDto } from "@/entities/potensi/model/types";

export function PotensiHero({ item }: { item: PotensiDetailDto }) {
  const categoryMeta = getPotensiCategoryMeta(item.category);

  return (
    <section className="relative h-[420px] w-full overflow-hidden md:h-[500px]">
      <FallbackImage
        src={item.coverImage}
        alt={item.title}
        className="absolute inset-0 h-full w-full object-cover"
        fallbackIcon="landscape"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      <div className="absolute bottom-0 left-0 mb-12 w-full">
        <div className="max-w-container-max px-gutter mx-auto">
          <div className="max-w-3xl">
            <span className="bg-primary-fixed text-on-primary-fixed-variant font-badge-xs text-badge-xs mb-4 inline-block rounded-full px-3 py-1 tracking-wider uppercase">
              {categoryMeta.label}
            </span>
            <h1 className="font-display-hero text-display-hero mb-2 text-white">
              {item.title}
            </h1>
            <p className="text-body-lg text-white/90">{item.overview}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
