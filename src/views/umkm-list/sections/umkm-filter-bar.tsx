import { UmkmSearchInput } from "@/features/search-umkm/ui/umkm-search-input";
import { UmkmCategoryFilter } from "@/features/filter-umkm/ui/umkm-category-filter";
import type { UmkmCategoryDto } from "@/entities/umkm/model/types";

interface UmkmFilterBarProps {
  categories: UmkmCategoryDto[];
}

/** "Search and Filter Bar" from the prototype: keyword box + category chips. */
export function UmkmFilterBar({ categories }: UmkmFilterBarProps) {
  return (
    <div className="mt-stack-lg bg-surface-container-lowest border-outline-variant/30 flex flex-col items-center gap-4 rounded-xl border p-4 shadow-sm lg:flex-row">
      <UmkmSearchInput />
      <UmkmCategoryFilter categories={categories} />
    </div>
  );
}
