import type { Metadata } from "next";
import { UmkmService } from "@/entities/umkm/api/umkm.service";
import { RegisterUmkmPage } from "@/views/register-umkm/register-umkm-page";

export const metadata: Metadata = {
  title: "Daftarkan UMKM — Desa Pringgodani",
  description:
    "Formulir pengajuan pendaftaran UMKM Desa Pringgodani. Daftarkan usaha lokal Anda untuk memperluas jangkauan pasar dan mendukung ekonomi lokal.",
};

export default async function SubmitUmkmRoutePage() {
  const categoriesRes = await UmkmService.getCategories({ all: true });

  return <RegisterUmkmPage categories={categoriesRes.items} />;
}
