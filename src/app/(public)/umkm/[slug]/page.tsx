import type { Metadata } from "next";
import { UmkmService } from "@/entities/umkm/api/umkm.service";
import { UmkmDetailPage } from "@/views/umkm-detail/umkm-detail-page";
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
  const umkm = await UmkmService.getBySlug(slug);

  if (!umkm) {
    return {
      title: "UMKM Tidak Ditemukan",
    };
  }

  const title = `${umkm.name} — UMKM Desa Pringgodani`;
  const description = umkm.description
    ? umkm.description.substring(0, 160)
    : `Profil usaha, lokasi, kontak WhatsApp, dan produk unggulan dari ${umkm.name} di Desa Pringgodani, Bantur, Malang.`;

  // Hierarchical image discovery to ensure crawler always gets the authentic cover
  const coverImage =
    umkm.coverUrl ||
    umkm.logo ||
    (umkm.gallery && umkm.gallery[0]) ||
    (umkm.galleries && umkm.galleries[0]) ||
    "/images/og-image.png";

  const absoluteCoverUrl = toAbsoluteUrl(coverImage);
  const ogImages = buildOpenGraphImage(coverImage, umkm.name);

  return {
    title,
    description,
    keywords: [
      umkm.name,
      "umkm pringgodani",
      "umkm lokal pringgodani",
      "desa pringgodani",
      umkm.category || "UMKM",
      "usaha lokal pringgodani",
      "desa pringgodani bantur malang",
    ],
    alternates: {
      canonical: `/umkm/${slug}`,
    },
    openGraph: {
      type: "website",
      locale: "id_ID",
      siteName: "Lokal Pringgodani",
      url: `/umkm/${slug}`,
      title,
      description,
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
  const umkm = await UmkmService.getBySlug(slug);

  const jsonLd = umkm
    ? {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "LocalBusiness",
            "@id": `https://lokalpringgodani.my.id/umkm/${umkm.slug}#localbusiness`,
            name: umkm.name,
            description: umkm.description,
            image: umkm.coverUrl || umkm.logo,
            telephone: umkm.whatsappNumber || umkm.phone,
            address: {
              "@type": "PostalAddress",
              streetAddress: umkm.address,
              addressLocality: "Desa Pringgodani",
              addressRegion: "Kecamatan Bantur, Kabupaten Malang",
              addressCountry: "ID",
            },
            ...(umkm.latitude && umkm.longitude
              ? {
                  geo: {
                    "@type": "GeoCoordinates",
                    latitude: umkm.latitude,
                    longitude: umkm.longitude,
                  },
                }
              : {}),
            url: `https://lokalpringgodani.my.id/umkm/${umkm.slug}`,
          },
          {
            "@type": "BreadcrumbList",
            "@id": `https://lokalpringgodani.my.id/umkm/${umkm.slug}#breadcrumb`,
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
                name: "Direktori UMKM",
                item: "https://lokalpringgodani.my.id/umkm",
              },
              {
                "@type": "ListItem",
                position: 3,
                name: umkm.name,
                item: `https://lokalpringgodani.my.id/umkm/${umkm.slug}`,
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
      <UmkmDetailPage slug={slug} />
    </>
  );
}

