import Link from "next/link";
import { Icon } from "@/shared/ui/icon";
import { FallbackImage } from "@/shared/ui/fallback-image";
import { formatIndonesianDate } from "@/shared/utils/format-date";
import { cn } from "@/shared/utils/cn";
import { getNewsCategoryBadgeClass } from "@/entities/berita/model/category-meta";
import type { NewsDetailDto } from "@/entities/berita/model/types";

/** Byline used when a published article has no `authorId` (community
 *  submission approved without reassigning an author). */
const FALLBACK_AUTHOR_LABEL = "Admin Desa Pringgodani";

export function ArticleHeader({ news }: { news: NewsDetailDto }) {
  return (
    <>
      <nav
        className="text-on-surface-variant font-label-sm text-label-sm mb-6 flex items-center gap-2"
        aria-label="Breadcrumb"
      >
        <Link href="/berita" className="hover:text-primary">
          Berita
        </Link>
        <Icon name="chevron_right" className="text-[16px]" />
        <Link
          href={`/berita?kategori=${news.categorySlug}`}
          className="text-primary font-semibold"
        >
          {news.categoryName}
        </Link>
      </nav>

      <header className="mb-10">
        <span
          className={cn(
            "font-badge-xs text-badge-xs mb-4 inline-block rounded-lg px-3 py-1 tracking-wider uppercase",
            getNewsCategoryBadgeClass(news.categorySlug),
          )}
        >
          {news.categoryName}
        </span>
        <h1 className="font-headline-lg text-headline-lg md:text-display-hero text-primary mb-6 leading-tight">
          {news.title}
        </h1>

        <div className="border-outline-variant/30 flex flex-wrap items-center gap-6 border-y py-6">
          <div className="flex items-center gap-3">
            {/* The `User` model has no photo column — never invent one. When an
                author exists the avatar is FallbackImage's person placeholder;
                an unauthored article gets the generic label with no avatar. */}
            {news.authorName && (
              <div className="bg-surface-container h-10 w-10 overflow-hidden rounded-full">
                <FallbackImage
                  src={null}
                  alt={news.authorName}
                  className="h-10 w-10 object-cover"
                  fallbackIcon="person"
                />
              </div>
            )}
            <div>
              <p className="font-label-sm text-label-sm text-on-surface font-bold">
                {news.authorName ?? FALLBACK_AUTHOR_LABEL}
              </p>
              {news.authorRole && (
                <p className="font-label-sm text-label-sm text-on-surface-variant">
                  {news.authorRole}
                </p>
              )}
            </div>
          </div>

          <div className="bg-outline-variant/30 hidden h-8 w-[1px] md:block" />

          <div className="text-on-surface-variant flex items-center gap-2">
            <Icon name="calendar_today" />
            <span className="font-label-sm text-label-sm">
              {formatIndonesianDate(news.publishedAt)}
            </span>
          </div>

          <div className="text-on-surface-variant flex items-center gap-2">
            <Icon name="schedule" />
            <span className="font-label-sm text-label-sm">
              {news.readingTimeMinutes} Menit Baca
            </span>
          </div>
        </div>
      </header>
    </>
  );
}
