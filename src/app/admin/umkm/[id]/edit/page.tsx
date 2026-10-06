import { AdminUmkmEditor } from "@/views/admin-umkm";

export const metadata = {
  title: "Sunting UMKM — Admin Desa Pringgodani",
  description: "Formulir Live Split-View untuk menyunting profil UMKM desa.",
};

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AdminUmkmEditor isNew={false} umkmId={id} />;
}
