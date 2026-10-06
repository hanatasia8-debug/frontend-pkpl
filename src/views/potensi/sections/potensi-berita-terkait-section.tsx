import Link from "next/link";
import { FallbackImage } from "@/shared/ui/fallback-image";
import { formatIndonesianDate } from "@/shared/utils/format-date";
import type { PotensiRelatedNewsDto } from "@/entities/potensi/model/types";

/**
 * "Berita Terkait" — see `potensi.service.ts` for how this list is found
 * (keyword search, not a real DB relation). A potensi genuinely can have
 * zero related news; that's shown as an honest empty state, not hidden.
 */
export function PotensiBeritaTerkaitSection({
  items,
}: {
  items: PotensiRelatedNewsDto[];
}) {
  if (items.length === 0) return null;

  return (
    <section>
      <h2 className="font-headline-lg text-headline-lg text-primary border-primary relative mb-8 pb-3">
        Berita Terkait
        <span className="bg-primary-container absolute bottom-0 left-0 h-[3px] w-12" />
      </h2>
      <div className="space-y-6">
        {items.map((news) => (
          <Link
            key={news.id}
            href={`/berita/${news.slug}`}
            className="hover:bg-surface-container-low flex gap-4 rounded-xl p-4 transition-colors"
          >
            <div className="h-24 w-24 shrink-0 overflow-hidden rounded-lg">
              <FallbackImage
                src={news.coverImage}
                alt={news.title}
                className="h-full w-full object-cover"
                fallbackIcon="newspaper"
              />
            </div>
            <div>
              <span className="text-badge-xs text-primary font-bold tracking-wider uppercase">
                {news.categoryName}
              </span>
              <h4 className="text-on-surface mb-1 font-bold">{news.title}</h4>
              <p className="text-label-sm text-outline">
                {formatIndonesianDate(news.publishedAt)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
