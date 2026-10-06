import Link from "next/link";
import { Icon } from "@/shared/ui/icon";
import { NewsCard } from "@/entities/berita/ui/news-card";
import type { NewsListItemDto } from "@/entities/berita/model/types";

interface RelatedNewsSectionProps {
  items: NewsListItemDto[];
}

/**
 * "Berita Terkait" — up to 3 other articles in the same category, newest
 * first, with the article being read excluded. Hidden entirely when the
 * category has no other published article, rather than showing an empty rail.
 */
export function RelatedNewsSection({ items }: RelatedNewsSectionProps) {
  if (items.length === 0) return null;

  return (
    <section className="max-w-container-max px-gutter mx-auto mt-20">
      <div className="mb-8 flex items-center justify-between">
        <h2 className="font-headline-lg text-headline-lg text-primary">
          Berita Terkait
        </h2>
        <Link
          href="/berita"
          className="text-secondary font-label-sm text-label-sm flex items-center gap-2 font-bold hover:underline"
        >
          Lihat Semua Berita
          <Icon name="arrow_forward" />
        </Link>
      </div>

      <div className="gap-gutter grid grid-cols-1 md:grid-cols-3">
        {items.map((news) => (
          <NewsCard key={news.id} news={news} variant="related" />
        ))}
      </div>
    </section>
  );
}
