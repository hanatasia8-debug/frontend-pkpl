import type { Metadata, Viewport } from "next";
import "./globals.css";
import { DynamicFavicon } from "@/shared/ui/dynamic-favicon";
import { safeJsonLdStringify } from "@/shared/utils/safe-json-ld";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://lokalpringgodani.my.id";

export const viewport: Viewport = {
  themeColor: "#2F5233",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Lokal Pringgodani — Direktori Resmi UMKM & Hasil Bumi Desa Pringgodani",
    template: "%s | Lokal Pringgodani",
  },
  description:
    "Portal resmi direktori UMKM Desa Pringgodani, katalog produk unggulan, hasil bumi pertanian, dan sentra kerajinan warga Desa Pringgodani, Kecamatan Bantur, Kabupaten Malang, Jawa Timur.",
  applicationName: "Lokal Pringgodani",
  generator: "Next.js",
  keywords: [
    "umkm pringgodani",
    "pringgodani",
    "desa pringgodani",
    "umkm lokal pringgodani",
    "lokal pringgodani",
    "produk umkm pringgodani",
    "hasil bumi pringgodani",
    "desa pringgodani bantur malang",
    "potensi desa pringgodani",
    "katalog umkm desa pringgodani",
    "kerajinan pringgodani",
    "kuliner pringgodani",
    "oleh oleh pringgodani",
    "wisata desa pringgodani",
    "bantur kabupaten malang",
  ],
  authors: [{ name: "Pemerintah Desa Pringgodani", url: SITE_URL }],
  creator: "Pemerintah Desa Pringgodani",
  publisher: "Pemerintah Desa Pringgodani & Komunitas UMKM",
  category: "E-Commerce & Direktori Usaha Lokal",
  alternates: {
    canonical: "/",
  },
  verification: {
    google: "googlea9c207ee32eba86b",
    other: {
      "google-site-verification": ["googlea9c207ee32eba86b", "googlea9c207ee32eba86b.html"],
    },
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: SITE_URL,
    siteName: "Lokal Pringgodani",
    title: "Lokal Pringgodani — Direktori Resmi UMKM & Hasil Bumi Desa Pringgodani",
    description:
      "Temukan aneka produk olahan, sentra kerajinan kreatif, dan hasil bumi unggulan dari para pelaku UMKM Desa Pringgodani, Kec. Bantur, Kab. Malang.",
    images: [
      {
        url: `${SITE_URL}/images/og-image.png`,
        secureUrl: `${SITE_URL}/images/og-image.png`,
        width: 1200,
        height: 630,
        type: "image/png",
        alt: "Lokal Pringgodani - Sentra UMKM & Produk Desa Pringgodani",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lokal Pringgodani — UMKM & Produk Desa Pringgodani",
    description:
      "Direktori resmi UMKM, produk kreatif, dan hasil bumi Desa Pringgodani, Bantur, Malang.",
    images: [`${SITE_URL}/images/og-image.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/images/favicon.png", type: "image/png", sizes: "32x32" },
      { url: "/images/favicon.png", type: "image/png", sizes: "48x48" },
      { url: "/images/favicon.png", type: "image/png", sizes: "96x96" },
      { url: "/images/favicon.png", type: "image/png", sizes: "192x192" },
      { url: "/images/favicon.png", type: "image/png", sizes: "512x512" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    shortcut: "/images/favicon.png",
    apple: [
      { url: "/images/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

const OFFICIAL_VILLAGE_URL = "https://pringgodani-malangkab.desa.id";

const jsonLdWebSite = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "Lokal Pringgodani",
      description:
        "Portal resmi direktori UMKM Desa Pringgodani, katalog produk unggulan, dan hasil bumi Desa Pringgodani, Bantur, Malang.",
      inLanguage: "id-ID",
      publisher: {
        "@id": `${SITE_URL}/#organization`,
      },
      isRelatedTo: {
        "@type": "WebSite",
        name: "Website Resmi Pemerintah Desa Pringgodani",
        url: OFFICIAL_VILLAGE_URL,
      },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${SITE_URL}/umkm?cari={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "GovernmentOrganization",
      "@id": `${SITE_URL}/#organization`,
      name: "Pemerintah Desa Pringgodani",
      alternateName: [
        "Pemdes Pringgodani",
        "Desa Pringgodani Bantur",
        "Pemerintah Desa Pringgodani Kabupaten Malang",
      ],
      url: OFFICIAL_VILLAGE_URL,
      sameAs: [
        OFFICIAL_VILLAGE_URL,
        "https://facebook.com/desapringgodani",
        "https://instagram.com/desapringgodani",
        "https://youtube.com/@desapringgodani",
        "https://tiktok.com/@desapringgodani",
      ],
      logo: `${SITE_URL}/images/logo.png`,
      address: {
        "@type": "PostalAddress",
        streetAddress: "Jl. Raya Desa Pringgodani No. 1",
        addressLocality: "Desa Pringgodani, Kecamatan Bantur",
        addressRegion: "Kabupaten Malang, Jawa Timur",
        postalCode: "65174",
        addressCountry: "ID",
      },
      areaServed: "Desa Pringgodani, Kecamatan Bantur, Kabupaten Malang",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full antialiased">
      <head>
        <link rel="icon" type="image/png" sizes="32x32" href="/images/favicon.png" />
        <link rel="icon" type="image/png" sizes="48x48" href="/images/favicon.png" />
        <link rel="icon" type="image/png" sizes="96x96" href="/images/favicon.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/images/favicon.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/images/favicon.png" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" sizes="180x180" href="/images/apple-touch-icon.png" />
        <link rel="image_src" href={`${SITE_URL}/images/og-image.png`} />
        <meta property="og:image" content={`${SITE_URL}/images/og-image.png`} />
        <meta property="og:image:secure_url" content={`${SITE_URL}/images/og-image.png`} />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Lokal Pringgodani — Direktori Resmi UMKM & Hasil Bumi Desa Pringgodani" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={`${SITE_URL}/images/og-image.png`} />
        <meta name="google-site-verification" content="googlea9c207ee32eba86b" />
        <meta name="google-site-verification" content="googlea9c207ee32eba86b.html" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLdStringify(jsonLdWebSite) }}
        />
      </head>
      <body className="font-body-base flex min-h-full flex-col">
        <DynamicFavicon />
        {children}
      </body>
    </html>
  );
}

