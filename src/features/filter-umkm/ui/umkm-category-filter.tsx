"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/shared/utils/cn";
import { buildQueryString } from "@/shared/utils/search-params";
import type { UmkmCategoryDto } from "@/entities/umkm/model/types";

interface UmkmCategoryFilterProps {
  /** Derived from the `UmkmCategory` enum — never a hardcoded chip list. */
  categories: UmkmCategoryDto[];
}

/**
 * Category chips for /umkm. The active category lives in the URL
 * (`?kategori=<slug>`); chips are `Link`s so they stay shareable and
 * keyboard/SEO friendly, and Next.js navigates client-side without a full
 * reload. The row scrolls horizontally on narrow screens, as in the prototype.
 */
export function UmkmCategoryFilter({ categories }: UmkmCategoryFilterProps) {
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
    // `min-w-0` matters: without it the flex item refuses to shrink below its
    // content width and squeezes the search box next to it down to nothing on
    // mid-size screens — the row scrolls instead.
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
          key={category.value || category.slug}
          href={hrefFor(category.slug)}
          className={chipClass(activeSlug === category.slug)}
          scroll={false}
        >
          {category.label || category.name}
        </Link>
      ))}
    </div>
  );
}
