"use client";

import { AdminIndexingCard } from "@/features/admin-indexing/ui/admin-indexing-card";
import { Icon } from "@/shared/ui/icon";

export default function AdminIndexingPage() {
  return (
    <div className="space-y-8">
      {/* Header Halaman */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
          <Icon name="travel_explore" className="text-base" />
          <span>Optimasi Mesin Pencari</span>
        </div>
        <h1 className="mt-2 text-3xl font-extrabold text-on-surface font-headline-lg">
          Google Search Console &amp; Auto-Indexing
        </h1>
        <p className="mt-2 text-sm text-on-surface-variant max-w-3xl">
          Kelola proses perayapan dan pengindeksan instan halaman desa di Google Search.
          Setiap ada penambahan atau pembaruan berita/UMKM/produk, sistem secara otomatis
          mengirimkan sinyal pembaruan URL ke antrean Google Indexing.
        </p>
      </div>

      {/* Widget Utama */}
      <AdminIndexingCard />

      {/* Panduan Tambahan Google Search Console */}
      <div className="rounded-3xl border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-sm">
        <h3 className="text-base font-bold text-on-surface font-headline-md flex items-center gap-2">
          <Icon name="help_outline" className="text-primary text-xl" />
          Panduan Otorisasi Google Search Console
        </h3>
        <ol className="mt-4 space-y-3 text-xs text-on-surface-variant leading-relaxed list-decimal list-inside">
          <li>
            Buka portal <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer" className="text-primary font-bold underline">Google Search Console</a> dan pilih properti situs Anda (<code>https://lokalpringgodani.my.id</code>).
          </li>
          <li>
            Buka menu <strong>Settings (Setelan)</strong> di panel sebelah kiri $\rightarrow$ pilih <strong>Users and permissions (Pengguna dan izin)</strong>.
          </li>
          <li>
            Klik tombol <strong>Add user (Tambahkan pengguna)</strong> di pojok kanan atas.
          </li>
          <li>
            Masukkan email Service Account: <code className="bg-surface-container px-2 py-0.5 rounded font-mono font-bold text-primary">google-indexer@lokal-desa.iam.gserviceaccount.com</code>
          </li>
          <li>
            Pilih Permission (Izin): <strong>Owner (Pemilik)</strong>, lalu klik <strong>Add (Tambahkan)</strong>.
          </li>
        </ol>
      </div>
    </div>
  );
}
