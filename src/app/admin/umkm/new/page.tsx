import { AdminUmkmEditor } from "@/views/admin-umkm";

export const metadata = {
  title: "Tambah UMKM Baru — Admin Desa Pringgodani",
  description:
    "Formulir editor Live Split-View untuk mendaftarkan UMKM desa baru.",
};

export default function Page() {
  return <AdminUmkmEditor isNew={true} />;
}
