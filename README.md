# Website Resmi Desa Pringgodani (Frontend)

---

## 📚 [DOKUMENTASI TEKNIS FRONTEND]
Panduan arsitektur dan teknis lengkap frontend tersedia di folder [`docs/`](./docs/):
* 🏛️ [**01. Arsitektur Frontend & FSD**](./docs/01-frontend-architecture.md) — Pola Feature-Sliced Design, Layer Rules, & Directory Map.
* 🔄 [**02. Data Fetching & Dual-Mode**](./docs/02-data-fetching-and-dual-mode.md) — Integrasi Live REST API vs Server-Side Mock Fallback.
* 📝 [**03. Manajemen Form, Draft, & Uploads**](./docs/03-forms-draft-and-uploads.md) — Validasi Zod, Auto-Save LocalStorage, & Kompresi Gambar.
* 🗺️ [**04. Sistem Peta Interaktif & Editor Geospasial**](./docs/04-interactive-map-system.md) — Google Maps SDK Canvas, Pin Markers, & Modal Editor 2-Kolom.
* 💻 [**05. Setup Lokal, .env.local, & Testing**](./docs/05-local-setup-and-testing.md) — Panduan Dev Server & Unit Testing Vitest.
* 🚀 [**06. Panduan Deployment & Optimasi Produksi**](./docs/06-deployment-and-production.md) — Vercel Deploy, API Rewrites Proxy, SEO & Web Vitals.

---

> ## ⚠️ Repo ini sekarang PURE FRONTEND (4 Agustus 2026)
>
> Commit `cad74e9` ("feat : migrate to pure frontend", PR #1) **menghapus seluruh
> backend**: `prisma/` (schema, migrations, seed), `prisma.config.ts`,
> `docker-compose.yml`, `src/proxy.ts`, `src/shared/config/env.ts`, dan **semua**
> route `src/app/api/**`. Sumber data sekarang mock statis di
> `src/shared/data/mock-*.ts`.
>
> **Aturan pengerjaan yang berlaku sejak sekarang:** kerjakan **frontend saja** —
> jangan menghidupkan Prisma/DB, jangan membuat route `app/api/**`. Prioritas
> diubah karena deadline: **UMKM dituntaskan dulu, lalu Berita**, baru sisanya.
>
> Service layer di `src/entities/*/api/*.service.ts` sudah **dual-mode**: kalau
> `NEXT_PUBLIC_API_URL` diisi → memanggil backend eksternal; kalau kosong (default)
> → memakai mock data dengan filter/paginate di sisi server component. Jadi alur
> **Page → Service → (API | mock)** tetap dipatuhi: tidak ada komponen yang
> menyentuh sumber data langsung.
>
> Section Tahap 2/Tahap 3 di bawah **ditinggalkan sebagai catatan historis** —
> instruksi Docker/Prisma/Supabase di sana **tidak lagi berlaku** untuk repo ini,
> tapi jangan dihapus karena berisi keputusan skema yang tetap dipakai sebagai
> bentuk DTO. Sisa artefak lama: folder `src/generated/prisma/` masih ada sebagai
> untracked leftover dan **tidak diimpor oleh file mana pun** — aman dihapus.

## Stack

- Next.js (App Router, TypeScript strict, Turbopack)
- TailwindCSS v4 + shadcn/ui (komponen di-setup manual — lihat catatan di bawah)
- ~~Prisma 7 + PostgreSQL~~ — **dihapus** di migrasi pure frontend; bentuk DTO
  tetap mengikuti skema lama (`prd_2.txt §6.2`)
- ~~Supabase Auth + Supabase Storage~~ — **dihapus** di migrasi pure frontend
- TanStack Query, React Hook Form + Zod, Axios
- React Leaflet, Framer Motion
- Vitest + Testing Library (unit test service layer & validasi Zod, Tahap 6)
- ESLint + Prettier + Husky + lint-staged

## Arsitektur

Feature-Sliced Design: `app/ → processes/ → views/ → widgets/ → features/ → entities/ → shared/`.
Alur data wajib: **Page → Service → API → Database** — tidak ada fetch langsung dari
`page.tsx`/komponen ke database atau ke luar lewat Service Layer.

> **Catatan penamaan:** layer FSD "pages" di `01-architecture-plan.md §7` diberi nama
> folder **`views/`**, bukan `pages/`, di project ini. Next.js otomatis mendeteksi
> `src/pages/` sebagai direktori Pages Router (konvensi lama, tetap dikenali walau
> project ini pakai App Router) dan memvalidasi setiap file di dalamnya harus punya
> default export bertipe halaman — ini bentrok langsung dengan konvensi FSD yang
> file-nya named export biasa. Ini baru ketahuan saat build sungguhan gagal di Tahap 4
> (lihat catatan lengkap di bawah). Perannya di arsitektur tetap identik dengan layer
> "pages" FSD, cuma nama foldernya beda.

## Menjalankan project

```bash
npm install
npm run dev            # port 3001; tanpa DB/env apa pun — data dari mock
```

Perintah lain (script `prisma:*` sudah tidak ada setelah migrasi pure frontend):

```bash
npm run lint          # ESLint
npm run lint:fix
npm run format         # Prettier write
npm run format:check
npm run test           # Vitest (--passWithNoTests; belum ada file test sama sekali)
npm run build && npm run start
```

## Catatan setup (penting dibaca)

- **shadcn/ui di-setup manual**, bukan lewat `npx shadcn init/add`. CLI shadcn perlu
  akses ke `ui.shadcn.com` yang tidak tersedia di sandbox tempat scaffold ini dibuat.
  `components.json`, `src/shared/utils/cn.ts`, token CSS di `globals.css`, dan
  `src/shared/ui/button.tsx` sudah mengikuti konvensi resmi shadcn (style `new-york`,
  alias mengarah ke `@/shared/ui` sesuai FSD) — komponen shadcn lain tinggal ditambah
  dengan pola yang sama, atau jalankan `npx shadcn@latest add <component>` di mesin
  lokal Anda yang punya akses internet penuh.
- ~~Token desain di `globals.css` masih placeholder default shadcn~~ — sudah diganti ke
  token final Pringgodani di Tahap 4 (`#003527`/`#064E3B` Forest Authority,
  `#006399` Civic Blue).
- ~~Font `Geist`/`Geist Mono` masih placeholder~~ — sudah diganti ke Hanken Grotesk +
  Inter (`next/font/google`) + Material Symbols di Tahap 4, dan sudah terbukti ter-load
  di build/browser asli.
- ~~`prisma/schema.prisma` masih placeholder~~ — schema lengkap `prd_2.txt §6.2` (+ `Banner`
  dan `Settings`) sudah masuk di Tahap 2 dan sudah ter-migrasi ke PostgreSQL asli.
- ~~`prisma generate`/`migrate` belum bisa dijalankan~~ — sudah dijalankan sungguhan di
  mesin lokal, lihat [Hasil validasi](#hasil-validasi-di-mesin-lokal-3-agustus-2026).
- Folder FSD yang masih kosong berisi `.gitkeep` agar strukturnya tetap ter-track di git
  walau isinya belum ada.
- Beberapa slice `entities/` dan `features/` ditambah sedikit di luar daftar literal
  `01-architecture-plan.md §7` (`produk`, `fasilitas`, `pengajuan`, `audit-log` sebagai
  entities tambahan; beberapa feature CRUD/filter admin) supaya selaras dengan model
  database di §5. Beri tahu jika ini perlu dipangkas kembali ke daftar §7 secara literal.

## Roadmap tahap berikutnya

1. ~~Tahap 1 — Scaffold~~ ✅
2. ~~Tahap 2 — Database~~ ✅
3. ~~Tahap 3 — Auth & Storage Setup~~ ✅ (lihat catatan wajib di bawah — perlu project Supabase asli untuk dites penuh)
4. Tahap 4 — Halaman Publik: 🟡 **Home ✅, Berita ✅, UMKM ✅, Profil ✅, Potensi ✅, Peta 🟡, Submit Flow ✅**
   (Berita, UMKM, Profil, dan Submit Flow sudah tuntas; Potensi sudah diimplementasikan; Peta sudah tersedia sebagai halaman tetapi perlu verifikasi runtime Google Maps.)
   - Progress terbaru Profil: `src/app/(public)/profil/page.tsx` dan `src/views/profil/profil-page.tsx` telah diperbarui dengan desain hero, statistik desa, kegiatan terbaru, timeline, sejarah, visi/misi, dan direktori perangkat.
   - Progress terbaru Potensi: `src/app/(public)/potensi/page.tsx`, `src/views/potensi/potensi-page.tsx`, `src/entities/potensi/ui/potensi-card.tsx`, dan `src/entities/potensi/api/potensi.service.ts` telah ditambahkan; desain Potensi mencakup hero section, sticky filter kategori, daftar kartu potensi, dan CTA akhir.
   - Peta: `src/app/(public)/peta/page.tsx`, `src/views/peta/peta-page.tsx`, dan komponen map terkait sudah dibangun, namun fungsionalitas penuh menunggu `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` serta verifikasi runtime.
   - Submit flow: `/submit/berita` dan `/submit/umkm` kini tersedia. `/submit/umkm` menampilkan halaman pendaftaran UMKM di submit layout, sedangkan `/umkm/daftar` tetap tersedia sebagai direktori pendaftaran alternatif.
5. Tahap 5 — Admin Panel: ✅ dasar login/dashboard sudah dibuat di `src/app/admin` dengan layout dan halaman navigasi awal.
6. Tahap 6 — 404 final, SEO, testing, deployment

## Tahap 2 — Database: langkah wajib di mesin Anda ✅ SUDAH DIJALANKAN

Langkah-langkah di bawah **sudah dijalankan sungguhan di mesin lokal (3 Agustus 2026)**
— migrasi, seed, dan build semuanya berhasil. Perbaikan yang diperlukan agar bisa jalan
dicatat di [Hasil validasi di mesin lokal](#hasil-validasi-di-mesin-lokal-3-agustus-2026).

```bash
cp .env.local.example .env.local   # jika belum
docker compose up -d               # start PostgreSQL 16 lokal
npm run prisma:migrate -- --name init   # generate + jalankan migrasi pertama
npm run prisma:seed                # isi data dummy dev
npm run prisma:studio              # opsional: cek data lewat Prisma Studio
```

Migrasi pertama tersimpan di `prisma/migrations/20260803105313_init/`. Seed menghasilkan
6 berita, 4 UMKM, 5 produk, 3 potensi, 4 kategori berita, 5 fasilitas, 2 banner,
7 settings, 1 profil desa, dan **0 user** (memang disengaja — akun admin lewat Supabase
Auth di Tahap 3, bukan seed Prisma).

### Catatan schema.prisma

- Disalin **verbatim** dari `prd_2.txt §6.2` — semua model, enum, field, index, dan
  `@map`/`@@map` tidak diubah.
- Ditambahkan `Banner` (`id, imageUrl, title, linkUrl, order, isActive`) dan `Settings`
  (`id, key, value` + `description` opsional, key-value store) sesuai
  `01-architecture-plan.md §5`.
- Penyesuaian tooling (bukan perubahan struktur data) yang dibutuhkan **Prisma 7**:
  1. `generator client` diberi `output = "../src/generated/prisma"` secara eksplisit —
     Prisma 7 mewajibkan custom output path, beda dari Prisma <7 yang otomatis
     re-export lewat `@prisma/client`.
  2. `url`/`directUrl` **dikeluarkan dari blok `datasource`** dan dipindah ke
     `prisma.config.ts` — Prisma 7 menolaknya di schema (error `P1012`).
  3. Client wajib pakai **driver adapter** (`@prisma/adapter-pg`); `new PrismaClient()`
     tanpa `adapter` sudah tidak jalan lagi.

  Import client lewat `src/shared/lib/prisma.ts` (singleton), jangan `new PrismaClient()`
  di tempat lain. Semua model, enum, field, relasi, index, dan `@map`/`@@map` tetap
  tidak berubah dari PRD.

- **`passwordHash` — SUDAH DIPUTUSKAN (3 Agustus 2026): opsi (a).** Model `User` di PRD
  punya kolom `passwordHash` (asumsi auth JWT manual), padahal brief mewajibkan
  **Supabase Auth** — kredensial sebenarnya dikelola Supabase di skema `auth.users`
  miliknya sendiri, bukan di tabel `users` Prisma kita. Keputusan: **kolomnya dibiarkan
  ada (PRD §6.2 tetap verbatim) tapi tidak pernah diisi**, dan `users.id` disamakan
  dengan Supabase Auth user id. Jangan hapus kolom ini, dan jangan pernah menulis
  password/hash ke tabel `users`.
- Seed data (`prisma/seed.ts`) **sengaja tidak membuat baris `User`/admin** — akun admin
  akan dibuat lewat Supabase Auth di Tahap 3, bukan lewat seed Prisma.
- Path gambar di seed data adalah **placeholder key** mengikuti taxonomy folder di
  `prd_2.txt §7.1` (belum ada file asli — Supabase Storage baru disiapkan Tahap 3).

## Tahap 3 — Auth & Storage Setup

Yang dibuat:

- `src/shared/lib/supabase/client.ts` — Supabase client untuk Client Components.
- `src/shared/lib/supabase/server.ts` — Supabase client untuk Server Components/Route
  Handlers/Server Actions (cookie-based session, pola resmi `@supabase/ssr`).
- `src/shared/lib/supabase/admin.ts` — service-role client (bypass RLS) untuk upload &
  operasi admin server-side. **Jangan pernah** diimpor ke Client Component.
- `src/shared/lib/supabase/middleware.ts` + `src/proxy.ts` — proteksi route `/admin/*`:
  redirect ke `/admin/login` jika belum login, redirect ke `/admin/dashboard` jika
  sudah login tapi membuka halaman login.
- `src/shared/lib/storage/` — helper upload gambar lengkap dengan pipeline dari
  `prd_2.txt §7.2`: validasi _magic bytes_ (bukan percaya ekstensi/MIME dari client),
  resize + convert ke WebP + strip EXIF via Sharp (preset `cover`/`avatar`/`gallery`
  sesuai §7.2), lalu upload ke Supabase Storage. **Fallback otomatis ke
  `public/uploads/`** kalau `SUPABASE_SERVICE_ROLE_KEY` belum diisi, jadi bisa dites
  tanpa project Supabase asli — sudah saya validasi manual pipeline resize/WebP/local
  write-nya jalan benar di sandbox saya (2000px → 1200px cover, 400×400 avatar,
  penolakan file bukan gambar, dll).

### ⚠️ `middleware.ts` → `proxy.ts` (temuan penting)

Next.js 16 (versi yang ter-install, 16.2.12) **mendeprecate file convention
`middleware.ts`** dan menggantinya dengan `proxy.ts` (export function `proxy`,
bukan `middleware`) — di versi terbaru Next.js bahkan **tidak lagi mendeteksi**
`middleware.ts` sama sekali (bukan cuma warning). Saya sudah pakai `src/proxy.ts` dari
awal, bukan `middleware.ts`, supaya proteksi `/admin/*` benar-benar jalan. Kalau nanti
ada referensi lain (tutorial, AI agent lain) yang bikin `middleware.ts`, itu file yang
salah nama untuk versi Next.js ini.

### Konfigurasi env yang perlu Anda isi

Sebelum `/admin/*` atau fitur upload bisa dites sungguhan, buat project di
[supabase.com](https://supabase.com) lalu isi di `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL="https://xxxxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
SUPABASE_SERVICE_ROLE_KEY="..."   # Project Settings > API > service_role (rahasia!)
```

Lalu buat bucket **`villagecms-media-bucket`** di Supabase Storage (nama ini di-hardcode
di `src/shared/lib/storage/config.ts`).

Validasi env-nya **lazy** (baru dicek saat benar-benar dipakai, bukan saat server start)
supaya halaman publik tetap jalan normal walau Supabase belum dikonfigurasi — tapi kalau
Anda buka `/admin/*` atau memanggil `uploadImage()` tanpa env terisi, akan muncul error
yang jelas menyebutkan variabel mana yang kurang.

### Belum bisa saya validasi di sandbox ini

- Login/redirect sungguhan lewat `src/proxy.ts` — perlu project Supabase asli + halaman
  `/admin/login` (baru dibangun UI-nya di Tahap 5). Logikanya sudah saya tulis mengikuti
  pola resmi Supabase untuk Next.js App Router, tapi belum diuji end-to-end.
- Upload sungguhan ke Supabase Storage (baru bisa dites setelah Anda isi env + buat
  bucket). Pipeline resize/validasi/local-fallback-nya sudah saya uji manual dan jalan.

### Aturan untuk login UI Tahap 5 (sudah diputuskan)

Kolom `passwordHash` di tabel `users` **tetap ada tapi tidak pernah diisi** (keputusan
3 Agustus 2026, lihat catatan Tahap 2 di atas). Saat membangun form login Tahap 5,
`User.id` **wajib** disamakan dengan Supabase Auth user id — bukan generate UUID baru —
supaya relasi `News.author`/`AuditLog.user`/dst tetap konsisten.

## Tahap 4 — Halaman Publik: Home (langkah 1/6)

Yang dibuat:

- **Design system nyata** di `globals.css` — palet warna, skala tipografi
  (`display-hero`/`headline-lg`/`body-base`/dst dengan line-height, weight, letter-spacing
  masing-masing), skala spacing (`gutter`, `section-padding`, `stack-sm/md/lg`) — disalin
  persis dari `tailwind.config` di setiap `code.html` prototype, disilangkan dengan
  `DESIGN.md`. Token semantik shadcn/ui (`--color-primary`, dst) dipetakan ke palet yang
  sama supaya komponen shadcn otomatis konsisten secara visual.
- Font asli: **Hanken Grotesk** (heading) + **Inter** (body) lewat `next/font/google`,
  plus **Material Symbols Outlined** lewat stylesheet link (tidak didukung `next/font`).
- `Icon`, `FallbackImage` (gambar dengan empty-state kalau `src` kosong/gagal dimuat —
  dipakai di mana pun ada gambar dari storage), `useScrollReveal` (port React dari
  animasi scroll-reveal prototype).
- Data layer lengkap untuk Home: entity `berita`, `umkm`, `desa`, `fasilitas`, `banner`,
  `settings` — masing-masing DTO type + Service (`entities/*/api/*.service.ts`) + Route
  Handler (`app/api/*/route.ts`) yang query Prisma langsung. Page **tidak pernah**
  import Prisma langsung — selalu lewat Service → API.
- `widgets/navbar`, `widgets/footer`, `widgets/hero` + seluruh section Home di
  `src/views/home/` (Welcome/Sambutan Kepala Desa, Statistik, UMKM showcase, Berita
  Terbaru, Peta preview, Community CTA).

### ⚠️ Temuan penting: `pages/` bentrok dengan Next.js Pages Router

Next.js **otomatis mendeteksi** `src/pages/` sebagai direktori Pages Router (konvensi
lama) — walaupun project ini 100% App Router — dan memvalidasi setiap file di
dalamnya harus punya default export bertipe halaman. Ini baru ketahuan lewat `npm run
build` sungguhan di sandbox saya (build gagal dengan error TypeScript yang membingungkan
kalau tidak diselidiki). Layer FSD "pages" karena itu saya beri nama folder **`views/`**
di project ini — perannya di arsitektur (Page → Service → API → Database, komposisi
tampilan) tetap identik dengan yang dimaksud `01-architecture-plan.md §7`, cuma nama
foldernya beda karena Next.js reserve nama itu. Kalau ada alat/panduan lain yang bikin
`src/pages/...`, itu akan bentrok — pakai `src/views/...`.

### Dua keputusan (1 sudah dikonfirmasi, 1 asumsi yang berjalan)

1. **Format route API — SUDAH DIKONFIRMASI (3 Agustus 2026): pakai `/api/berita`.**
   `prd_2.txt §9.1` memakai prefix `/api/v1/` dan nama resource Inggris
   (`/api/v1/news`), tapi struktur route dari sitemap `01-architecture-plan.md`
   (`/api/berita`, tanpa prefix versi) yang dipertahankan — dokumen itu dinyatakan final
   untuk struktur folder/route. Jangan diubah ke `/api/v1/*` di tahap berikutnya. Yang
   diambil dari PRD §9 hanyalah **format envelope response**-nya (`{success, statusCode,
message, data}` / format error dengan `validationErrors`) — lihat
   `src/shared/api/response.ts`.
2. **Hero pakai Banner, bukan gambar statis**: prototype `beranda_desa_pringgodani_1`
   memakai satu gambar latar hardcode (wajar, mockup statis tidak bisa mendemokan
   banner dinamis). Karena brief awal minta model `Banner` ditambahkan, saya sambungkan
   hero ke banner aktif pertama (urutan `order`), fallback ke warna primary polos kalau
   belum ada banner — bukan cuma dekorasi mati. Layout, copy, dan kedua tombol CTA tetap
   identik dengan prototype.

Asumsi kecil lain (tidak butuh keputusan, tapi dicatat): tombol hero "Eksplorasi Desa" →
`/potensi`, "Layanan Publik" → `/profil` (prototype tidak menentukan target link-nya);
nama Kepala Desa/foto diambil dari `VillageProfile.officials` (cari entri yang
`position`-nya mengandung "kepala desa") karena skema tidak punya field nama kepala desa
terpisah; "Sekilas Sejarah" di Home adalah potongan ~200 karakter pertama dari
`historyText` (skema tidak punya field ringkasan terpisah).

## Hasil validasi di mesin lokal (3 Agustus 2026)

Semua langkah yang di sandbox sebelumnya "belum tervalidasi" sudah dijalankan sungguhan
di mesin lokal: Docker Postgres, `prisma generate`, `migrate dev --name init`, seed,
`npm run build` **tanpa stub apa pun** (Prisma client & Google Fonts asli),
`npm run start`, plus verifikasi visual lewat screenshot browser headless.

Status perintah: `lint` ✅ bersih, `format:check` ✅ bersih, `tsc --noEmit` ✅ bersih,
`build` ✅ sukses, `test` ✅ (masih 0 test file — lihat catatan di bawah).

### Yang harus diperbaiki agar bisa jalan

1. **Prisma 7 menolak `url`/`directUrl` di `schema.prisma`** (`P1012`) → dibuat
   `prisma.config.ts` (datasource url, path migrasi, seed command). Prisma 7 juga tidak
   lagi auto-load file `.env`, dan project ini pakai `.env.local` (konvensi Next.js) yang
   memang tidak pernah dibaca Prisma CLI — jadi env dimuat manual lewat
   `process.loadEnvFile(".env.local")` di `prisma.config.ts` dan `prisma/seed.ts`.
2. **Prisma 7 mewajibkan driver adapter** → `@prisma/adapter-pg` ditambahkan sebagai
   dependency, dipakai di `src/shared/lib/prisma.ts` dan `prisma/seed.ts`.
3. **Dua type error yang sebelumnya tertutup oleh Prisma client stub**: di
   `app/api/peta/route.ts` dan `app/api/umkm/route.ts`, hasil validasi `category` tidak
   ter-narrow ke enum Prisma karena guard-nya berbentuk `if (param && !isValid(param))`.
   Diperbaiki dengan nested guard + variabel yang sudah bertipe enum. Validasi runtime-nya
   sendiri tidak berubah.
4. **Home tampil kosong walau DB penuh data** (temuan terpenting). Home sebelumnya
   ter-_prerender_ statis, sedangkan Service Layer memanggil Route Handler app ini sendiri
   lewat HTTP — saat build tidak ada server yang mendengar, jadi keempat request gagal,
   ditelan `Promise.allSettled`, dan HTML kosong ikut "dibekukan" ke hasil build. Dua
   perbaikan: `export const dynamic = "force-dynamic"` di `app/(public)/layout.tsx` (semua
   route publik memang menampilkan konten CMS live), dan base URL server sekarang
   diturunkan dari header `Host` tiap request di `shared/api/axios-instance.ts` — bukan
   `http://localhost:3000` yang di-hardcode, yang diam-diam salah begitu app jalan di
   port/domain lain. Override tetap tersedia lewat `INTERNAL_API_BASE_URL`.
   Catatan Next 16: `dynamic` hilang kalau **Cache Components** diaktifkan — kalau nanti
   `cacheComponents` dinyalakan, ganti ke `await connection()` (`next/server`).
5. **Generated Prisma client ikut ke-lint** (folder `src/generated/` baru ada setelah
   `prisma generate` jalan sungguhan; di sandbox belum pernah ada) → 403 error ESLint palsu.
   Ditambahkan ke `globalIgnores` di `eslint.config.mjs` dan ke `.prettierignore`
   (bersama `.claude/`). Sudah gitignored sejak Tahap 2.
6. `npm run test` sebelumnya exit 1 karena Vitest tidak menemukan test file → dikasih
   `--passWithNoTests` supaya perintahnya tidak "merah" sampai test asli dibuat di Tahap 6.

### Sudah diverifikasi jalan

- 6 Route Handler publik (`/api/berita`, `/api/umkm`, `/api/peta`, `/api/profil`,
  `/api/banner`, `/api/settings`) → HTTP 200 dengan envelope `{success, statusCode,
message, data}` dan data seed asli.
- Home me-render data asli di **semua** section: sambutan + nama Kepala Desa
  ("Ki Suryo Pringgo") dari `VillageProfile.officials`, statistik (4 UMKM / 5 produk /
  5 berita / 8 dusun), 3 kartu UMKM, 3 kartu berita dengan tanggal Indonesia, preview peta
  dengan "Kantor Desa Pringgodani" dari DB, dan footer memakai `Settings` dari DB.
- Visual sesuai design system: Forest Authority `#003527`/`#064E3B`, Civic Blue `#006399`,
  Hanken Grotesk + Inter, Material Symbols, animasi scroll-reveal.

### Yang masih belum bisa divalidasi (butuh Anda)

- **Supabase**: `/admin/*` (proxy auth) dan upload sungguhan ke Storage belum tersentuh —
  perlu project Supabase asli, `.env.local` diisi, dan bucket
  `villagecms-media-bucket` dibuat. Halaman publik jalan normal tanpa ini (validasi lazy).
- **Gambar**: semua path gambar seed masih placeholder key (belum ada file asli), jadi
  tampil sebagai empty-state ikon `FallbackImage` — bukan bug. Akan normal setelah ada
  upload sungguhan.

## Tahap 4 — Berita: List + Detail (langkah 2/6) ✅

Dikerjakan 4 Agustus 2026 dini hari, **sebelum** repo dimigrasi ke pure frontend.
Sesi itu terputus (kredit habis) tepat di langkah screenshot verifikasi visual, dan
belum sempat menulis catatan ini — karena itu section ini ditulis belakangan.

File yang ada sekarang (semuanya lolos build & sudah ter-commit):

- Route: `src/app/(public)/berita/(list)/page.tsx` + `loading.tsx`,
  `src/app/(public)/berita/[slug]/page.tsx`
- View: `src/views/berita-list/` (filter bar, featured hero, grid skeleton,
  empty/error state) dan `src/views/berita-detail/` (article header/body, share bar,
  reading progress, related news)
- Feature: `src/features/filter-berita/`, `src/features/search-berita/`
- Widget: `src/widgets/pagination/pagination.tsx` (dipakai ulang oleh /umkm)

### ⚠️ Temuan penting: `loading.tsx` bikin 404 jadi HTTP 200

`loading.tsx` membuat Suspense boundary untuk segment-nya **dan semua segment di
bawahnya**. Diletakkan di `berita/loading.tsx`, ia ikut membungkus `berita/[slug]`,
sehingga response mulai di-stream sebelum view detail bisa memanggil `notFound()` —
slug tidak dikenal jadi merender UI 404 dengan status **HTTP 200** (status tidak bisa
diubah setelah header terkirim). Solusi: taruh `loading.tsx` di dalam route group
`(list)`. **Pola ini wajib diikuti untuk setiap pasangan list+detail** — sudah
diterapkan juga di `/umkm`, dan harus dipakai untuk `/potensi` nanti.

## Tahap 4 — UMKM: Direktori + Detail (langkah 3/6) ✅

Dikerjakan 4 Agustus 2026 (sesi lanjutan), **sesudah** migrasi pure frontend, jadi
100% tanpa backend: data dari `src/shared/data/mock-umkm.ts` lewat `UmkmService`.

### File yang dibuat/diubah

**Entity `umkm`**

- `model/types.ts` — `UmkmListItemDto` ditambah `address` + `ownerName`; DTO baru
  `UmkmDetailDto`, `UmkmProductDto`, `UmkmPotentialSummaryDto`, `UmkmCategoryDto`
- `model/category-meta.ts` — label + **slug URL** + badge class per enum
  `UmkmCategory`, plus `resolveUmkmCategory()` (menerima slug maupun enum)
- `model/whatsapp-link.ts` — tambah `formatWhatsappNumber()` (`6281…` → `+62 812-…`)
- `api/umkm.service.ts` — tambah `getPaginated()`, `getBySlug()`, `getSimilar()`,
  `getCategories()`; filter/sort/paginate mock dilakukan di service, bukan di view
- `ui/umkm-card.tsx` — **satu** komponen kartu, tiga varian: `compact` (Home),
  `listing` (direktori), `similar` ("UMKM Serupa"). Tidak ada komponen kartu duplikat.

**Data mock** — `src/shared/data/mock-umkm.ts` diperluas dari 4 → **12 UMKM** yang
mencakup keenam kategori, dengan alamat, koordinat, galeri, dan produk. Sengaja ada
kasus tepi: `konveksi-batik-pringgodani` (galeri kosong),
`servis-elektronik-hendra` (tanpa produk), `gerabah-souvenir-pringgodani`
(produk dengan `price: null`). 12 item = 2 halaman → pagination benar-benar bisa dites.

**View**

- `src/views/umkm-list/` — `umkm-list-page.tsx`, `sections/umkm-filter-bar.tsx`,
  `sections/umkm-promo-section.tsx`, `ui/umkm-grid-skeleton.tsx`, `ui/results-state.tsx`
- `src/views/umkm-detail/` — `umkm-detail-page.tsx` + sections: breadcrumb, hero,
  products, info sidebar, gallery (bento), related potential, similar UMKM

**Feature / widget baru (reusable untuk langkah berikutnya)**

- `src/widgets/search-box/search-box.tsx` — search box URL-backed generik
  (debounce 400 ms, reset ke halaman 1). `features/search-berita` **dan**
  `features/search-umkm` sekarang jadi wrapper tipis di atasnya, jadi perilaku
  /berita dan /umkm tidak bisa melenceng satu sama lain.
- `src/features/filter-umkm/ui/umkm-category-filter.tsx` — chip kategori dari enum
- `src/features/whatsapp-contact/ui/whatsapp-cta.tsx` — satu-satunya tombol WhatsApp
- `src/features/google-maps-link/` — `model/maps-url.ts` + `ui/location-card.tsx`
- `src/entities/potensi/model/category-meta.ts` — label + ikon `PotentialCategory`
  (dipakai kartu "Potensi Terkait", siap dipakai langkah Potensi)
- `src/shared/utils/format-currency.ts` — `formatRupiah()`, `null` →
  "Harga menyesuaikan"

**Route**: `src/app/(public)/umkm/(list)/page.tsx` + `loading.tsx`,
`src/app/(public)/umkm/[slug]/page.tsx`

### Penyimpangan dari prototype (sengaja, karena skema/keamanan)

Prototype `detail_umkm_desa_pringgodani_final_consistency` menampilkan beberapa data
yang **tidak ada di skema** — semuanya dihilangkan, tidak di-hardcode:

- **"Sejak 2012"** → diganti "Terdaftar sejak `<tahun publishedAt>`" (tidak ada kolom
  tahun berdiri).
- **Email bisnis** → dihapus. Yang ada hanya `submitterEmail`, itu milik pengirim
  pengajuan, **bukan** kontak publik — menampilkannya = kebocoran data.
- **Jam operasional** → dihapus (kolomnya hanya ada di `PublicFacility`).
- **Deskripsi per produk** → dihapus (`UmkmProduct` tidak punya kolom deskripsi).
- **Tombol "Panduan Pendaftaran"** di banner promo → dihapus, tidak ada halamannya di
  sitemap; hanya "Daftar Sekarang" → `/submit/umkm` yang dipertahankan.
- **Badge "Verified"** → ditulis "Terverifikasi Pemerintah Desa"; validnya karena UMKM
  hanya tampil publik setelah admin menyetujui (`ContentStatus.PUBLISHED`).

### ⚠️ Temuan 1: embed peta OpenStreetMap butuh WebGL

Kartu "Lokasi Usaha" awalnya memakai `<iframe>` ke
`openstreetmap.org/export/embed.html` (keyless). Hasilnya: embed-nya merender pesan
_"Maaf, tampaknya peramban Anda tidak cocok dengan WebGL"_ — terbukti di browser
headless di mesin ini, dan itu risiko nyata di HP kelas bawah yang jadi target situs
ini. Sekarang kartunya jadi panel statis (ikon pin + koordinat) dengan dua tautan
Google Maps: "Lihat di Google Maps" dan "Petunjuk Arah" — tanpa API key, jalan di
semua perangkat. **Saat Leaflet dipasang di `/peta` (langkah 5/6), panel ini boleh
diganti mini-map raster tile** (raster tidak butuh WebGL).

### ⚠️ Temuan 2: ukuran ikon Material Symbols diabaikan di SELURUH situs

Stylesheet `fonts.googleapis.com` untuk Material Symbols memasang
`.material-symbols-outlined { font-size: 24px }` **di luar CSS cascade layer**.
Style tanpa layer selalu mengalahkan style di dalam layer, dan semua utility Tailwind
v4 ada di `@layer utilities` — jadi **setiap** `text-5xl` / `text-[120px]` /
`text-[200px]` pada `<Icon>` tidak berefek: semua ikon terkunci 24px. Ini bug lama
yang juga mengenai Home (`text-[200px]` di `community-cta-section.tsx`) dan Berita.

Di halaman UMKM sudah ditangani per call-site dengan modifier penting Tailwind
(`text-[120px]!`, `text-[64px]!`, `text-5xl!`). **Belum diperbaiki global** — opsi
untuk sesi berikutnya: (a) tambahkan `!` di semua call-site `<Icon>` yang butuh
ukuran, (b) `@import "tailwindcss" important;` (efek luas, harus dites ulang), atau
(c) hentikan pemakaian CSS helper Google dan deklarasikan `@font-face` sendiri.

### ⚠️ Temuan 3: `FallbackImage` tidak jatuh ke placeholder (sudah diperbaiki)

`<img>` dirender di server. Kalau request gambar sudah gagal **sebelum** React
hydrate, `onError` tidak pernah jalan, jadi pengunjung melihat ikon broken-image +
alt text, bukan placeholder — persis kondisi sekarang karena semua path gambar mock
belum ada file aslinya. Diperbaiki di `src/shared/ui/fallback-image.tsx`: cek sekali
saat mount (`img.complete && img.naturalWidth === 0`). Perbaikan ini otomatis
menyembuhkan Home dan Berita juga.

### ⚠️ Temuan 4: `min-w-0` di baris chip filter

Tanpa `min-w-0`, baris chip (flex item ber-`overflow-x-auto`) menolak menyusut di
bawah lebar kontennya dan menggencet kotak pencarian di sebelahnya sampai nyaris
hilang pada layar ~1100 px. Sudah dipasang `min-w-0` + `lg:min-w-[260px]` pada
search box. Pola ini perlu diingat untuk filter bar Potensi nanti.

## Hasil validasi UMKM di mesin lokal (4 Agustus 2026)

Semua gate hijau setelah `rm -rf .next` (dir `.next` lama masih mereferensikan route
`app/api/**` yang sudah dihapus migrasi, sehingga `tsc` sempat error palsu):

- `npm run lint` ✅ · `npx tsc --noEmit` ✅ · `npm run format:check` ✅
- `npm run build` ✅ — route terdaftar: `/`, `/berita`, `/berita/[slug]`, `/umkm`,
  `/umkm/[slug]`
- `npm run test` — **tidak ada file test sama sekali** (`--passWithNoTests`). Klaim
  "test ✅" di catatan Tahap 2 sudah tidak akurat setelah migrasi.

Diverifikasi sungguhan lewat `npm run start` (port 3100) + curl + screenshot browser
headless:

| URL                               | Hasil                                                      |
| --------------------------------- | ---------------------------------------------------------- |
| `/umkm`                           | 200, 8 kartu, chip 6 kategori, pagination "1 2"            |
| `/umkm?halaman=2`                 | 200, 4 kartu sisanya (total 12)                            |
| `/umkm?kategori=kuliner`          | 200, 2 kartu kuliner saja                                  |
| `/umkm?kategori=tidak-ada`        | 200 + empty state "Belum ada UMKM yang cocok…"             |
| `/umkm?cari=madu`                 | 200, 1 hasil                                               |
| `/umkm?cari=zzzz`                 | 200 + empty state + tombol "Tampilkan Semua UMKM"          |
| `/umkm/keripik-singkong-bu-marni` | 200; produk + harga, galeri bento, Potensi Terkait, Serupa |
| `/umkm/servis-elektronik-hendra`  | 200; "belum menambahkan daftar produk", galeri tersembunyi |
| `/umkm/slug-tidak-ada`            | **404** (bukan 200/500)                                    |
| `/` dan `/berita`                 | 200 — tidak ada regresi dari refactor search box & card    |

Terverifikasi juga di HTML/screenshot: `wa.me/6281234500001` dengan pesan prefilled,
nomor tampil `+62 812-3450-0001`, tautan "Petunjuk Arah" ke Google Maps, breadcrumb,
badge kategori berwarna per enum, dan bento galeri 4 gambar.

### Yang belum divalidasi untuk UMKM

- **Tampilan mobile sungguhan.** Screenshot headless pada 430 px terlihat terpotong
  horizontal, tapi **Home juga sama** pada pengukuran yang sama — indikasi artefak
  headless Chrome, bukan regresi UMKM. Perlu dicek sekali di HP/DevTools asli.
- **Gambar**: semua path masih key mock tanpa file, jadi tampil placeholder ikon
  (bukan bug — lihat Temuan 3).

## Hasil validasi Berita di mesin lokal (4 Agustus 2026)

Verifikasi yang tertinggal dari sesi 4 Agustus dini hari akhirnya diselesaikan di sesi
UMKM ini.

### ⚠️ Bug yang ditemukan & diperbaiki: "Berita Terkait" selalu kosong

`BeritaService.getRelated()` mengirim `NewsDetailDto.categoryId` (mis. `cat-1`) ke
`getPaginated({ category })`, tapi filter mock-nya hanya membandingkan `categorySlug`
dan `categoryName` — id tidak pernah cocok, jadi hasilnya selalu kosong dan section
"Berita Terkait" **tidak pernah dirender** sejak migrasi pure frontend. Diperbaiki di
`src/entities/berita/api/berita.service.ts`: nilai `category` sekarang di-resolve dulu
ke baris `MOCK_NEWS_CATEGORIES` (menerima id, slug, atau nama), dan kategori yang tidak
dikenal menghasilkan daftar kosong (bukan seluruh daftar).

| URL                             | Hasil                                                                                            |
| ------------------------------- | ------------------------------------------------------------------------------------------------ |
| `/berita`                       | 200; featured hero, filter bar, grid 3 kolom                                                     |
| `/berita?halaman=2`             | 200                                                                                              |
| `/berita?kategori=pemerintahan` | 200, terfilter                                                                                   |
| `/berita?kategori=tidak-ada`    | 200 + empty state                                                                                |
| `/berita?cari=zzzz`             | 200 + empty state                                                                                |
| `/berita/<slug asli>`           | 200; "Menit Baca", penulis "Admin Desa Pringgodani", share bar, **"Berita Terkait" kini tampil** |
| `/berita/tidak-ada`             | **404**                                                                                          |

Screenshot 1440 px diverifikasi untuk `/berita` dan `/umkm` (+ detail keduanya):
layout, badge kategori berwarna, chip filter, dan pagination sesuai prototype.

## Pembaruan Fitur Terbaru & Perbaikan Sistem (5 Agustus 2026) ✅

### 1. Fitur Pengajuan UMKM Warga (`/umkm/daftar`)

- **Zero Trust Validation**: Validasi Zod 1-to-1 dengan skema backend `web-desa` (`registerUmkmSchema`).
- **Alur 2-Langkah Stepper & Live Preview**: Step 1 Formulir ➔ Step 2 Pratinjau Tampilan Presisi Halaman UMKM (`UmkmHero`, `UmkmInfoSidebar`, `UmkmProductsSection`, `UmkmGallerySection`, dan `UmkmCard`).
- **Draf Persistent (`localStorage`)**: Auto-save & restore draf isian form ke `localStorage` (`register_umkm_draft_v1`).
- **File Upload Interaktif**: Pengunggahan foto cover, foto produk, dan foto galeri dinamis secara interaktif (_Data URL_).
- **Auto-Scroll UX Error**: Menampilkan banner ringkasan kesalahan validasi dan otomatis melakukan _smooth scroll_ serta _focus_ ke kolom input pertama yang belum diisi.

### 2. Fitur Pengajuan Berita & Kegiatan Warga (`/submit/berita`)

- **Zero Trust Validation**: Validasi Zod 1-to-1 dengan skema backend `web-desa` (`registerNewsSchema`).
- **Acuan Desain `code.html`**: Layout 12-Kolom (`lg:col-span-7` Form Editor & `lg:col-span-5` Sidebar _Panduan Penulisan Berita_ & _Status Pengajuan Terakhir_).
- **Template Berita Dual-Mode**:
  - **Standard (`STANDARD`)**: Terdiri dari Cover Utama, Judul, Penulis, WhatsApp, Ringkasan, serta Sub-bab Paragraf & Foto Pendukung Dinamis.
  - **Gallery (`GALLERY`)**: Terdiri dari Cover Utama, Judul, Penulis, WhatsApp, Ringkasan, serta Koleksi Foto Galeri Dinamis + Deskripsi.
- **Supabase Storage Ready Submit Model**: Foto disimpan sementara di memori (_Data URL_) saat pengisian & pratinjau. Pengunggahan berkas sesungguhnya ke server Supabase Storage HANYA dieksekusi saat tombol **"Konfirmasi & Ajukan"** diklik.
- **Pratinjau Presisi Halaman Berita Asli**: Merender tampilan presisi dengan komponen detail berita asli (`ArticleHeader`, `ArticleBody`, `ReadingProgressBar`, `ShareBar`, dan `NewsCard`).
- **Draf Persistent (`localStorage`)**: Auto-save & restore draf berita (`register_news_draft_v1`).

### 3. Pembenahan Navigasi & Tampilan Kartu Pratinjau

- **Layout Route `(submit)/layout.tsx`**: Menambahkan layout pembungkus untuk seluruh rute pengajuan (`/submit/*`) yang menyertakan `<Navbar />`, `<Footer />`, dan `<ScrollRevealProvider />` agar navigasi header/footer selalu tampil utuh.
- **Optimisasi Navbar Mobile**:
  - Mempersingkat tinggi header (`py-3 md:py-4`) dan membuat ukuran font logo "Desa Pringgodani" responsif (`text-lg md:text-headline-md`).
  - Menu slide-over mobile dibuat _scrollable_ (`overflow-y-auto`) dengan tombol aksi padat.
- **Visibilitas Kartu Pratinjau (`NewsCard` & `UmkmCard`)**: Menambahkan kelas `visible` pada komponen kartu agar kartu pratinjau instan pada Step 2 selalu terlihat jelas tanpa tertahan animasi scroll-reveal.
