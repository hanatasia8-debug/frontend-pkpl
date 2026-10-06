import type { Metadata } from "next";
import { UmkmListPage } from "@/views/umkm-list/umkm-list-page";

import { buildOpenGraphImage } from "@/shared/utils/og-image.helper";

export const metadata: Metadata = {
  title: "Direktori UMKM Pringgodani — Usaha & Produk Lokal Desa Pringgodani",
  description:
    "Direktori lengkap sentra usaha, produk olahan kuliner, kerajinan lokal, dan hasil bumi unggulan para pelaku UMKM Desa Pringgodani, Kecamatan Bantur, Kabupaten Malang.",
  keywords: [
    "umkm pringgodani",
    "umkm lokal pringgodani",
    "desa pringgodani",
    "produk umkm pringgodani",
    "katalog umkm pringgodani",
    "hasil bumi desa pringgodani",
    "kerajinan pringgodani",
    "kuliner pringgodani bantur",
  ],
  alternates: {
    canonical: "/umkm",
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "Lokal Pringgodani",
    title: "Direktori UMKM Pringgodani — Usaha & Produk Lokal Desa Pringgodani",
    description:
      "Jelajahi profil UMKM, katalog produk kreatif, dan hasil bumi unggulan Desa Pringgodani.",
    url: "/umkm",
    images: buildOpenGraphImage(
      "/images/og-image.png",
      "Direktori UMKM Desa Pringgodani",
    ),
  },
  twitter: {
    card: "summary_large_image",
    title: "Direktori UMKM Pringgodani — Usaha & Produk Lokal Desa Pringgodani",
    description:
      "Jelajahi profil UMKM, katalog produk kreatif, dan hasil bumi unggulan Desa Pringgodani.",
  },
};

export const dynamic = "force-dynamic";

export default function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <UmkmListPage searchParams={searchParams} />;
}
