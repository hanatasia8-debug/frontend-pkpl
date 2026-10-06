"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@/shared/ui/icon";
import { AdminSubmissionsService } from "@/entities/admin/api/admin-submissions.service";
import { AdminNewsService } from "@/entities/admin/api/admin-news.service";
import { AdminUmkmService } from "@/entities/admin/api/admin-umkm.service";
import { AdminMapsService } from "@/entities/admin/api/admin-maps.service";
import { AdminIndexingCard } from "@/features/admin-indexing/ui/admin-indexing-card";

export default function AdminDashboardPage() {
  const [pendingCount, setPendingCount] = useState(0);
  const [newsCount, setNewsCount] = useState(0);
  const [umkmCount, setUmkmCount] = useState(0);
  const [mapsCount, setMapsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      AdminSubmissionsService.getPendingSubmissions(),
      AdminNewsService.getAllNews(),
      AdminUmkmService.getAllUmkm(),
      AdminMapsService.getLocations(),
    ])
      .then(([subData, newsData, umkmData, mapsData]) => {
        setPendingCount(subData.totalPending);
        setNewsCount(newsData.total);
        setUmkmCount(umkmData.total);
        setMapsCount(mapsData.length);
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      {/* Banner Ringkasan */}
      <div className="bg-primary text-on-primary relative overflow-hidden rounded-[2.5rem] p-8 shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.15),transparent_40%)]" />
        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <span className="text-on-primary inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-xs font-bold tracking-wider uppercase">
              <Icon name="verified" className="text-sm" /> Panel Resmi
              Pemerintah Desa
            </span>
            <h2 className="font-headline-lg mt-4 text-3xl font-bold">
              Selamat Datang di Panel Lokal Pringgodani!
            </h2>
            <p className="text-on-primary/80 mt-2 max-w-2xl text-sm leading-relaxed">
              Kelola katalog produk, direktori UMKM &amp; hasil bumi, tinjau antrean pengajuan warga, kelola titik geospasial peta desa, serta perbarui pengaturan website secara langsung.
            </p>
          </div>

          <Link
            href="/admin/pengajuan"
            className="bg-secondary-container text-on-secondary-container hover:bg-secondary-container/90 inline-flex items-center gap-2 self-start rounded-2xl px-6 py-4 text-sm font-bold whitespace-nowrap shadow-md transition md:self-auto"
          >
            <Icon name="assignment_turned_in" className="text-xl" />
            Tinjau Pengajuan Warga
            {pendingCount > 0 && (
              <span className="bg-error text-on-error rounded-full px-2.5 py-0.5 text-xs font-extrabold">
                {pendingCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Grid Metrik Utama */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="border-outline-variant/30 bg-surface-container-lowest rounded-3xl border p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-on-surface-variant font-label-sm text-xs font-bold tracking-wider uppercase">
              Pengajuan PENDING
            </span>
            <div className="bg-warning-container text-on-warning-container flex h-12 w-12 items-center justify-center rounded-2xl">
              <Icon name="pending_actions" className="text-2xl" />
            </div>
          </div>
          <div className="font-display-hero text-on-surface mt-4 text-4xl font-extrabold">
            {isLoading ? "..." : pendingCount}
          </div>
          <p className="text-on-surface-variant mt-2 text-xs">
            Pengajuan berita & UMKM menunggu persetujuan
          </p>
        </div>

        <div className="border-outline-variant/30 bg-surface-container-lowest rounded-3xl border p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-on-surface-variant font-label-sm text-xs font-bold tracking-wider uppercase">
              Berita Desa
            </span>
            <div className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-2xl">
              <Icon name="newspaper" className="text-2xl" />
            </div>
          </div>
          <div className="font-display-hero text-on-surface mt-4 text-4xl font-extrabold">
            {isLoading ? "..." : newsCount}
          </div>
          <p className="text-on-surface-variant mt-2 text-xs">
            Artikel & kabar kegiatan terdaftar
          </p>
        </div>

        <div className="border-outline-variant/30 bg-surface-container-lowest rounded-3xl border p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-on-surface-variant font-label-sm text-xs font-bold tracking-wider uppercase">
              UMKM Desa
            </span>
            <div className="bg-secondary/10 text-secondary flex h-12 w-12 items-center justify-center rounded-2xl">
              <Icon name="storefront" className="text-2xl" />
            </div>
          </div>
          <div className="font-display-hero text-on-surface mt-4 text-4xl font-extrabold">
            {isLoading ? "..." : umkmCount}
          </div>
          <p className="text-on-surface-variant mt-2 text-xs">
            Usaha warga yang telah terverifikasi
          </p>
        </div>

        <div className="border-outline-variant/30 bg-surface-container-lowest rounded-3xl border p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-on-surface-variant font-label-sm text-xs font-bold tracking-wider uppercase">
              Titik Peta Geospasial
            </span>
            <div className="bg-tertiary/10 text-tertiary flex h-12 w-12 items-center justify-center rounded-2xl">
              <Icon name="map" className="text-2xl" />
            </div>
          </div>
          <div className="font-display-hero text-on-surface mt-4 text-4xl font-extrabold">
            {isLoading ? "..." : mapsCount}
          </div>
          <p className="text-on-surface-variant mt-2 text-xs">
            Fasilitas umum & landmark di peta desa
          </p>
        </div>
      </div>

      {/* Info Banner Utama Beranda */}
      <div className="border-secondary/20 bg-secondary/5 flex items-start gap-4 rounded-3xl border p-6">
        <div className="bg-secondary/10 text-secondary flex items-center justify-center rounded-2xl p-3">
          <Icon name="info" className="text-2xl" />
        </div>
        <div>
          <h4 className="font-headline-md text-secondary text-base font-bold">
            Informasi Pengelolaan Banner Utama Beranda
          </h4>
          <p className="text-on-surface-variant mt-2 text-sm leading-relaxed">
            Gambar banner utama di halaman beranda depan diambil secara otomatis
            dari cover gambar berita terbaru yang berstatus{" "}
            <strong>PUBLISHED</strong>. Untuk mengubah gambar banner beranda,
            Anda cukup membuat/menerbitkan Berita Baru dengan gambar sampul
            (cover image) yang Anda inginkan.
          </p>
        </div>
      </div>

      {/* Pusat Web Indexing (Google Indexing API v3) */}
      <AdminIndexingCard />

      {/* Akses Cepat Modul Admin */}
      <div className="border-outline-variant/30 bg-surface-container-lowest rounded-3xl border p-8 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="font-headline-md text-primary text-xl font-bold">
              Modul Manajemen Desa
            </h3>
            <p className="text-on-surface-variant mt-1 text-sm">
              Pilih area kerja yang ingin Anda kelola.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/admin/pengajuan"
            className="group border-outline-variant/30 bg-surface hover:bg-surface-container-high rounded-2xl border p-6 shadow-sm transition hover:shadow-md"
          >
            <div className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-2xl transition group-hover:scale-110">
              <Icon name="assignment_turned_in" className="text-2xl" />
            </div>
            <h4 className="font-headline-md text-primary mt-4 text-base font-bold">
              Antrean Persetujuan Warga
            </h4>
            <p className="text-on-surface-variant mt-2 text-xs leading-relaxed">
              Tinjau pengajuan berita dan pendaftaran UMKM dari masyarakat desa
              secara langsung.
            </p>
            <span className="text-primary mt-4 inline-flex items-center gap-1.5 text-xs font-bold group-hover:underline">
              Buka Antrean →
            </span>
          </Link>

          <Link
            href="/admin/berita"
            className="group border-outline-variant/30 bg-surface hover:bg-surface-container-high rounded-2xl border p-6 shadow-sm transition hover:shadow-md"
          >
            <div className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-2xl transition group-hover:scale-110">
              <Icon name="edit_note" className="text-2xl" />
            </div>
            <h4 className="font-headline-md text-primary mt-4 text-base font-bold">
              Kelola & Tulis Berita
            </h4>
            <p className="text-on-surface-variant mt-2 text-xs leading-relaxed">
              Buat berita baru dengan editor Live Split-View dan kelola
              publikasi berita desa.
            </p>
            <span className="text-primary mt-4 inline-flex items-center gap-1.5 text-xs font-bold group-hover:underline">
              Kelola Berita →
            </span>
          </Link>

          <Link
            href="/admin/umkm"
            className="group border-outline-variant/30 bg-surface hover:bg-surface-container-high rounded-2xl border p-6 shadow-sm transition hover:shadow-md"
          >
            <div className="bg-secondary/10 text-secondary flex h-12 w-12 items-center justify-center rounded-2xl transition group-hover:scale-110">
              <Icon name="storefront" className="text-2xl" />
            </div>
            <h4 className="font-headline-md text-primary mt-4 text-base font-bold">
              Kelola Data UMKM
            </h4>
            <p className="text-on-surface-variant mt-2 text-xs leading-relaxed">
              Daftarkan produk unggulan desa, sunting profil UMKM, dan atur
              katalog usaha.
            </p>
            <span className="text-primary mt-4 inline-flex items-center gap-1.5 text-xs font-bold group-hover:underline">
              Kelola UMKM →
            </span>
          </Link>

          <Link
            href="/admin/peta"
            className="group border-outline-variant/30 bg-surface hover:bg-surface-container-high rounded-2xl border p-6 shadow-sm transition hover:shadow-md"
          >
            <div className="bg-tertiary/10 text-tertiary flex h-12 w-12 items-center justify-center rounded-2xl transition group-hover:scale-110">
              <Icon name="pin_drop" className="text-2xl" />
            </div>
            <h4 className="font-headline-md text-primary mt-4 text-base font-bold">
              Peta Geospasial & Fasilitas
            </h4>
            <p className="text-on-surface-variant mt-2 text-xs leading-relaxed">
              Atur koordinat lokasi fasilitas umum, kantor balai desa, dan
              landmark pada peta interaktif.
            </p>
            <span className="text-primary mt-4 inline-flex items-center gap-1.5 text-xs font-bold group-hover:underline">
              Kelola Peta →
            </span>
          </Link>

          <Link
            href="/admin/profil"
            className="group border-outline-variant/30 bg-surface hover:bg-surface-container-high rounded-2xl border p-6 shadow-sm transition hover:shadow-md"
          >
            <div className="bg-secondary/10 text-secondary flex h-12 w-12 items-center justify-center rounded-2xl transition group-hover:scale-110">
              <Icon name="assignment_ind" className="text-2xl" />
            </div>
            <h4 className="font-headline-md text-primary mt-4 text-base font-bold">
              Profil & Perangkat Desa
            </h4>
            <p className="text-on-surface-variant mt-2 text-xs leading-relaxed">
              Kelola sejarah, visi misi desa, serta jajaran perangkat desa dan
              struktur organisasi resmi.
            </p>
            <span className="text-primary mt-4 inline-flex items-center gap-1.5 text-xs font-bold group-hover:underline">
              Kelola Profil & Perangkat →
            </span>
          </Link>

          <Link
            href="/admin/settings"
            className="group border-outline-variant/30 bg-surface hover:bg-surface-container-high rounded-2xl border p-6 shadow-sm transition hover:shadow-md"
          >
            <div className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-2xl transition group-hover:scale-110">
              <Icon name="tune" className="text-2xl" />
            </div>
            <h4 className="font-headline-md text-primary mt-4 text-base font-bold">
              Pengaturan Utama Website
            </h4>
            <p className="text-on-surface-variant mt-2 text-xs leading-relaxed">
              Perbarui nama situs, alamat balai desa, email kontak, dan tautan
              sosial media resmi.
            </p>
            <span className="text-primary mt-4 inline-flex items-center gap-1.5 text-xs font-bold group-hover:underline">
              Atur Pengaturan →
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
