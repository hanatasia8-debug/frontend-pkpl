import { Suspense } from "react";
import Link from "next/link";
import { Icon } from "@/shared/ui/icon";
import { BeritaService } from "@/entities/berita/api/berita.service";
import { NewsCard } from "@/entities/berita/ui/news-card";
import { Pagination } from "@/widgets/pagination/pagination";
import { buildQueryString } from "@/shared/utils/search-params";
import { BeritaFilterBar } from "./sections/berita-filter-bar";
import { NewsGridSkeleton } from "./ui/news-grid-skeleton";
import { NewsEmptyState, NewsErrorState } from "./ui/results-state";

/** 2-column grid layout (2x2 grid rows per page) */
const PAGE_SIZE = 6;

type SearchParamsRecord = Record<string, string | string[] | undefined>;

interface BeritaListPageProps {
  searchParams: Promise<SearchParamsRecord>;
}

function firstValue(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

/**
 * `views/berita-list` — the /berita listing view.
 */
export async function BeritaListPage({ searchParams }: BeritaListPageProps) {
  const params = await searchParams;
  const search = firstValue(params.cari).trim();
  const categorySlug = firstValue(params.kategori).trim();
  const pageNumber = Number.parseInt(firstValue(params.halaman), 10);
  const page = Number.isFinite(pageNumber) && pageNumber > 0 ? pageNumber : 1;
  const hasFilters = Boolean(search || categorySlug);

  const categories = await BeritaService.getCategories()
    .then((result) => result.items)
    .catch((err) => {
      console.error("Gagal memuat kategori berita:", err);
      return [];
    });

  const unknownCategory =
    Boolean(categorySlug) &&
    categories.length > 0 &&
    !categories.some(
      (c) =>
        c.slug === categorySlug ||
        c.name.toLowerCase() === categorySlug.toLowerCase()
    );

  return (
    <div className="pb-section-padding pt-24">
      <header className="max-w-container-max px-gutter mb-stack-lg mx-auto">
        <div className="gap-gutter flex flex-col justify-between md:flex-row md:items-center">
          <div className="max-w-2xl">
            <h1 className="font-headline-lg text-headline-lg text-primary mb-4">
              Berita &amp; Kegiatan Desa
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant">
              Kabar terkini, liputan kegiatan warga, pengumuman resmi, dan potensi kemandirian ekonomi Desa Pringgodani.
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Link
              href="/berita/daftar"
              className="bg-primary text-on-primary font-label-sm inline-flex items-center gap-2 rounded-full px-6 py-3 font-bold shadow-md transition-all hover:opacity-90 active:scale-95"
            >
              <Icon name="edit_document" className="text-lg" />
              <span>Kirim Kabar Warga</span>
            </Link>
          </div>
        </div>

        <BeritaFilterBar categories={categories} />
      </header>

      <section className="max-w-container-max px-gutter mx-auto">
        {unknownCategory ? (
          <NewsEmptyState hasFilters />
        ) : (
          <Suspense
            key={`${search}|${categorySlug}|${page}`}
            fallback={<NewsGridSkeleton count={PAGE_SIZE} />}
          >
            <BeritaResults
              search={search}
              categorySlug={categorySlug}
              page={page}
              hasFilters={hasFilters}
            />
          </Suspense>
        )}
      </section>
    </div>
  );
}

interface BeritaResultsProps {
  search: string;
  categorySlug: string;
  page: number;
  hasFilters: boolean;
}

async function BeritaResults({
  search,
  categorySlug,
  page,
  hasFilters,
}: BeritaResultsProps) {
  let result;
  try {
    result = await BeritaService.getPaginated({
      page,
      limit: PAGE_SIZE,
      category: categorySlug || undefined,
      search: search || undefined,
    });
  } catch (err) {
    console.error("Gagal memuat daftar berita:", err);
    return <NewsErrorState />;
  }

  if (result.items.length === 0) {
    return <NewsEmptyState hasFilters={hasFilters} />;
  }

  const totalPages = Math.max(1, Math.ceil(result.total / PAGE_SIZE));

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-2 md:gap-6">
        {result.items.map((news) => (
          <NewsCard key={news.id} news={news} variant="listing" />
        ))}
      </div>

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        buildHref={(targetPage) =>
          `/berita${buildQueryString(
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
