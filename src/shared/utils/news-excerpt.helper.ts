/**
 * Tipe struktur blok artikel standard.
 */
interface ContentBlock {
  content?: string;
  subHeading?: string | null;
}

/**
 * Tipe struktur foto galeri artikel.
 */
interface GalleryImage {
  imageDescription?: string | null;
}

/**
 * Parameter input untuk pembuat ringkasan berita otomatis.
 */
interface GenerateAutoExcerptParams {
  newsTypeId?: "STANDARD" | "GALLERY";
  title?: string;
  blocks?: ContentBlock[];
  galleryImages?: GalleryImage[];
}

/**
 * Men-generate ringkasan (excerpt) berita secara otomatis dari konten artikel.
 * Digunakan untuk mengisi ringkasan berita sebelum dikirim ke API backend,
 * pratinjau real-time, dan meta description SEO.
 *
 * @param params Data formulir pengajuan berita (tipe, judul, blok paragraf, atau gambar)
 * @returns Ringkasan string bersih maksimal 150 karakter dengan akhiran ellipsis (...)
 */
export function generateAutoExcerpt(params: GenerateAutoExcerptParams): string {
  const isStandard = params.newsTypeId === "STANDARD" || !params.newsTypeId;

  // 1. Tipe Berita STANDARD: Ambil dari isi paragraf blok teks pertama
  if (isStandard && params.blocks && params.blocks.length > 0) {
    const firstTextBlock = params.blocks.find(
      (b) => b.content && b.content.trim().length > 0,
    );
    if (firstTextBlock && firstTextBlock.content) {
      const cleanText = firstTextBlock.content.replace(/\s+/g, " ").trim();
      return cleanText.length > 150
        ? cleanText.substring(0, 150) + "..."
        : cleanText;
    }
  }

  // 2. Tipe Berita GALLERY: Ambil dari deskripsi foto pertama
  if (!isStandard && params.galleryImages && params.galleryImages.length > 0) {
    const firstImageBlock = params.galleryImages.find(
      (g) => g.imageDescription && g.imageDescription.trim().length > 0,
    );
    if (firstImageBlock && firstImageBlock.imageDescription) {
      const cleanDesc = firstImageBlock.imageDescription
        .replace(/\s+/g, " ")
        .trim();
      return cleanDesc.length > 150
        ? cleanDesc.substring(0, 150) + "..."
        : cleanDesc;
    }
  }

  // 3. Fallback jika tidak ada konten sama sekali
  const pageTitle = params.title?.trim() || "kegiatan komunitas";
  return `Liputan warta dan dokumentasi kegiatan seputar ${pageTitle} di lingkungan warga Desa Pringgodani.`;
}
