import Link from "next/link";
import { Icon } from "@/shared/ui/icon";
import { ProdukService } from "@/entities/produk/api/produk.service";
import { UmkmService } from "@/entities/umkm/api/umkm.service";
import { ProductCard } from "@/entities/produk/ui/product-card";
import { Pagination } from "@/widgets/pagination/pagination";
import { buildQueryString } from "@/shared/utils/search-params";
import { ProdukFilterBar } from "./sections/produk-filter-bar";

const PAGE_SIZE = 18;

type SearchParamsRecord = Record<string, string | string[] | undefined>;

interface ProdukListPageProps {
  searchParams: Promise<SearchParamsRecord>;
}

function firstValue(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

export async function ProdukListPage({ searchParams }: ProdukListPageProps) {
  const params = await searchParams;
  const search = firstValue(params.cari).trim();
  const categorySlug = firstValue(params.kategori).trim();
  const pageNumber = Number.parseInt(firstValue(params.halaman), 10);
  const page = Number.isFinite(pageNumber) && pageNumber > 0 ? pageNumber : 1;

  const [categoriesResult, productsResult] = await Promise.all([
    UmkmService.getCategories(),
    ProdukService.getPaginated({
      page,
      limit: PAGE_SIZE,
      search: search || undefined,
      categorySlug: categorySlug || undefined,
    }),
  ]);

  const categories = categoriesResult.items || [];
  const products = productsResult.items || [];
  const totalPages = productsResult.totalPages || 1;
  const hasFilters = Boolean(search || categorySlug);

  return (
    <div className="pb-section-padding pt-24">
      {/* Header Katalog */}
      <header className="max-w-container-max px-gutter mb-stack-lg mx-auto">
        <div className="gap-gutter flex flex-col justify-between md:flex-row md:items-center">
          <div className="max-w-2xl">
            <h1 className="font-headline-lg text-headline-lg text-primary mb-4">
              Katalog Produk &amp; Hasil Bumi
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant">
              Beli aneka olahan pangan, kerajinan tangan, dan hasil panen pertanian
              langsung dari pelaku UMKM dan petani Desa Pringgodani.
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Link
              href="/umkm"
              className="bg-primary/10 text-primary hover:bg-primary/20 font-label-sm inline-flex items-center gap-2 rounded-full px-6 py-3 font-bold transition-all active:scale-95"
            >
              <Icon name="storefront" className="text-lg" />
              <span>Lihat Profil UMKM</span>
            </Link>
          </div>
        </div>

        {/* Filter Bar seragam dengan UMKM */}
        <ProdukFilterBar categories={categories} />
      </header>

      {/* Product Marketplace Grid */}
      <section className="max-w-container-max px-gutter mx-auto">
        {products.length === 0 ? (
          <div className="border-outline-variant/30 bg-surface-container-lowest rounded-3xl border border-dashed px-6 py-16 text-center">
            <Icon
              name="search_off"
              className="text-on-surface-variant mx-auto mb-3 text-5xl opacity-40"
            />
            <h3 className="font-headline-md text-on-surface text-lg font-bold">
              Tidak Ada Produk Ditemukan
            </h3>
            <p className="text-on-surface-variant mt-1 text-xs sm:text-sm">
              Coba cari dengan kata kunci lain atau pilih kategori yang berbeda.
            </p>
            {hasFilters && (
              <Link
                href="/produk"
                className="text-primary mt-4 inline-flex items-center gap-1 text-xs font-bold hover:underline"
              >
                <Icon name="refresh" className="text-sm" /> Reset Pencarian
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>

            <Pagination
              currentPage={page}
              totalPages={totalPages}
              buildHref={(targetPage) =>
                `/produk${buildQueryString(
                  {
                    ...(search ? { cari: search } : {}),
                    ...(categorySlug ? { kategori: categorySlug } : {}),
                  },
                  { halaman: targetPage === 1 ? null : targetPage },
                )}`
              }
            />
          </>
        )}
      </section>
    </div>
  );
}
