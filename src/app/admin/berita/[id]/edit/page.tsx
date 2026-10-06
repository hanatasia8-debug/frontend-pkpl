import { AdminBeritaEditor } from "@/views/admin-berita";

export const metadata = {
  title: "Sunting Berita — Admin Desa Pringgodani",
  description: "Formulir Live Split-View untuk menyunting liputan berita desa.",
};

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AdminBeritaEditor isNew={false} newsId={id} />;
}
