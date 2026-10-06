import { notFound } from "next/navigation";

import { BeritaService } from "@/entities/berita/api/berita.service";
import { ReadingProgressBar } from "./sections/reading-progress-bar";
import { ArticleHeader } from "./sections/article-header";
import { ArticleBody } from "./sections/article-body";
import { ShareBar } from "./sections/share-bar";
import { RelatedNewsSection } from "./sections/related-news-section";

interface BeritaDetailPageProps {
  slug: string;
}

/**
 * `views/berita-detail` — the /berita/[slug] view.
 *
 * An unknown slug (or one whose article is not PUBLISHED) resolves to `null`
 * from the Service and renders the shared `app/not-found.tsx` through Next's
 * `notFound()` — no bespoke error page. Everything still flows
 * Page → Service → API → Database.
 */
export async function BeritaDetailPage({ slug }: BeritaDetailPageProps) {
  const news = await BeritaService.getBySlug(slug);
  if (!news) notFound();

  // Related news must never take the whole article down with it.
  const relatedResult = await BeritaService.getRelated({
    categoryId: news.categoryId,
    excludeId: news.id,
    limit: 3,
  }).catch((err) => {
    console.error("Gagal memuat berita terkait:", err);
    return null;
  });

  return (
    <div className="pb-section-padding pt-24">
      <ReadingProgressBar />

      <article className="px-gutter mx-auto max-w-4xl">
        <ArticleHeader news={news} />
        <ArticleBody news={news} />
        <ShareBar title={news.title} summary={news.summary} />
      </article>

      <RelatedNewsSection items={relatedResult?.items ?? []} />
    </div>
  );
}
