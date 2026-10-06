import type { Metadata } from "next";

import { AdminProfilPage } from "@/views/admin-profil";

export const metadata: Metadata = {
  title: "Profil Desa — Admin Panel",
  description:
    "Kelola sejarah, profil desa, dan informasi perangkat desa melalui panel admin.",
};

export default function Page() {
  return <AdminProfilPage />;
}
