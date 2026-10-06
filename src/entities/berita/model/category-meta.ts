/**
 * Badge colors for news categories.
 *
 * Aligned with official Supabase database seed categories:
 * - kegiatan-desa (Kegiatan Desa)
 * - pembangunan (Pembangunan)
 * - ekonomi-umkm (Ekonomi & UMKM)
 * - pengumuman (Pengumuman)
 * - kesehatan-posyandu (Kesehatan & Posyandu)
 */
const BADGE_PALETTE = [
  "bg-primary text-on-primary",
  "bg-secondary text-on-secondary",
  "bg-nature-green text-white",
  "bg-status-verified text-white",
  "bg-status-pending text-white",
  "bg-tertiary text-on-tertiary",
] as const;

const KNOWN_CATEGORY_BADGE: Record<string, string> = {
  "kegiatan-desa": "bg-primary text-on-primary",
  pembangunan: "bg-secondary text-on-secondary",
  "ekonomi-umkm": "bg-nature-green text-white",
  pengumuman: "bg-status-pending text-white",
  "kesehatan-posyandu": "bg-status-verified text-white",

  // Historical aliases for compatibility
  "kabar-umkm": "bg-nature-green text-white",
  "event-pelatihan": "bg-secondary text-on-secondary",
  "pengembangan-potensi": "bg-nature-green text-white",
  "kemitraan-investasi": "bg-status-verified text-white",
};

export function getNewsCategoryBadgeClass(categorySlug: string): string {
  const normalized = (categorySlug || "").toLowerCase().trim();
  const known = KNOWN_CATEGORY_BADGE[normalized];
  if (known) return known;

  let hash = 0;
  for (let i = 0; i < normalized.length; i += 1) {
    hash = (hash * 31 + normalized.charCodeAt(i)) % 997;
  }
  return BADGE_PALETTE[hash % BADGE_PALETTE.length];
}
