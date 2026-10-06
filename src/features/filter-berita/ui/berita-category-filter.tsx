"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/shared/utils/cn";
import { buildQueryString } from "@/shared/utils/search-params";
import type { NewsCategoryDto } from "@/entities/berita/model/types";

interface BeritaCategoryFilterProps {
  categories: NewsCategoryDto[];
}

export function BeritaCategoryFilter({
  categories,
}: BeritaCategoryFilterProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeSlug = searchParams.get("kategori");

  const visibleCategories = categories.filter(
    (category) => (category.newsCount ?? 1) > 0,
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
          key={category.id || category.slug}
          href={hrefFor(category.slug)}
          className={chipClass(activeSlug === category.slug)}
          scroll={false}
        >
          {category.name}
        </Link>
      ))}
    </div>
  );
}
