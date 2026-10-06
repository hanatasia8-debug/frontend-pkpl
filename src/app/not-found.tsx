import Link from "next/link";

/**
 * Custom 404. No prototype exists for this screen — final visual design
 * (following DESIGN.md tokens) will be built in Tahap 6.
 */
export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3 p-8 text-center">
      <h1 className="text-3xl font-semibold">404 — Halaman Tidak Ditemukan</h1>
      <p className="text-muted-foreground max-w-sm text-sm">
        Halaman yang Anda cari tidak tersedia atau sudah dipindahkan.
      </p>
      <Link href="/" className="text-primary text-sm underline">
        Kembali ke Beranda
      </Link>
    </main>
  );
}
