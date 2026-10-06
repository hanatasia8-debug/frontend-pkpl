"use client";

import { useMemo, useState } from "react";
import { getPotensiCategoryMeta } from "@/entities/potensi/model/category-meta";
import type { PotensiListItemDto } from "@/entities/potensi/model/types";
import { PotensiCard } from "@/entities/potensi/ui/potensi-card";

interface PotensiPageProps {
  items: PotensiListItemDto[];
}

export function PotensiPage({ items }: PotensiPageProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const categoryCounts = useMemo(
    () =>
      items.reduce<Record<string, number>>((acc, item) => {
        acc[item.category] = (acc[item.category] ?? 0) + 1;
        return acc;
      }, {}),
    [items],
  );

  const categories = useMemo(
    () => [
      { key: "", label: "Semua Potensi" },
      ...Object.keys(categoryCounts).map((category) => ({
        key: category,
        label: getPotensiCategoryMeta(category).label,
      })),
    ],
    [categoryCounts],
  );

  const filteredItems = useMemo(
    () =>
      selectedCategory
        ? items.filter((item) => item.category === selectedCategory)
        : items,
    [items, selectedCategory],
  );

  const activeCategoryLabel = selectedCategory
    ? getPotensiCategoryMeta(selectedCategory).label
    : "Semua Potensi";

  return (
    <div className="pb-section-padding pt-24">
      <main className="space-y-10">
        <section className="bg-primary-container relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,53,39,0.16),transparent_30%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.85),rgba(255,255,255,0.95))]" />
          <div className="max-w-container-max px-gutter relative mx-auto py-24">
            <div className="max-w-3xl">
              <span className="bg-secondary-fixed text-secondary inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold">
                Potensi Desa
              </span>
              <h1 className="font-display-hero text-display-hero text-primary mt-6">
                Eksplorasi Potensi Lokal Pringgodani
              </h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant mt-6 max-w-2xl leading-relaxed">
                Menelusuri kekayaan alam, warisan budaya, dan inovasi masyarakat
                yang memperkuat kemandirian Desa Pringgodani.
              </p>
            </div>
          </div>
        </section>

        <section className="border-outline-variant/30 bg-background/95 sticky top-[88px] z-40 border-b backdrop-blur-md">
          <div className="max-w-container-max px-gutter mx-auto py-4">
            <div className="flex flex-wrap items-center gap-3 overflow-x-auto py-2">
              {categories.map((category) => {
                const active = category.key === selectedCategory;
                return (
                  <button
                    key={category.key || "all"}
                    type="button"
                    onClick={() => setSelectedCategory(category.key)}
                    className={`text-label-sm rounded-full px-6 py-3 font-semibold whitespace-nowrap transition-all ${
                      active
                        ? "bg-primary text-on-primary shadow-md"
                        : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                    }`}
                  >
                    {category.label}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section className="max-w-container-max px-gutter mx-auto">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-label-sm text-on-surface-variant tracking-[0.18em] uppercase">
                Kategori saat ini
              </p>
              <h2 className="font-headline-lg text-headline-lg text-primary mt-2">
                {activeCategoryLabel}
              </h2>
            </div>
            <p className="text-body-base text-on-surface-variant">
              {filteredItems.length} potensi ditemukan
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item) => (
              <PotensiCard key={item.id} item={item} />
            ))}
          </div>
        </section>

        <section className="max-w-container-max px-gutter mx-auto mt-24">
          <div className="border-outline-variant/20 bg-surface-container-high flex flex-col gap-8 rounded-[2rem] border p-12 shadow-sm md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <h2 className="font-headline-lg text-headline-lg text-primary">
                Ingin menampilkan potensi Anda?
              </h2>
              <p className="font-body-base text-body-base text-on-surface-variant mt-4 leading-relaxed">
                Jika Anda memiliki produk, keahlian, atau destinasi wisata di
                Desa Pringgodani yang layak dipromosikan, daftarkan untuk
                mendapatkan eksposur lebih luas.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <button className="bg-primary text-on-primary rounded-full px-8 py-4 font-semibold transition-all hover:shadow-lg">
                Ajukan Konten
              </button>
              <button className="border-primary text-primary hover:bg-primary/10 rounded-full border px-8 py-4 transition-all">
                Unduh Panduan
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
