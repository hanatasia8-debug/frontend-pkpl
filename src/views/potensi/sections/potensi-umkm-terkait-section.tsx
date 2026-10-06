import { UmkmCard } from "@/entities/umkm/ui/umkm-card";
import type { PotensiRelatedUmkmDto } from "@/entities/potensi/model/types";

/**
 * "UMKM Terkait" — reuses `UmkmCard` (variant="similar", same one used on
 * the UMKM detail page's "UMKM Serupa" strip) rather than a new card
 * component. `PotensiRelatedUmkmDto` is deliberately shaped identically to
 * `UmkmListItemDto` so it can be passed straight through.
 */
export function PotensiUmkmTerkaitSection({
  items,
}: {
  items: PotensiRelatedUmkmDto[];
}) {
  return (
    <section>
      <h2 className="font-headline-lg text-headline-lg text-primary border-primary relative mb-8 pb-3">
        UMKM Terkait
        <span className="bg-primary-container absolute bottom-0 left-0 h-[3px] w-12" />
      </h2>

      {items.length === 0 ? (
        <p className="font-body-base text-body-base text-on-surface-variant border-outline-variant/30 bg-surface-container-low rounded-lg border border-dashed px-6 py-10 text-center">
          Belum ada UMKM yang terdaftar di ekosistem potensi ini.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {items.map((umkm) => (
            <UmkmCard key={umkm.id} umkm={umkm} variant="similar" />
          ))}
        </div>
      )}
    </section>
  );
}
