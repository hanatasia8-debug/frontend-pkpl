"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { SearchBox } from "@/widgets/search-box/search-box";
import { cn } from "@/shared/utils/cn";
import { buildQueryString } from "@/shared/utils/search-params";
import type { UmkmCategoryDto } from "@/entities/umkm/model/types";

interface ProdukFilterBarProps {
  categories: UmkmCategoryDto[];
}

export function ProdukFilterBar({ categories }: ProdukFilterBarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeSlug = searchParams.get("kategori");

  const visibleCategories = categories.filter(
    (category) => (category.umkmCount ?? 1) > 0,
  );

  const chipClass = (isActive: boolean) =>
    cn(
      "font-label-sm text-label-sm rounded-full px-5 py-2.5 whitespace-nowrap transition-colors",
      isActive
        ? "bg-primary text-on-primary font-bold shadow-sm"
        : "bg-surface-container hover:bg-surface-container-high text-on-surface-variant",
    );

  const hrefFor = (slug: string | null) =>
    `${pathname}${buildQueryString(searchParams, { kategori: slug, halaman: null })}`;

  return (
    <div className="mt-stack-lg bg-surface-container-lowest border-outline-variant/30 flex flex-col items-center gap-4 rounded-xl border p-4 shadow-sm lg:flex-row">
      <SearchBox
        id="cari-produk"
        label="Cari Produk"
        placeholder="Cari nama produk, olahan, kerajinan..."
        className="w-full lg:min-w-[260px] lg:flex-1"
        inputClassName="bg-surface-container border-none"
      />
      <div className="scrollbar-hide flex w-full min-w-0 gap-2 overflow-x-auto pb-2 lg:w-auto lg:pb-0">
        <Link
          href={hrefFor(null)}
          className={chipClass(!activeSlug)}
          scroll={false}
        >
          Semua
        </Link>
        {visibleCategories.map((category) => (
          <Link
            key={category.slug || category.value}
            href={hrefFor(category.slug)}
            className={chipClass(activeSlug === category.slug)}
            scroll={false}
          >
            {category.label || category.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
