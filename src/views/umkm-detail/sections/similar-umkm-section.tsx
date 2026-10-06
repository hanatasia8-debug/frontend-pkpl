import Link from "next/link";
import { Icon } from "@/shared/ui/icon";
import { UmkmCard } from "@/entities/umkm/ui/umkm-card";
import { getUmkmCategoryMeta } from "@/entities/umkm/model/category-meta";
import type { UmkmListItemDto } from "@/entities/umkm/model/types";

interface SimilarUmkmSectionProps {
  items: UmkmListItemDto[];
  /** Enum value of the current UMKM's category — for the "Lihat Semua" link. */
  category: string;
}

/**
 * "UMKM Serupa" — up to three other UMKM in the same category, newest first.
 * Hidden entirely when the current UMKM is the only one in its category, since
 * an empty carousel is worse than no section at all.
 */
export function SimilarUmkmSection({
  items,
  category,
}: SimilarUmkmSectionProps) {
  if (items.length === 0) return null;

  const categoryMeta = getUmkmCategoryMeta(category);

  return (
    <section className="border-outline-variant/30 border-t pt-16">
      <div className="mb-10 flex items-center justify-between gap-4">
        <h2 className="font-headline-lg text-headline-lg text-primary">
          UMKM Serupa
        </h2>
        <Link
          href={`/umkm?kategori=${categoryMeta.slug}`}
          className="text-secondary font-label-sm text-label-sm flex shrink-0 items-center gap-1 font-bold hover:underline"
        >
          Lihat Semua
          <Icon name="arrow_forward" className="text-[18px]" />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {items.map((umkm) => (
          <UmkmCard key={umkm.id} umkm={umkm} variant="similar" />
        ))}
      </div>
    </section>
  );
}
