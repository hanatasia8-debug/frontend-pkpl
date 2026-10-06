import Link from "next/link";
import { Icon } from "@/shared/ui/icon";
import { ProductCard } from "@/entities/produk/ui/product-card";
import type { ProductItemDto } from "@/entities/produk/model/types";

interface RelatedProductsSectionProps {
  umkmName?: string;
  umkmSlug?: string;
  categoryName?: string;
  categorySlug?: string;
  otherProductsFromStore?: ProductItemDto[];
  similarProducts?: ProductItemDto[];
}

export function RelatedProductsSection({
  umkmName,
  umkmSlug,
  categoryName,
  categorySlug,
  otherProductsFromStore = [],
  similarProducts = [],
}: RelatedProductsSectionProps) {
  const hasStoreProducts = otherProductsFromStore.length > 0;
  const hasSimilarProducts = similarProducts.length > 0;

  if (!hasStoreProducts && !hasSimilarProducts) {
    return null;
  }

  return (
    <div className="mt-16 space-y-16 border-t border-outline-variant/20 pt-12">
      {/* 1. Other Products from Same Store / UMKM */}
      {hasStoreProducts && (
        <section>
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2.5">
              <div className="bg-primary/10 text-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-xl">
                <Icon name="storefront" className="text-base" />
              </div>
              <div>
                <h2 className="font-headline-lg text-primary text-lg font-bold sm:text-xl">
                  Produk Lain dari {umkmName || "Toko Ini"}
                </h2>
                <p className="text-on-surface-variant/75 text-xs">
                  Katalog pilihan lainnya dari pengrajin yang sama
                </p>
              </div>
            </div>

            {umkmSlug && (
              <Link
                href={`/umkm/${umkmSlug}`}
                className="text-primary hover:text-primary-container text-xs font-bold flex items-center gap-1 shrink-0"
              >
                <span>Lihat Semua</span>
                <Icon name="arrow_forward" className="text-xs" />
              </Link>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {otherProductsFromStore.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* 2. Similar / Recommended Village Products */}
      {hasSimilarProducts && (
        <section>
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2.5">
              <div className="bg-secondary/10 text-secondary flex h-8 w-8 shrink-0 items-center justify-center rounded-xl">
                <Icon name="shopping_bag" className="text-base" />
              </div>
              <div>
                <h2 className="font-headline-lg text-primary text-lg font-bold sm:text-xl">
                  Rekomendasi Produk {categoryName ? `Kategori ${categoryName}` : "Unggulan Lainnya"}
                </h2>
                <p className="text-on-surface-variant/75 text-xs">
                  Produk UMKM sejenis dari warga Desa Pringgodani
                </p>
              </div>
            </div>

            <Link
              href={categorySlug ? `/produk?category=${categorySlug}` : "/produk"}
              className="text-primary hover:text-primary-container text-xs font-bold flex items-center gap-1 shrink-0"
            >
              <span>Jelajahi Katalog</span>
              <Icon name="arrow_forward" className="text-xs" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {similarProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
