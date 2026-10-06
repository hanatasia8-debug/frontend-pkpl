# 06. Panduan Deployment & Optimasi Produksi — Web Desa Pringgodani

Dokumen ini memandu proses *deployment* frontend ke platform **Vercel / Netlify**, konfigurasi *API Rewrites Proxy*, serta strategi optimasi performa SEO dan **Core Web Vitals**.

---

## 1. Deployment ke Vercel

### Langkah 1: Hubungkan Repositori Frontend
1. Masuk ke [Vercel Dashboard](https://vercel.com).
2. Klik **Add New...** → **Project**, lalu impor repositori frontend (`testing`).
3. Tentukan nama proyek (misal: `desa-pringgodani-web`).

### Langkah 2: Konfigurasi Build & Environment Variables
* **Framework Preset**: Next.js
* **Build Command**: `next build`
* **Output Directory**: `.next`
* **Install Command**: `npm install`

Tambahkan variabel lingkungan di menu **Settings** → **Environment Variables**:
```env
NEXT_PUBLIC_API_URL=https://api.pringgodani.desa.id/api
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyB...
NEXT_PUBLIC_MAP_DEFAULT_LAT=-8.2811
NEXT_PUBLIC_MAP_DEFAULT_LNG=112.5664
```

### Langkah 3: Deploy & Verifikasi Domain
Klik **Deploy**. Setelah proses kompilasi selesai, hubungkan domain publik resmi (misal: `pringgodani.desa.id` atau `www.pringgodani.desa.id`).

---

## 2. Konfigurasi API Rewrites Proxy (`next.config.ts`)

Untuk menghindari kendala lintas domain (*CORS*) dan menyederhanakan pemanggilan API dari browser, `next.config.ts` dikonfigurasi dengan *Rewrites Proxy*:

```typescript
// testing/next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const backendUrl = process.env.BACKEND_INTERNAL_URL || "https://api.pringgodani.desa.id";
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
```

Dengan konfigurasi ini, panggilan klien ke `/api/public/news` otomatis diteruskan oleh server Next.js ke backend secara aman tanpa terkena blokir CORS browser.

---

## 3. Optimasi SEO & Metadata Dinamis

### Metadata Dinamis per Halaman
Setiap halaman berita dan profil UMKM menghasilkan meta tag OpenGraph dan Twitter Card otomatis via fungsi `generateMetadata`:

```typescript
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const news = await NewsService.getNewsBySlug(params.slug);
  return {
    title: `${news.title} - Desa Pringgodani`,
    description: news.excerpt,
    openGraph: {
      title: news.title,
      description: news.excerpt,
      images: [news.coverUrl || "/images/og-default.jpg"],
    },
  };
}
```

---

## 4. Optimasi Core Web Vitals & Performa

1. **Font Optimization (`next/font`)**: Menggunakan Google Fonts Inter & Outfit yang diunduh saat build time (*zero layout shift*).
2. **Komponen `FallbackImage`**: Menangani pemuatan gambar asinkron dengan efek transisi halus dan gambar pengganti otomatis jika URL gambar rusak atau gagal dimuat.
3. **Dynamic Import**: Komponen berat seperti kanvas peta dimuat secara dinamis (*lazy loaded*) hanya ketika dibutuhkan.
