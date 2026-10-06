import { AdminBeritaEditor } from "@/views/admin-berita";

export const metadata = {
  title: "Tulis Berita Baru — Admin Desa Pringgodani",
  description:
    "Formulir editor Live Split-View untuk membuat berita desa baru.",
};

export default function Page() {
  return <AdminBeritaEditor isNew={true} />;
}
