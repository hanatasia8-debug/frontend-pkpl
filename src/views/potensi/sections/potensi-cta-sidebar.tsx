import Link from "next/link";

/**
 * "Ingin Terlibat?" CTA. The prototype's button has no href — links to the
 * real UMKM registration route (`/umkm/daftar`), which already exists and
 * is what "mendaftarkan UMKM Anda yang bergerak di bidang ini" means in
 * practice.
 */
export function PotensiCtaSidebar() {
  return (
    <section className="border-outline-variant/30 rounded-3xl border-2 border-dashed p-8 text-center">
      <h4 className="text-primary mb-2 font-bold">Ingin Terlibat?</h4>
      <p className="text-label-sm text-outline mb-6">
        Daftarkan UMKM Anda yang bergerak di bidang ini.
      </p>
      <Link
        href="/umkm/daftar"
        className="bg-primary text-on-primary font-label-sm block w-full rounded-full py-3 transition-all hover:opacity-90"
      >
        Daftarkan UMKM Anda
      </Link>
    </section>
  );
}
