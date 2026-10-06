import type { PotensiDetailDto } from "@/entities/potensi/model/types";
import { PotensiHero } from "./sections/potensi-hero";
import { PotensiArticleSection } from "./sections/potensi-article-section";
import { PotensiUmkmTerkaitSection } from "./sections/potensi-umkm-terkait-section";
import { PotensiProdukUnggulanSection } from "./sections/potensi-produk-unggulan-section";
import { PotensiBeritaTerkaitSection } from "./sections/potensi-berita-terkait-section";
import { PotensiStatistikSidebar } from "./sections/potensi-statistik-sidebar";
import { PotensiCtaSidebar } from "./sections/potensi-cta-sidebar";

interface PotensiDetailPageProps {
  item: PotensiDetailDto;
}

/**
 * `views/potensi` detail — the /potensi/[slug] view, rebuilt to actually
 * follow `detail_potensi_desa_pringgodani_prd_3_compliant` and the master
 * plan's explicit requirement ("statistik, UMKM terkait, produk unggulan,
 * berita terkait sesuai PRD-3"). The previous version of this file rendered
 * generic fabricated copy identical across every potensi item instead of
 * real data — every section below is backed by an actual field or a
 * documented best-effort relation (see `potensi.service.ts`).
 */
export function PotensiDetailPage({ item }: PotensiDetailPageProps) {
  return (
    <div className="pb-section-padding">
      <PotensiHero item={item} />

      <div className="max-w-container-max px-gutter mx-auto flex flex-col gap-12 py-12 lg:flex-row">
        <div className="space-y-12 lg:w-2/3">
          <PotensiArticleSection description={item.description} />
          <PotensiUmkmTerkaitSection items={item.relatedUmkm} />
          <PotensiProdukUnggulanSection products={item.featuredProducts} />
          <PotensiBeritaTerkaitSection items={item.relatedNews} />
        </div>

        <div className="lg:w-1/3">
          <aside className="sticky top-24 space-y-6">
            <PotensiStatistikSidebar
              umkmCount={item.relatedUmkm.length}
              productCount={item.featuredProducts.length}
              newsCount={item.relatedNews.length}
            />
            <PotensiCtaSidebar />
          </aside>
        </div>
      </div>
    </div>
  );
}
