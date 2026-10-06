import type { Metadata } from "next";
import { BeritaListPage } from "@/views/berita-list/berita-list-page";
import { safeJsonLdStringify } from "@/shared/utils/safe-json-ld";

import { buildOpenGraphImage } from "@/shared/utils/og-image.helper";

export const metadata: Metadata = {
  title: "Warta & Berita Desa Pringgodani — Kabar Terkini UMKM & Pembangunan",
  description:
    "Portal warta resmi Pemerintah Desa Pringgodani, kegiatan ekonomi UMKM, pengumuman warga, dan perkembangan pembangunan Desa Pringgodani, Kec. Bantur, Kab. Malang.",
  keywords: [
    "berita desa pringgodani",
    "kabar pringgodani",
    "desa pringgodani",
    "umkm pringgodani",
    "warta desa pringgodani",
    "bantur malang",
  ],
  alternates: {
    canonical: "/berita",
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "Lokal Pringgodani",
    title: "Warta & Berita Desa Pringgodani — Kabar Terkini UMKM & Pembangunan",
    description:
      "Informasi resmi seputar UMKM, program desa, dan kabar terkini warga Desa Pringgodani.",
    url: "/berita",
    images: buildOpenGraphImage(
      "/images/og-image.png",
      "Warta & Berita Desa Pringgodani",
    ),
  },
  twitter: {
    card: "summary_large_image",
    title: "Warta & Berita Desa Pringgodani — Kabar Terkini UMKM & Pembangunan",
    description:
      "Informasi resmi seputar UMKM, program desa, dan kabar terkini warga Desa Pringgodani.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "CollectionPage",
      "@id": "https://lokalpringgodani.my.id/berita#page",
      name: "Warta & Berita Desa Pringgodani",
      description: "Kabar terkini seputar UMKM, pemerintahan, dan kegiatan warga Desa Pringgodani.",
      url: "https://lokalpringgodani.my.id/berita",
      isPartOf: {
        "@type": "WebSite",
        "@id": "https://lokalpringgodani.my.id/#website",
        name: "Lokal Pringgodani",
      },
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://lokalpringgodani.my.id/berita#breadcrumb",
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
      ],
    },
  ],
};

export const dynamic = "force-dynamic";

export default function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLdStringify(jsonLd) }}
      />
      <BeritaListPage searchParams={searchParams} />
    </>
  );
}
