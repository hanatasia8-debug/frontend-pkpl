# Dokumentasi Teknis Frontend — Web Desa Pringgodani

Selamat datang di dokumentasi teknis resmi untuk **Aplikasi Frontend Website Desa Pringgodani** (`testing`). Dokumen ini disusun secara rinci untuk memandu pengembang dalam memahami arsitektur *Feature-Sliced Design* (FSD), sistem *Dual-Mode Data Fetching*, integrasi peta interaktif, manajemen form, dan prosedur pengembangan serta *deployment*.

---

## 🧭 Daftar Isi Dokumentasi

| Dokumen | Deskripsi Topik |
| :--- | :--- |
| [**01. Arsitektur Frontend & FSD**](./01-frontend-architecture.md) | Penjelasan pola *Feature-Sliced Design* (FSD), hierarki layer (`app`, `views`, `widgets`, `features`, `entities`, `shared`), dan aturan dependensi kode. |
| [**02. Data Fetching & Dual-Mode Architecture**](./02-data-fetching-and-dual-mode.md) | Cara kerja arsitektur *Dual-Mode*: integrasi live REST API ke backend vs otomatis fallback ke *Server-Side Mock Data* jika offline/tanpa API. |
| [**03. Manajemen Form, Draft, & Upload Gambar**](./03-forms-draft-and-uploads.md) | Validasi formulir berbasis skema Zod, fitur *Auto-Save Draft* ke `localStorage`, dan sistem kompresi gambar otomatis di sisi klien (*client-side*). |
| [**04. Sistem Peta Interaktif & Editor Geospasial**](./04-interactive-map-system.md) | Integrasi Google Maps JavaScript SDK via Singleton Loader, penempatan pin dinamis, deteksi koordinat GPS, dan modal editor peta 2-kolom. |
| [**05. Setup Lokal, Variabel Lingkungan, & Testing**](./05-local-setup-and-testing.md) | Panduan instalasi dependensi, konfigurasi `.env.local`, menjalankan server dev, serta eksekusi unit test berbasis Vitest. |
| [**06. Panduan Deployment & Optimasi Produksi**](./06-deployment-and-production.md) | Deployment ke Vercel/Netlify, konfigurasi *API Rewrites Proxy* di `next.config.ts`, optimasi SEO metadata, dan Core Web Vitals. |

---

## 📌 Ringkasan Teknis Frontend

* **Framework**: Next.js 16 (App Router & Server Components), React 19, TypeScript 5.
* **Styling**: Tailwind CSS v4, shadcn/ui primitives, Google Fonts Inter & Outfit.
* **Arsitektur**: *Feature-Sliced Design* (FSD v2.1).
* **Manajemen State & Form**: React Hook Form, Zod Schema Validation, LocalStorage Auto-Drafting.
* **Peta Geospasial**: Google Maps JavaScript SDK (Custom Canvas, Marker Popups, Coordinate Editor).
* **Media Optimization**: Client-Side Canvas Image Compressor (`compressImage`).
* **Pengujian**: Vitest + Testing Library.
