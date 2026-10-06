# 05. Setup Lokal, Variabel Lingkungan, & Testing — Web Desa Pringgodani

Dokumen ini memandu pengembang dalam menyiapkan lingkungan frontend di komputer lokal, mengonfigurasi variabel lingkungan `.env.local`, serta menjalankan pengujian unit (*unit testing*) menggunakan **Vitest**.

---

## 1. Langkah-Langkah Menjalankan Frontend

### Langkah 1: Masuk ke Direktori Frontend
```bash
cd testing
```

### Langkah 2: Menginstal Dependensi
```bash
npm install
```

### Langkah 3: Menyiapkan File `.env.local`
Salin berkas contoh konfigurasi:
```bash
cp .env.local.example .env.local
```

### Langkah 4: Menjalankan Server Pengembangan
```bash
npm run dev -- -p 3001
```
Aplikasi frontend akan aktif di: `http://localhost:3001`.

---

## 2. Rincian Variabel Lingkungan (`.env.local`)

| Nama Variabel | Wajib? | Deskripsi & Contoh Nilai |
| :--- | :---: | :--- |
| `NEXT_PUBLIC_API_URL` | Opsional | URL endpoint backend REST API.<br>• Isi `http://localhost:3000/api` untuk mode live API.<br>• Kosongkan untuk mengaktifkan **Mode Mock Data** otomatis. |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`| **Ya** | Kunci API Google Maps JavaScript SDK (memerlukan Maps JavaScript API aktif). |
| `NEXT_PUBLIC_MAP_DEFAULT_LAT` | Opsional | Titik Latitude tengah default Desa Pringgodani (default: `-8.2811`). |
| `NEXT_PUBLIC_MAP_DEFAULT_LNG` | Opsional | Titik Longitude tengah default Desa Pringgodani (default: `112.5664`). |

---

## 3. Menjalankan Pengujian Unit (*Unit Testing*)

Aplikasi menggunakan **Vitest** dan **React Testing Library** yang dikonfigurasi pada `vitest.config.ts` dan `vitest.setup.ts`.

### Menjalankan Seluruh Test Suite:
```bash
npm run test
```

### Menjalankan Test dalam Mode Watch (Pengembangan Aktif):
```bash
npm run test -- --watch
```

### Cakupan Pengujian yang Ada:
* ✅ `src/entities/umkm/model/whatsapp-link.test.ts`: Pengujian generator link WhatsApp (format nomor Indonesia, template pesan pesanan, pesan revisi).
* ✅ `src/shared/utils/og-image.helper.test.ts`: Pengujian utilitas visual OpenGraph metadata.
* ✅ `src/features/kkn-memorial/kkn-memorial.test.tsx`: Pengujian komponen tribut dan penanda digital.
* ✅ `src/entities/admin/api/admin-indexing.service.test.ts`: Pengujian layanan Google Indexing API.
* ✅ `src/views/admin-profil/history-panel.test.tsx`: Pengujian komponen riwayat profil desa.
* ✅ `src/views/produk-detail/produk-detail.test.tsx`: Pengujian halaman detail produk UMKM.

---

## 4. Pemeriksaan Tipe & Linting

Sebelum melakukan push kode ke repositori Git, jalankan pemeriksaan:

```bash
# 1. Pengecekan tipe data TypeScript (wajib lolos 0 error)
npx tsc --noEmit

# 2. Pengecekan ESLint
npm run lint

# 3. Pengecekan format Prettier
npx prettier --check "src/**/*.{ts,tsx}"
```
