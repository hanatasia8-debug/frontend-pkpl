import type { MapCategoryDto } from "@/entities/fasilitas/model/types";

interface MapLegendProps {
  categories: MapCategoryDto[];
  selectedCategoryIds: Set<string>;
}

export function MapLegend({ categories, selectedCategoryIds }: MapLegendProps) {
  const activeCategories = categories.filter((cat) =>
    selectedCategoryIds.has(cat.id),
  );

  if (activeCategories.length === 0) return null;

  return (
    <div className="glass-panel border-outline-variant/30 absolute bottom-6 left-1/2 z-20 hidden max-w-[90vw] -translate-x-1/2 flex-wrap items-center justify-center gap-6 rounded-full border px-6 py-3 shadow-xl md:flex">
      {activeCategories.map((cat) => (
        <div key={cat.id} className="flex items-center gap-2">
          <div
            className="h-3.5 w-3.5 rounded-full shadow-sm ring-2 ring-white"
            style={{ backgroundColor: cat.color || "#006399" }}
          />
          <span className="font-label-sm text-label-sm text-on-surface font-medium whitespace-nowrap">
            {cat.name}
          </span>
        </div>
      ))}
    </div>
  );
}
