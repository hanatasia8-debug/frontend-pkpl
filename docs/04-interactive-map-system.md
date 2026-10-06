# 04. Sistem Peta Interaktif & Editor Geospasial — Web Desa Pringgodani

Dokumen ini menjelaskan arsitektur sistem pemetaan geospasial (*Geospatial Map System*), integrasi Google Maps JavaScript SDK, komponen kanvas peta, serta antarmuka editor koordinat presisi tinggi pada panel admin.

---

## 1. Komponen Singleton Loader Google Maps

Aplikasi memuat SDK Google Maps JavaScript secara asinkron menggunakan pola **Singleton Loader** di `src/features/google-maps-link/model/google-maps-loader.ts`:

* **Lazy Loading**: SDK hanya dimuat saat komponen peta pertama kali muncul di *viewport* pengguna (memanfaatkan *Intersection Observer*).
* **Deduplikasi Script**: Mencegah script Google Maps dimuat berulang kali saat berpindah halaman.
* **Fallback Elegan**: Menampilkan kerangka visual (*MapSkeletonLoader*) selama SDK sedang diunduh.

---

## 2. Kanvas Peta Interaktif (`GoogleMapCanvas`)

Komponen utama penyaji peta terletak di `src/views/peta/sections/google-map-canvas.tsx`:

```
┌─────────────────────────────────────────────────────────────┐
│                    GoogleMapCanvas                          │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Google Maps Hybrid Map (Citra Satelit + Nama Jalan)   │  │
│  │                                                       │  │
│  │   [📍 Marker Pin Kategori Usaha / Fasilitas]           │  │
│  │          │                                            │  │
│  │          ▼                                            │  │
│  │   ┌──────────────────────────────────────────────┐    │  │
│  │   │ InfoWindow Popup Kustom:                     │    │  │
│  │   │ - Foto Cover UMKM / Tempat                   │    │  │
│  │   │ - Badge Kategori & Nama Toko                 │    │  │
│  │   │ - Deskripsi Singkat & Alamat                 │    │  │
│  │   │ - [Petunjuk Arah ↗] & [Lihat Profil UMKM →]  │    │  │
│  │   └──────────────────────────────────────────────┘    │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Fitur Utama Kanvas Peta:
1. **Marker Pin Berbasis Kategori**: Ikon dan warna pin otomatis menyesuaikan kategori (Kuliner, Kerajinan, Pertanian, Jasa).
2. **Auto-Fit Bounds**: Peta otomatis mengatur tingkat perbesaran (*zoom level*) dan titik tengah (*center point*) agar seluruh pin UMKM yang sedang difilter dapat terlihat utuh di layar.
3. **Peta Satelit Hybrid**: Menggunakan tipe peta `hybrid` untuk memudahkan warga dan wisatawan mengenali bangunan fisik serta topografi Desa Pringgodani.

---

## 3. Editor Titik Koordinat Admin (Tata Letak 2-Kolom)

Pada menu **Admin Peta** (`src/views/admin-peta/admin-peta-page.tsx`), terdapat antarmuka modal berukuran luas (`max-w-6xl`) dengan tata letak 2 kolom yang dirancang khusus untuk mempermudah pemindahan titik pin lokasi:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Modal: Sunting Koordinat UMKM                                           [✕] │
├──────────────────────────────────────┬──────────────────────────────────────┤
│ KOLOM KIRI: Kanvas Peta Luas (540px) │ KOLOM KANAN: Form & Kontrol          │
│ ┌──────────────────────────────────┐ │ ┌──────────────────────────────────┐ │
│ │ [📍 Mode Pin] [🎯][🏘️][📍 GPS]  │ │ │ Link Google Maps:                │ │
│ ├──────────────────────────────────┤ │ │ [ https://maps.app.goo.gl/...  ] │ │
│ │                                  │ │ ├──────────────────────────────────┤ │
│ │     PETA INTERAKTIF LUAS         │ │ │ Latitude:      Longitude:        │ │
│ │     (Klik di mana saja untuk     │ │ │ [ -8.281120 ]  [ 112.566430 ]    │ │
│ │      memindahkan titik pin)      │ │ ├──────────────────────────────────┤ │
│ │                                  │ │ │ Alamat Lengkap Usaha:            │ │
│ │                                  │ │ │ [ Jl. Raya Desa Pringgodani... ] │ │
│ ├──────────────────────────────────┤ │ ├──────────────────────────────────┤ │
│ │ Status: -8.281120, 112.566430    │ │ │ [Batal]      [Simpan Koordinat]  │ │
│ └──────────────────────────────────┘ │ └──────────────────────────────────┘ │
└──────────────────────────────────────┴──────────────────────────────────────┘
```

### Alat Bantu Navigasi Peta:
* 🎯 **Pusatkan**: Mengarahkan fokus kamera peta langsung ke titik pin koordinat saat ini dengan zoom presisi 18.
* 🏘️ **Pusat Desa**: Menyetel ulang posisi kamera dan koordinat ke titik tengah Desa Pringgodani (`-8.2811, 112.5664`).
* 📍 **GPS Saya**: Memanfaatkan API `navigator.geolocation` browser untuk langsung menempatkan pin di lokasi perangkat admin saat ini.
* 🔗 **Ekstraktor Link Google Maps Otomatis**: Menempelkan (*paste*) tautan *share* dari aplikasi Google Maps akan langsung diekstrak menjadi Latitude & Longitude serta menggeser peta secara instan.
