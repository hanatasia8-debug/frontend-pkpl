# 01. Arsitektur Frontend & FSD — Web Desa Pringgodani

Dokumen ini membedah arsitektur kode frontend `testing` yang dibangun dengan metodologi **Feature-Sliced Design (FSD)** di atas **Next.js 16 App Router**.

---

## 1. Prinsip Feature-Sliced Design (FSD)

Aplikasi frontend mengadopsi pola arsitektur **Feature-Sliced Design (FSD)** untuk memisahkan kode berdasarkan domain bisnis dan tanggung jawab komponen.

### Diagram Hierarki Layer FSD

```
┌─────────────────────────────────────────────────────────────┐
│ 1. app/        - Routing Next.js, Layouts, & Global Providers│
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│ 2. views/      - Halaman Penuh / Screen Components          │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│ 3. widgets/    - Komponen Struktural (Navbar, Footer, Sidebar)│
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│ 4. features/   - Interaksi Pengguna & Logika Fitur Terisolasi │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│ 5. entities/   - Model Domain, Tipe DTO, Service, & Mock Data│
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│ 6. shared/     - UI Primitives, Axios Instance, & Utilities │
└─────────────────────────────────────────────────────────────┘
```

> [!IMPORTANT]
> **Aturan Impor Satu Arah (Unidirectional Imports):**
> Sebuah modul pada layer atas diizinkan mengimpor modul dari layer di bawahnya, tetapi **DILARANG KERAS** mengimpor modul dari layer di atasnya atau dari *slice* lain pada layer yang sama secara horizontal.

---

## 2. Struktur Direktori Sumber (`src/`)

```
testing/src/
├── app/                       # 1. Routing Next.js App Router
│   ├── (admin)/               # Route Group Panel Admin (/admin/*)
│   │   ├── admin/
│   │   │   ├── berita/        # /admin/berita (Daftar & Editor Berita)
│   │   │   ├── dashboard/     # /admin/dashboard (Statistik & Overview)
│   │   │   ├── maps/ / peta/  # /admin/peta (Manajemen Koordinat Peta)
│   │   │   ├── pengajuan/     # /admin/pengajuan (Kurasi Pengajuan Warga)
│   │   │   ├── profil/        # /admin/profil (Profil Desa & Pejabat)
│   │   │   ├── settings/      # /admin/settings (Pengaturan Web)
│   │   │   └── umkm/          # /admin/umkm (Daftar & Editor UMKM)
│   │   └── layout.tsx         # Layout Admin dengan Sidebar & Header
│   ├── (public)/              # Route Group Halaman Publik
│   │   ├── berita/            # /berita & /berita/[slug]
│   │   ├── peta/              # /peta (Peta Interaktif Publik)
│   │   ├── potensi/           # /potensi (Potensi Desa)
│   │   ├── produk/            # /produk & /produk/[id]
│   │   ├── profil/            # /profil (Profil Pemerintahan Desa)
│   │   ├── sejarah/           # /sejarah (Sejarah Desa Pringgodani)
│   │   ├── umkm/              # /umkm & /umkm/[slug]
│   │   ├── layout.tsx         # Layout Publik dengan Navbar & Footer
│   │   └── page.tsx           # Halaman Beranda (Home)
│   ├── (submit)/              # Route Group Pengajuan Warga
│   │   ├── submit/berita/     # /submit/berita
│   │   └── submit/umkm/       # /submit/umkm
│   ├── layout.tsx             # Root Layout (Font, Metadata, & Providers)
│   └── not-found.tsx          # Halaman 404 Kustom
│
├── views/                     # 2. Layer Views (Halaman Komposisi Penuh)
│   ├── admin-berita/          # Editor & Tabel Berita Admin
│   ├── admin-dashboard/       # Dashboard Admin
│   ├── admin-peta/            # Editor Koordinat Peta 2-Kolom
│   ├── admin-umkm/            # Editor & Tabel UMKM Admin
│   ├── berita-detail/         # Detail Artikel Berita & Blok Konten
│   ├── home/                  # Beranda (Hero, Statistik, Berita, UMKM, Peta)
│   ├── peta/                  # Halaman Peta Publik Interaktif
│   └── umkm-detail/           # Detail Profil UMKM & Katalog Produk
│
├── widgets/                   # 3. Layer Widgets (Komponen Struktural)
│   ├── header/                # Navbar Navigasi Publik
│   ├── footer/                # Footer Informasi & Kontak Desa
│   └── admin-sidebar/         # Sidebar Navigasi Menu Admin
│
├── features/                  # 4. Layer Features (Logika Interaksi)
│   ├── filter-umkm/           # Filter Kategori & Pencarian UMKM
│   ├── register-umkm/         # Alur Form & Draft Pendaftaran UMKM
│   ├── register-news/         # Alur Form & Draft Pengajuan Berita
│   └── google-maps-link/      # Generator Tautan & Ekstraktor Koordinat
│
├── entities/                  # 5. Layer Entities (Domain Bisnis & Service)
│   ├── admin/                 # Model & Service Admin (News, UMKM, Maps)
│   ├── banner/                # Model & Service Banner Beranda
│   ├── berita/                # Model, DTO, & Service Berita Publik
│   ├── desa/                  # Model & Service Profil Desa
│   ├── fasilitas/             # Model Titik Fasilitas & Peta
│   └── umkm/                  # Model, DTO, & Service UMKM Publik
│
└── shared/                    # 6. Layer Shared (Primitif & Utilitas)
    ├── api/                   # Axios Instance (`apiClient`) & Response Types
    ├── data/                  # Mock Data Fallback (`mock-news.ts`, `mock-umkm.ts`)
    ├── ui/                    # Komponen Primitif (Button, Modal, Icon, Input, FallbackImage)
    └── utils/                 # Image Compression, Maps Utils, Slug Generator
```

---

## 3. Catatan Penting Mengenai Penamaan `views/`

Pada proyek ini, layer FSD yang biasanya bernama `pages/` sengaja diberi nama **`views/`**. Hal ini dikarenakan Next.js otomatis mendeteksi folder bernama `src/pages/` sebagai *Pages Router* lama dan mewajibkan ekspor `default`, yang bertentangan dengan aturan arsitektur App Router & FSD. Fungsi dan peran layer `views/` tetap identik dengan layer *pages* pada standar FSD.
