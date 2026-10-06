/**
 * Display label, URL slug and Tailwind badge background class per
 * `UmkmCategory` value.
 *
 * Aligned with official Supabase database seed categories:
 * - kuliner (Kuliner)
 * - kerajinan (Kerajinan & Seni)
 * - pertanian (Pertanian & Perkebunan)
 * - jasa-perdagangan (Jasa & Perdagangan)
 * - fashion-tekstil (Fashion & Tekstil)
 */
export const UMKM_CATEGORY_META: Record<
  string,
  { label: string; slug: string; badgeClass: string }
> = {
  kuliner: { label: "Kuliner", slug: "kuliner", badgeClass: "bg-nature-green text-white" },
  KULINER: { label: "Kuliner", slug: "kuliner", badgeClass: "bg-nature-green text-white" },

  kerajinan: { label: "Kerajinan & Seni", slug: "kerajinan", badgeClass: "bg-secondary text-on-secondary" },
  KERAJINAN: { label: "Kerajinan & Seni", slug: "kerajinan", badgeClass: "bg-secondary text-on-secondary" },
  "kerajinan-souvenir": { label: "Kerajinan & Seni", slug: "kerajinan", badgeClass: "bg-secondary text-on-secondary" },
  KERAJINAN_SOUVENIR: { label: "Kerajinan & Seni", slug: "kerajinan", badgeClass: "bg-secondary text-on-secondary" },

  pertanian: { label: "Pertanian & Perkebunan", slug: "pertanian", badgeClass: "bg-status-verified text-white" },
  PERTANIAN: { label: "Pertanian & Perkebunan", slug: "pertanian", badgeClass: "bg-status-verified text-white" },
  "pertanian-peternakan": { label: "Pertanian & Perkebunan", slug: "pertanian", badgeClass: "bg-status-verified text-white" },
  PERTANIAN_PETERNAKAN: { label: "Pertanian & Perkebunan", slug: "pertanian", badgeClass: "bg-status-verified text-white" },

  "jasa-perdagangan": { label: "Jasa & Perdagangan", slug: "jasa-perdagangan", badgeClass: "bg-status-pending text-white" },
  JASA_PERDAGANGAN: { label: "Jasa & Perdagangan", slug: "jasa-perdagangan", badgeClass: "bg-status-pending text-white" },
  jasa: { label: "Jasa & Perdagangan", slug: "jasa-perdagangan", badgeClass: "bg-status-pending text-white" },
  JASA: { label: "Jasa & Perdagangan", slug: "jasa-perdagangan", badgeClass: "bg-status-pending text-white" },
  perdagangan: { label: "Jasa & Perdagangan", slug: "jasa-perdagangan", badgeClass: "bg-primary-container text-on-primary" },
  PERDAGANGAN: { label: "Jasa & Perdagangan", slug: "jasa-perdagangan", badgeClass: "bg-primary-container text-on-primary" },

  "fashion-tekstil": { label: "Fashion & Tekstil", slug: "fashion-tekstil", badgeClass: "bg-tertiary text-on-tertiary" },
  FASHION_TEKSTIL: { label: "Fashion & Tekstil", slug: "fashion-tekstil", badgeClass: "bg-tertiary text-on-tertiary" },
  fashion: { label: "Fashion & Tekstil", slug: "fashion-tekstil", badgeClass: "bg-tertiary text-on-tertiary" },
  FASHION: { label: "Fashion & Tekstil", slug: "fashion-tekstil", badgeClass: "bg-tertiary text-on-tertiary" },
};

/** Default values in order of appearance */
export const UMKM_CATEGORY_VALUES = [
  "kuliner",
  "kerajinan",
  "pertanian",
  "jasa-perdagangan",
  "fashion-tekstil",
];

export function getUmkmCategoryMeta(category: string) {
  const normalized = (category || "").trim().toLowerCase();
  const key = normalized.replace(/[^a-z0-9]/g, "_");

  return (
    UMKM_CATEGORY_META[normalized] ??
    UMKM_CATEGORY_META[key] ?? {
      label: category || "UMKM",
      slug: (category || "umkm").toLowerCase().replace(/_/g, "-"),
      badgeClass: "bg-primary text-on-primary",
    }
  );
}

/**
 * Resolves whatever arrived in `?kategori=` to a valid slug.
 */
export function resolveUmkmCategory(input: string): string | null {
  const needle = input.trim().toLowerCase();
  if (!needle) return null;

  if (UMKM_CATEGORY_META[needle]) {
    return UMKM_CATEGORY_META[needle].slug;
  }

  const found = Object.values(UMKM_CATEGORY_META).find(
    (meta) => meta.slug === needle || meta.label.toLowerCase() === needle
  );
  if (found) return found.slug;

  return needle;
}
