import { notFound } from "next/navigation";
import { ProdukService } from "@/entities/produk/api/produk.service";
import { safeJsonLdStringify } from "@/shared/utils/safe-json-ld";
import { ProductBreadcrumb } from "./sections/product-breadcrumb";
import { ProductGallery } from "./sections/product-gallery";
import { ProductTrustBadges } from "./sections/product-trust-badges";
import { ProductOrderBox } from "./sections/product-order-box";
import { ProductStoreCard } from "./sections/product-store-card";
import { ProductDescriptionSection } from "./sections/product-description-section";
import { ProductStickyBar } from "./sections/product-sticky-bar";
import { RelatedProductsSection } from "./sections/related-products-section";
import type { ProductItemDto } from "@/entities/produk/model/types";

interface ProdukDetailPageProps {
  id: string;
}

export async function ProdukDetailPage({ id }: ProdukDetailPageProps) {
  const product = await ProdukService.getById(id);
  if (!product) notFound();

  const umkm = product.umkm;

  // 1. Other products from the same store (UMKM)
  let otherProductsFromStore: ProductItemDto[] = product.otherProducts || [];

  // Fallback: If otherProducts is empty, query catalog for same UMKM or same category
  if (otherProductsFromStore.length === 0 && umkm?.slug) {
    try {
      const umkmCatalog = await ProdukService.getPaginated({
        limit: 7,
      });
      otherProductsFromStore = (umkmCatalog.items || [])
        .filter((item) => item.id !== product.id && item.umkmId === product.umkmId)
        .slice(0, 6);
    } catch (e) {
      console.error("Gagal memuat produk lain dari toko:", e);
    }
  }

  // 2. Similar products in the same category (across all village UMKM)
  let similarProducts: ProductItemDto[] = [];
  if (umkm?.category?.slug) {
    try {
      const categoryProducts = await ProdukService.getPaginated({
        categorySlug: umkm.category.slug,
        limit: 7,
      });
      similarProducts = (categoryProducts.items || [])
        .filter((item) => item.id !== product.id && item.umkmId !== product.umkmId)
        .slice(0, 6);
    } catch (e) {
      console.error("Gagal memuat rekomendasi produk serupa:", e);
    }
  }

  // JSON-LD Structured Data for Local E-Commerce SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.imageUrl,
    description: product.description || `Produk unggulan ${product.name} dari ${umkm?.name || "Desa Pringgodani"}`,
    offers: {
      "@type": "Offer",
      priceCurrency: "IDR",
      price: product.price || 0,
      availability: "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: umkm?.name || "UMKM Desa Pringgodani",
        address: umkm?.address || "Desa Pringgodani",
      },
    },
  };

  return (
    <div className="pb-28 pt-20 sm:pt-24 sm:pb-section-padding min-h-screen">
      {/* Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLdStringify(jsonLd) }}
      />

      <div className="max-w-container-max px-3.5 sm:px-6 lg:px-8 mx-auto">
        {/* Breadcrumb Navigation */}
        <ProductBreadcrumb
          productName={product.name}
          categoryName={umkm?.category?.name}
          categorySlug={umkm?.category?.slug}
        />

        {/* Main Product Showcase Card */}
        <div className="bg-surface-container-lowest border-outline-variant/20 rounded-2xl sm:rounded-3xl lg:rounded-[2.5rem] border p-4 sm:p-6 lg:p-10 shadow-xs sm:shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 items-start">
            {/* Left Column: Visual Gallery & Trust Signals */}
            <div className="lg:col-span-6 space-y-4 sm:space-y-6">
              <ProductGallery
                imageUrl={product.imageUrl}
                productName={product.name}
                categoryName={umkm?.category?.name}
              />

              <ProductTrustBadges />
            </div>

            {/* Right Column: Sticky Purchase Console & Store Profile */}
            <div className="lg:col-span-6 space-y-4 sm:space-y-6">
              <ProductOrderBox product={product} />

              {umkm && <ProductStoreCard umkm={umkm} />}
            </div>
          </div>
        </div>

        {/* Structured Product Description & Ordering Guide */}
        <div className="mt-6 sm:mt-10">
          <ProductDescriptionSection
            description={product.description}
            productName={product.name}
            umkmName={umkm?.name}
          />
        </div>

        {/* Cross-Selling: Other Products & Similar Village Products */}
        <RelatedProductsSection
          umkmName={umkm?.name}
          umkmSlug={umkm?.slug}
          categoryName={umkm?.category?.name}
          categorySlug={umkm?.category?.slug}
          otherProductsFromStore={otherProductsFromStore}
          similarProducts={similarProducts}
        />
      </div>

      {/* Floating Action Bar for Mobile Screens */}
      <ProductStickyBar product={product} />
    </div>
  );
}
