import { BeritaSearchInput } from "@/features/search-berita/ui/berita-search-input";
import { BeritaCategoryFilter } from "@/features/filter-berita/ui/berita-category-filter";
import type { NewsCategoryDto } from "@/entities/berita/model/types";

interface BeritaFilterBarProps {
  categories: NewsCategoryDto[];
}

export function BeritaFilterBar({ categories }: BeritaFilterBarProps) {
  return (
    <div className="mt-stack-lg bg-surface-container-lowest border-outline-variant/30 flex flex-col items-center gap-4 rounded-xl border p-4 shadow-sm lg:flex-row">
      <BeritaSearchInput />
      <BeritaCategoryFilter categories={categories} />
    </div>
  );
}
