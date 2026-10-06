import Link from "next/link";
import { Icon } from "@/shared/ui/icon";
import { FallbackImage } from "@/shared/ui/fallback-image";
import { formatIndonesianDate } from "@/shared/utils/format-date";
import { cn } from "@/shared/utils/cn";
import { getNewsCategoryBadgeClass } from "../model/category-meta";
import type { NewsListItemDto } from "../model/types";

export type NewsCardVariant = "compact" | "listing" | "related";

interface NewsCardProps {
  news: NewsListItemDto;
  variant?: NewsCardVariant;
  className?: string;
}

export function NewsCard({
  news,
  variant = "compact",
  className,
}: NewsCardProps) {
  const isCompact = variant === "compact";

  return (
    <article
      className={cn(
        "scroll-reveal group visible flex h-full flex-col justify-between overflow-hidden rounded-2xl border transition-all",
        isCompact
          ? "bg-surface border-outline-variant/20 shadow-sm hover:shadow-md"
          : "bg-surface-container-lowest border-outline-variant/30 shadow-sm hover:shadow-xl",
        className,
      )}
    >
      <div>
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-surface-container">
          <Link href={`/berita/${news.slug}`} className="block h-full w-full">
            <FallbackImage
              src={news.coverImage}
              alt={news.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              fallbackIcon="newspaper"
            />
          </Link>

          {variant === "listing" && (
            <span
              className={cn(
                "absolute top-2 left-2 sm:top-3 sm:left-3 rounded px-2 py-0.5 sm:px-3 sm:py-1 text-[9px] sm:text-[11px] font-bold uppercase shadow-sm",
                getNewsCategoryBadgeClass(news.categorySlug),
              )}
            >
              {news.categoryName}
            </span>
          )}
          {variant === "related" && (
            <span className="font-badge-xs text-badge-xs text-primary glass-effect absolute top-2 left-2 sm:top-3 sm:left-3 rounded-lg bg-white/90 px-2 py-0.5 sm:px-3 sm:py-1 uppercase shadow-sm">
              {news.categoryName}
            </span>
          )}
        </div>

        <div className="p-3.5 sm:p-5">
          <div className="mb-2 flex items-center gap-1.5">
            {variant !== "related" && (
              <Icon name="calendar_today" className="text-primary text-xs sm:text-sm" />
            )}
            <time className="font-label-sm text-[10px] sm:text-xs text-on-surface-variant">
              {formatIndonesianDate(news.publishedAt)}
            </time>
          </div>

          <h3
            className={cn(
              "font-headline-md mb-2 line-clamp-2 cursor-pointer text-xs sm:text-base font-bold transition-colors leading-snug",
              variant === "related"
                ? "text-on-surface group-hover:text-primary"
                : "hover:text-primary",
            )}
          >
            <Link href={`/berita/${news.slug}`}>{news.title}</Link>
          </h3>

          <p
            className={cn(
              "font-body-base text-on-surface-variant text-[11px] sm:text-xs leading-relaxed",
              variant === "related" ? "line-clamp-2" : "line-clamp-2 sm:line-clamp-3",
            )}
          >
            {news.summary}
          </p>
        </div>
      </div>

      <div className="p-3.5 sm:p-5 pt-0 mt-auto">
        {variant === "listing" && (
          <div className="border-outline-variant/20 flex items-center justify-between border-t pt-3">
            <span className="text-on-surface-variant font-label-sm text-[10px] sm:text-xs truncate max-w-[50%]">
              {news.authorName ?? "Pemdes Pringgodani"}
            </span>
            <Link
              className="text-secondary font-label-sm text-[10px] sm:text-xs flex items-center gap-0.5 font-bold hover:underline shrink-0"
              href={`/berita/${news.slug}`}
            >
              <span>Baca</span>
              <Icon name="chevron_right" className="text-sm sm:text-base" />
            </Link>
          </div>
        )}

        {variant === "related" && (
          <Link
            href={`/berita/${news.slug}`}
            className="text-primary font-label-sm text-[10px] sm:text-xs flex items-center gap-1 font-bold hover:underline"
          >
            <span>Baca Selengkapnya</span>
            <Icon name="chevron_right" className="text-sm" />
          </Link>
        )}

        {isCompact && (
          <Link
            className="text-primary font-label-sm inline-flex items-center gap-1 font-bold hover:underline text-[10px] sm:text-xs"
            href={`/berita/${news.slug}`}
          >
            <span>Selengkapnya</span> <Icon name="arrow_right_alt" className="text-sm" />
          </Link>
        )}
      </div>
    </article>
  );
}
