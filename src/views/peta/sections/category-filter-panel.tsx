"use client";

import { useState } from "react";
import { Icon } from "@/shared/ui/icon";
import type { MapCategoryDto } from "@/entities/fasilitas/model/types";
import { cn } from "@/shared/utils/cn";

interface CategoryFilterPanelProps {
  categories: MapCategoryDto[];
  selectedCategoryIds: Set<string>;
  onToggleCategory: (categoryId: string) => void;
  onToggleAll: (enableAll: boolean) => void;
}

export function CategoryFilterPanel({
  categories,
  selectedCategoryIds,
  onToggleCategory,
  onToggleAll,
}: CategoryFilterPanelProps) {
  const [collapsed, setCollapsed] = useState(false);
  const allSelected =
    categories.length > 0 && selectedCategoryIds.size === categories.length;

  return (
    <div className="absolute top-20 left-6 z-20 hidden w-full max-w-[280px] flex-col gap-3 md:flex">
      <div className="glass-panel border-outline-variant/30 overflow-hidden rounded-2xl border shadow-xl transition-all duration-300">
        {/* Header bar */}
        <div className="border-outline-variant/20 flex items-center justify-between border-b p-4">
          <div className="text-primary flex items-center gap-2 font-bold">
            <Icon name="filter_list" className="text-xl" />
            <span className="font-label-sm text-label-sm">Kategori Lokasi</span>
          </div>
          <button
            onClick={() => setCollapsed((v) => !v)}
            className="hover:bg-surface-container/50 text-on-surface-variant rounded-lg p-1 transition-colors"
            title={collapsed ? "Buka Filter" : "Sembunyikan Filter"}
          >
            <Icon
              name="expand_more"
              className={cn(
                "text-xl transition-transform",
                collapsed && "rotate-180",
              )}
            />
          </button>
        </div>

        {!collapsed && (
          <div className="space-y-3 p-4">
            {/* Toggle All checkbox */}
            <div className="border-outline-variant/20 flex items-center justify-between border-b pb-2">
              <span className="font-label-sm text-on-surface-variant text-xs font-medium">
                Pilih Semua ({selectedCategoryIds.size}/{categories.length})
              </span>
              <input
                type="checkbox"
                checked={allSelected}
                onChange={(e) => onToggleAll(e.target.checked)}
                className="accent-primary border-outline-variant h-4 w-4 cursor-pointer rounded"
              />
            </div>

            {/* List of Categories */}
            <div className="custom-scrollbar max-h-[300px] space-y-2.5 overflow-y-auto pr-1">
              {categories.map((cat) => {
                const isChecked = selectedCategoryIds.has(cat.id);
                const color = cat.color || "#006399";
                const iconName = cat.icon || "location_on";

                return (
                  <label
                    key={cat.id}
                    className="hover:bg-surface-container/50 flex cursor-pointer items-center justify-between gap-2 rounded-lg p-1.5 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="flex h-7 w-7 items-center justify-center rounded-full text-white shadow-sm"
                        style={{ backgroundColor: color }}
                      >
                        <Icon name={iconName} className="text-sm font-bold" />
                      </div>
                      <span className="font-label-sm text-label-sm text-on-surface">
                        {cat.name}
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => onToggleCategory(cat.id)}
                      className="border-outline-variant h-4 w-4 cursor-pointer rounded"
                      style={{ accentColor: color }}
                    />
                  </label>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
