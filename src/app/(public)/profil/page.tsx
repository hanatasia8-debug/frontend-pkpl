import type { Metadata } from "next";
import { DesaService } from "@/entities/desa/api/desa.service";
import { ProfilPage } from "@/views/profil/profil-page";

import { buildOpenGraphImage } from "@/shared/utils/og-image.helper";

export const metadata: Metadata = {
  title: "Profil Desa Pringgodani — Struktur Pemerintahan & Potensi Desa",
  description:
    "Profil lengkap Desa Pringgodani, Kecamatan Bantur, Kabupaten Malang: visi misi, sambutan kepala desa, statistik kependudukan, sejarah, dan potensi ekonomi lokal.",
  keywords: [
    "desa pringgodani",
    "profil desa pringgodani",
    "pringgodani bantur malang",
    "pemerintah desa pringgodani",
    "kepala desa pringgodani",
    "potensi desa pringgodani",
  ],
  alternates: {
    canonical: "/profil",
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "Lokal Pringgodani",
    title: "Profil Desa Pringgodani — Kecamatan Bantur, Kabupaten Malang",
    description:
      "Profil lengkap Desa Pringgodani: visi misi, struktur pemerintahan, dan potensi ekonomi masyarakat.",
    url: "/profil",
    images: buildOpenGraphImage(
      "/images/og-image.png",
      "Profil Desa Pringgodani",
    ),
  },
  twitter: {
    card: "summary_large_image",
    title: "Profil Desa Pringgodani — Kecamatan Bantur, Kabupaten Malang",
    description:
      "Profil lengkap Desa Pringgodani: visi misi, struktur pemerintahan, dan potensi ekonomi masyarakat.",
  },
};

export const dynamic = "force-dynamic";

export default async function Page() {
  const { profile, stats } = await DesaService.getProfileWithStats();

  return (
    <ProfilPage
      profile={profile}
      stats={stats}
    />
  );
}
