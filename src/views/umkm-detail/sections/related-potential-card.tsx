import Link from "next/link";
import { Icon } from "@/shared/ui/icon";
import { getPotensiCategoryMeta } from "@/entities/potensi/model/category-meta";
import type { UmkmPotentialSummaryDto } from "@/entities/umkm/model/types";

/**
 * "Potensi Terkait" card — rendered only when the UMKM is attached to a
 * `VillagePotential` (`potentialId` is nullable). Links to the potensi detail
 * page, built in step 4/6 of this Tahap.
 */
export function RelatedPotentialCard({
  potential,
}: {
  potential: UmkmPotentialSummaryDto;
}) {
  const categoryMeta = getPotensiCategoryMeta(potential.category || "pertanian");
  const title = potential.title || potential.name || "Potensi Desa";

  return (
    <section className="mb-20">
      <div className="bg-primary text-on-primary max-w-md rounded-xl p-8 shadow-lg">
        <h2 className="font-headline-md text-headline-md mb-4">
          Potensi Terkait
        </h2>
        <p className="font-label-sm text-label-sm mb-6 opacity-90">
          UMKM ini merupakan bagian dari ekosistem potensi utama desa:
        </p>

        <Link
          href={`/potensi/${potential.slug}`}
          className="group relative block rounded-lg border border-white/20 bg-white/10 p-4 transition-all hover:bg-white/20"
        >
          <div className="flex items-center gap-4 pr-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded bg-white/20">
              <Icon name={categoryMeta.icon} className="text-white" />
            </div>
            <div className="min-w-0">
              <h3 className="truncate font-bold">{title}</h3>
              <p className="text-[12px] opacity-70">
                Potensi {categoryMeta.label}
              </p>
            </div>
          </div>
          <Icon
            name="arrow_forward"
            className="absolute top-4 right-4 text-[18px]"
          />
        </Link>
      </div>
    </section>
  );
}
