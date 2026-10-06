import type { Metadata } from "next";
import { BeritaService } from "@/entities/berita/api/berita.service";
import { BeritaDetailPage } from "@/views/berita-detail/berita-detail-page";
import { safeJsonLdStringify } from "@/shared/utils/safe-json-ld";
import {
  buildOpenGraphImage,
  toAbsoluteUrl,
} from "@/shared/utils/og-image.helper";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const news = await BeritaService.getBySlug(slug);

  if (!news) {
    return {
      title: "Berita Tidak Ditemukan",
    };
  }

  const title = `${news.title} — Kabar Desa Pringgodani`;
  const description = news.summary
    ? news.summary.substring(0, 160)
    : `Warta resmi, kegiatan UMKM, dan informasi pembangunan Desa Pringgodani, Bantur, Malang: ${news.title}`;

  // Hierarchical image discovery to ensure crawler gets the authentic news cover
  const coverImage =
    news.coverUrl ||
    news.coverImage ||
    (news.galleryImages && news.galleryImages[0]?.imageUrl) ||
    news.contentSections?.find((s) => s.imageUrl || s.sectionImage)?.imageUrl ||
    news.contentSections?.find((s) => s.imageUrl || s.sectionImage)?.sectionImage ||
    "/images/og-image.png";

  const absoluteCoverUrl = toAbsoluteUrl(coverImage);
  const ogImages = buildOpenGraphImage(coverImage, news.title);

  return {
    title,
    description,
    keywords: [
      news.title,
      "berita desa pringgodani",
      "kabar pringgodani",
      "desa pringgodani",
      "umkm pringgodani",
      news.categoryName || "Warta Desa",
      "bantur malang",
    ],
    alternates: {
      canonical: `/berita/${slug}`,
    },
    openGraph: {
      type: "article",
      locale: "id_ID",
      siteName: "Lokal Pringgodani",
      url: `/berita/${slug}`,
      title,
      description,
      publishedTime: news.publishedAt || undefined,
      authors: [news.authorName || "Humas Desa Pringgodani"],
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [absoluteCoverUrl],
    },
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const news = await BeritaService.getBySlug(slug);

  const jsonLd = news
    ? {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "NewsArticle",
            "@id": `https://lokalpringgodani.my.id/berita/${slug}#article`,
            headline: news.title,
            description: news.summary,
            image: news.coverUrl ? [news.coverUrl] : [],
            datePublished: news.publishedAt,
            dateModified: news.publishedAt,
            author: {
              "@type": "Organization",
              name: news.authorName || "Pemerintah Desa Pringgodani",
              url: "https://lokalpringgodani.my.id",
            },
            publisher: {
              "@type": "Organization",
              name: "Lokal Pringgodani",
              logo: {
                "@type": "ImageObject",
                url: "https://lokalpringgodani.my.id/images/logo.png",
              },
            },
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": `https://lokalpringgodani.my.id/berita/${slug}`,
            },
          },
          {
            "@type": "BreadcrumbList",
            "@id": `https://lokalpringgodani.my.id/berita/${slug}#breadcrumb`,
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Beranda",
                item: "https://lokalpringgodani.my.id",
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Kabar Desa",
                item: "https://lokalpringgodani.my.id/berita",
              },
              {
                "@type": "ListItem",
                position: 3,
                name: news.title,
                item: `https://lokalpringgodani.my.id/berita/${slug}`,
              },
            ],
          },
        ],
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLdStringify(jsonLd) }}
        />
      )}
      <BeritaDetailPage slug={slug} />
    </>
  );
}

