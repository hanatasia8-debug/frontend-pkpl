import type { Metadata } from "next";
import { SubmitRevisionPage } from "@/views/submit-revision/submit-revision-page";

interface Props {
  params: Promise<{ token: string }>;
}

export const metadata: Metadata = {
  title: "Revisi Pengajuan — Desa Pringgodani",
  description:
    "Perbaiki data pengajuan UMKM atau berita Anda yang ditolak oleh perangkat Desa Pringgodani, lalu kirim ulang untuk ditinjau.",
};

export default async function SubmitRevisionRoutePage({ params }: Props) {
  const { token } = await params;
  return <SubmitRevisionPage token={token} />;
}
