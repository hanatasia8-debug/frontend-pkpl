import { Suspense } from "react";
import Link from "next/link";

import { UmkmService } from "@/entities/umkm/api/umkm.service";
import { UmkmCard } from "@/entities/umkm/ui/umkm-card";
import { resolveUmkmCategory } from "@/entities/umkm/model/category-meta";
import { Pagination } from "@/widgets/pagination/pagination";
import { buildQueryString } from "@/shared/utils/search-params";
import { Icon } from "@/shared/ui/icon";
import { UmkmFilterBar } from "./sections/umkm-filter-bar";
import { UmkmPromoSection } from "./sections/umkm-promo-section";
import { UmkmGridSkeleton } from "./ui/umkm-grid-skeleton";
import { UmkmEmptyState, UmkmErrorState } from "./ui/results-state";

/** 2-column grid layout (2x2 grid rows) */
const PAGE_SIZE = 8;

type SearchParamsRecord = Record<string, string | string[] | undefined>;

interface UmkmListPageProps {
  searchParams: Promise<SearchParamsRecord>;
}

function firstValue(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

/**
 * `views/umkm-list` — the /umkm directory view, rendered thinly from
 * `app/(public)/umkm/(list)/page.tsx`.
 */
export async function UmkmListPage({ searchParams }: UmkmListPageProps) {
  const params = await searchParams;
  const search = firstValue(params.cari).trim();
  const categorySlug = firstValue(params.kategori).trim();
  const pageNumber = Number.parseInt(firstValue(params.halaman), 10);
  const page = Number.isFinite(pageNumber) && pageNumber > 0 ? pageNumber : 1;
  const hasFilters = Boolean(search || categorySlug);

  const categories = await UmkmService.getCategories()
    .then((result) => result.items)
    .catch((err) => {
      console.error("Gagal memuat kategori UMKM:", err);
      return [];
    });

  const unknownCategory =
    Boolean(categorySlug) &&
    categories.length > 0 &&
    !categories.some(
      (c) =>
        c.slug === categorySlug ||
        c.value?.toLowerCase() === categorySlug.toLowerCase() ||
        resolveUmkmCategory(categorySlug) === c.slug
    );

  return (
    <div className="pb-section-padding pt-24">
      <header className="max-w-container-max px-gutter mb-stack-lg mx-auto">
        <div className="gap-gutter flex flex-col justify-between md:flex-row md:items-center">
          <div className="max-w-2xl">
            <h1 className="font-headline-lg text-headline-lg text-primary mb-4">
              Direktori UMKM &amp; Hasil Bumi
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant">
              Jelajahi sentra usaha warga, produsen olahan makanan, pengrajin lokal, dan petani hasil bumi unggulan Desa Pringgodani.
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Link
              href="/umkm/daftar"
              className="bg-primary text-on-primary font-label-sm inline-flex items-center gap-2 rounded-full px-6 py-3 font-bold shadow-md transition-all hover:opacity-90 active:scale-95"
            >
              <Icon name="storefront" className="text-lg" />
              <span>Daftarkan UMKM Anda</span>
            </Link>
          </div>
        </div>

        <UmkmFilterBar categories={categories} />
      </header>

      <section className="max-w-container-max px-gutter mx-auto">
        {unknownCategory ? (
          <UmkmEmptyState hasFilters />
        ) : (
          <Suspense
            key={`${search}|${categorySlug}|${page}`}
            fallback={<UmkmGridSkeleton count={PAGE_SIZE} />}
          >
            <UmkmResults
              search={search}
              categorySlug={categorySlug}
              page={page}
              hasFilters={hasFilters}
            />
          </Suspense>
        )}
      </section>

      <UmkmPromoSection />
    </div>
  );
}

interface UmkmResultsProps {
  search: string;
  categorySlug: string;
  page: number;
  hasFilters: boolean;
}

async function UmkmResults({
  search,
  categorySlug,
  page,
  hasFilters,
}: UmkmResultsProps) {
  let result;
  try {
    result = await UmkmService.getPaginated({
      page,
      limit: PAGE_SIZE,
      category: categorySlug || undefined,
      search: search || undefined,
    });
  } catch (err) {
    console.error("Gagal memuat daftar UMKM:", err);
    return <UmkmErrorState />;
  }

  if (result.items.length === 0) {
    return <UmkmEmptyState hasFilters={hasFilters} />;
  }

  const totalPages = Math.max(1, Math.ceil(result.total / PAGE_SIZE));

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-2 md:gap-6">
        {result.items.map((umkm) => (
          <UmkmCard key={umkm.id} umkm={umkm} variant="listing" />
        ))}
      </div>

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        buildHref={(targetPage) =>
          `/umkm${buildQueryString(
            {
              ...(search ? { cari: search } : {}),
              ...(categorySlug ? { kategori: categorySlug } : {}),
            },
            { halaman: targetPage === 1 ? null : targetPage },
          )}`
        }
      />
    </>
  );
}
