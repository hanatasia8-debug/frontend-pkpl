/**
 * Display label + Material Symbols icon per `PotentialCategory` enum value
 * (`prisma/schema.prisma`). Used by the "Potensi Terkait" card on the UMKM
 * detail page, and by the Potensi pages built later in this Tahap.
 */
export const POTENSI_CATEGORY_META: Record<
  string,
  { label: string; icon: string }
> = {
  PERTANIAN: { label: "Pertanian", icon: "agriculture" },
  PERKEBUNAN: { label: "Perkebunan", icon: "forest" },
  PETERNAKAN: { label: "Peternakan", icon: "pets" },
  PERIKANAN: { label: "Perikanan", icon: "set_meal" },
  PARIWISATA: { label: "Pariwisata", icon: "landscape" },
  KEBUDAYAAN: { label: "Kebudayaan", icon: "theater_comedy" },
  KERAJINAN: { label: "Kerajinan", icon: "handyman" },
  SUMBER_DAYA_ALAM: { label: "Sumber Daya Alam", icon: "eco" },
};

export function getPotensiCategoryMeta(category: string) {
  return POTENSI_CATEGORY_META[category] ?? { label: category, icon: "eco" };
}
