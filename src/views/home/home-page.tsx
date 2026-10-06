import { Hero } from "@/widgets/hero/hero";
import { WelcomeSection } from "./sections/welcome-section";
import { StatsSection } from "./sections/stats-section";
import { ProductsSection } from "./sections/products-section";
import { UmkmSection } from "./sections/umkm-section";
import { NewsSection } from "./sections/news-section";
import { MapPreviewSection } from "./sections/map-preview-section";
import { CommunityCtaSection } from "./sections/community-cta-section";

import { DesaService } from "@/entities/desa/api/desa.service";
import { ProdukService } from "@/entities/produk/api/produk.service";
import { UmkmService } from "@/entities/umkm/api/umkm.service";
import { BeritaService } from "@/entities/berita/api/berita.service";
import { FasilitasService } from "@/entities/fasilitas/api/fasilitas.service";
import type { VillageStatsDto } from "@/entities/desa/model/types";

const DEFAULT_STATS: VillageStatsDto = {
  umkmCount: 0,
  productCount: 0,
  newsCount: 0,
  dusunCount: 0,
};

export async function HomePage() {
  const [profileResult, productsResult, umkmResult, beritaResult, mapLocationsResult] =
    await Promise.allSettled([
      DesaService.getProfileWithStats(),
      ProdukService.getLatest({ limit: 6 }),
      UmkmService.getLatestPublished({ limit: 6 }),
      BeritaService.getLatestPublished({ limit: 3 }),
      FasilitasService.getFacilities(),
    ]);

  const profile =
    profileResult.status === "fulfilled" ? profileResult.value.profile : null;
  const stats =
    profileResult.status === "fulfilled"
      ? profileResult.value.stats
      : DEFAULT_STATS;
  const productItems =
    productsResult.status === "fulfilled" ? productsResult.value : [];
  const umkmItems =
    umkmResult.status === "fulfilled" ? umkmResult.value.items : [];
  const newsItems =
    beritaResult.status === "fulfilled" ? beritaResult.value.items : [];
  const locations =
    mapLocationsResult.status === "fulfilled"
      ? mapLocationsResult.value.items
      : [];

  return (
    <>
      <Hero />
      <WelcomeSection profile={profile} />
      <StatsSection stats={stats} />
      <ProductsSection items={productItems} />
      <UmkmSection items={umkmItems} />
      <NewsSection items={newsItems} />
      <MapPreviewSection locations={locations} />
      <CommunityCtaSection />
    </>
  );
}
