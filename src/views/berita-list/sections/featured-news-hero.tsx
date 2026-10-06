import Link from "next/link";
import { Icon } from "@/shared/ui/icon";
import { FallbackImage } from "@/shared/ui/fallback-image";
import type { NewsListItemDto } from "@/entities/berita/model/types";

interface FeaturedNewsHeroProps {
  news: NewsListItemDto;
}

/**
 * "Featured News Hero" (`prd_2.txt §4.6.1`): the top slot of /berita. There is
 * no "featured" flag anywhere in the schema and ordering by anything other
 * than `publishedAt DESC` is forbidden by the architecture plan, so the
 * featured slot is simply the most recent published article — and it is
 * excluded from the grid below so it never appears twice.
 */
export function FeaturedNewsHero({ news }: FeaturedNewsHeroProps) {
  return (
    <section className="max-w-container-max px-gutter mx-auto mb-16">
      <div className="group relative h-[500px] w-full overflow-hidden rounded-xl shadow-lg">
        <FallbackImage
          src={news.coverImage}
          alt={news.title}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          fallbackIcon="newspaper"
        />
        <div className="from-primary/90 via-primary/20 absolute inset-0 z-10 bg-gradient-to-t to-transparent" />
        <div className="absolute bottom-0 left-0 z-20 max-w-2xl p-8">
          <span className="bg-secondary font-badge-xs text-badge-xs mb-4 inline-block rounded px-3 py-1 text-white uppercase">
            {news.categoryName}
          </span>
          <h1 className="font-display-hero text-display-hero mb-4 leading-tight text-white">
            {news.title}
          </h1>
          <p className="font-body-lg text-body-lg mb-6 line-clamp-2 text-white/80">
            {news.summary}
          </p>
          <Link
            href={`/berita/${news.slug}`}
            className="bg-surface-container-lowest text-primary hover:bg-primary-fixed inline-flex items-center gap-2 rounded-lg px-6 py-3 font-bold transition-colors"
          >
            Baca Selengkapnya
            <Icon name="arrow_forward" />
          </Link>
        </div>
      </div>
    </section>
  );
}
