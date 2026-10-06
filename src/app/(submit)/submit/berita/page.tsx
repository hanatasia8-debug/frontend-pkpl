import type { Metadata } from "next";
import { BeritaService } from "@/entities/berita/api/berita.service";
import { RegisterNewsPage } from "@/views/register-news/register-news-page";

export const metadata: Metadata = {
  title: "Ajukan Berita — Desa Pringgodani",
  description:
    "Formulir pengajuan berita, pengumuman warga, dan kegiatan komunitas di lingkungan Desa Pringgodani.",
};

export default async function SubmitBeritaRoutePage() {
  const categoriesRes = await BeritaService.getCategories({ all: true });

  return <RegisterNewsPage categories={categoriesRes.items} />;
}
