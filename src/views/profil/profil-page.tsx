"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Icon } from "@/shared/ui/icon";
import { FallbackImage } from "@/shared/ui/fallback-image";
import { CountUp } from "@/shared/ui/count-up";
import type {
  VillageProfileDto,
  VillageStatsDto,
} from "@/entities/desa/model/types";
import { useVillageProfile } from "@/features/village-profile/model/use-village-profile";

import { OfficialsCarousel } from "./sections/officials-carousel";

interface ProfilPageProps {
  profile: VillageProfileDto | null;
  stats: VillageStatsDto;
}



export function ProfilPage({
  profile: initialProfile,
  stats,
}: ProfilPageProps) {
  const profile = useVillageProfile(initialProfile);
  const heroPhoto = profile?.headPhoto || "/images/placeholder-avatar.jpg";

  const sortedOfficials = useMemo(() => {
    const list = [...(profile?.officials ?? [])];
    return list.sort((a, b) => {
      const isAKades =
        a.position.toLowerCase().includes("kepala desa") ||
        a.position.toLowerCase().includes("kades");
      const isBKades =
        b.position.toLowerCase().includes("kepala desa") ||
        b.position.toLowerCase().includes("kades");
      if (isAKades && !isBKades) return -1;
      if (!isAKades && isBKades) return 1;
      return 0;
    });
  }, [profile?.officials]);

  return (
    <div className="pb-20 pt-20">
      {/* ── 1. Header Profil Desa ── */}
      <section className="bg-primary text-on-primary relative overflow-hidden">
        <div className="max-w-container-max px-gutter relative mx-auto py-14 lg:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-semibold text-white/90 backdrop-blur-sm border border-white/20">
              <Icon name="account_balance" className="text-sm" />
              <span>Profil Pemerintahan Desa</span>
            </div>

            <h1 className="font-display-hero text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
              Desa Pringgodani
            </h1>
            <p className="mt-3 text-sm sm:text-base text-white/90 leading-relaxed max-w-2xl">
              Kecamatan Bantur, Kabupaten Malang, Provinsi Jawa Timur. Pusat masyarakat produktif, berbudaya, dan berdaya saing wirausaha mandiri.
            </p>

            {/* Quick Summary Pill Row */}
            <div className="mt-8 flex flex-wrap gap-4 text-xs font-medium text-white/90">
              <div className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 backdrop-blur-sm border border-white/15">
                <Icon name="storefront" className="text-base text-primary-fixed" />
                <span><strong className="font-bold"><CountUp value={stats.umkmCount} duration={1.6} /></strong> UMKM Terdaftar</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 backdrop-blur-sm border border-white/15">
                <Icon name="inventory_2" className="text-base text-primary-fixed" />
                <span><strong className="font-bold"><CountUp value={stats.productCount} duration={1.8} /></strong> Produk Unggulan</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 backdrop-blur-sm border border-white/15">
                <Icon name="location_city" className="text-base text-primary-fixed" />
                <span><strong className="font-bold"><CountUp value={stats.dusunCount || 4} duration={1.4} /></strong> Dusun Administratif</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── 2. Sambutan Kepala Desa & Profil Wilayah ── */}
      <section className="py-14 sm:py-16">
        <div className="max-w-container-max px-gutter mx-auto">
          <div className="grid gap-10 lg:grid-cols-12 items-start">
            {/* Foto Kepala Desa */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-4"
            >
              <div className="overflow-hidden rounded-3xl border border-outline-variant/30 bg-surface-container-lowest shadow-md">
                <div className="relative aspect-[3/4] w-full overflow-hidden bg-surface-container">
                  <FallbackImage
                    src={heroPhoto}
                    alt={profile?.headName ?? "Kepala Desa Pringgodani"}
                    className="h-full w-full object-cover"
                    fallbackIcon="person"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-5 text-white">
                    <p className="font-headline-md text-base font-bold">
                      {profile?.headName || "Pemerintah Desa Pringgodani"}
                    </p>
                    <p className="text-xs text-white/80 mt-0.5">
                      {profile?.headPosition || "Kepala Desa"}
                    </p>
                  </div>
                </div>

                <div className="p-5 space-y-3 text-xs text-on-surface-variant">
                  <div className="flex items-center gap-2.5">
                    <Icon name="location_on" className="text-primary text-base shrink-0" />
                    <span>{profile?.address || "Balai Desa Pringgodani, Kec. Bantur, Kab. Malang"}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Icon name="call" className="text-primary text-base shrink-0" />
                    <span>{profile?.phone || "0812-3456-7890"}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Icon name="schedule" className="text-primary text-base shrink-0" />
                    <span>Senin - Jumat: 08.00 - 15.00 WIB</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Narasi & Sambutan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="lg:col-span-8 space-y-6"
            >
              {/* Box Sambutan */}
              <div className="rounded-3xl border border-primary/20 bg-primary/[0.04] p-6 sm:p-8 shadow-sm">
                <span className="bg-primary/10 text-primary mb-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold">
                  <Icon name="format_quote" className="text-sm" />
                  Sambutan Kepala Desa
                </span>
                <blockquote className="font-body-lg text-on-surface text-base sm:text-lg leading-relaxed italic">
                  &ldquo;
                  {profile?.headGreeting ??
                    "Pemerintah Desa Pringgodani berkomitmen penuh mendukung pertumbuhan dan digitalisasi UMKM lokal sebagai pilar utama kemandirian ekonomi desa."}
                  &rdquo;
                </blockquote>
              </div>

              {/* Sekilas Profil Desa */}
              <div className="rounded-3xl border border-outline-variant/20 bg-surface-container-lowest p-6 sm:p-8 shadow-sm space-y-4">
                <h2 className="font-headline-md text-xl sm:text-2xl font-bold text-primary">
                  Sekilas Tentang {profile?.villageName?.replace(/^Desa\s+/i, "") || "Pringgodani"}
                </h2>
                {profile?.aboutText ? (
                  <div className="text-on-surface-variant text-sm leading-relaxed space-y-3 whitespace-pre-line">
                    {profile.aboutText}
                  </div>
                ) : (
                  <>
                    <p className="text-on-surface-variant text-sm leading-relaxed">
                      Desa Pringgodani berada di wilayah Kecamatan Bantur, Kabupaten Malang, Jawa Timur. Wilayah ini dianugerahi tanah yang subur untuk komoditas pertanian tebu, padi, dan palawija, serta masyarakat yang aktif memproduksi aneka produk olahan rumahan, kerajinan tangan, dan aneka usaha jasa.
                    </p>
                    <p className="text-on-surface-variant text-sm leading-relaxed">
                      Melalui portal <strong>Lokal Pringgodani</strong>, Pemerintah Desa memfasilitasi publikasi produk olahan, sentra kerajinan, dan hasil bumi warga agar mudah ditemukan oleh masyarakat luas dan pembeli dari luar daerah secara langsung.
                    </p>
                  </>
                )}
              </div>

              {/* Pusat Layanan & Website Resmi Pemerintahan Desa (Contextual SEO Backlink) */}
              <div className="rounded-3xl border border-primary/25 bg-gradient-to-br from-primary/[0.06] via-surface-container-lowest to-surface-container-low p-6 sm:p-8 shadow-sm space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary text-on-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl shadow-xs">
                      <Icon name="account_balance" className="text-xl" />
                    </div>
                    <div>
                      <h3 className="font-headline-md text-base sm:text-lg font-bold text-primary">
                        Portal Resmi Pemerintah Desa Pringgodani
                      </h3>
                      <p className="text-xs text-on-surface-variant">
                        Kecamatan Bantur, Kabupaten Malang, Provinsi Jawa Timur
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                    Domain Resmi .desa.id
                  </span>
                </div>

                <p className="text-on-surface-variant text-sm leading-relaxed">
                  Untuk permohonan surat keterangan, pengurusan administrasi kependudukan (KTP, Kartu Keluarga, Akta), transparansi anggaran APBDes, serta layanan birokrasi pemerintahan desa secara online, warga dan masyarakat luas dapat mengakses website induk:
                </p>

                <div className="pt-2">
                  <a
                    href="https://pringgodani-malangkab.desa.id"
                    target="_blank"
                    rel="noopener"
                    className="group inline-flex items-center gap-3 rounded-2xl bg-primary px-5 py-3.5 text-sm font-bold text-on-primary shadow-md transition-all hover:bg-primary/90 hover:shadow-lg active:scale-95"
                    title="Website Resmi Pemerintah Desa Pringgodani, Kecamatan Bantur, Kabupaten Malang"
                  >
                    <Icon name="public" className="text-xl transition-transform group-hover:rotate-12" />
                    <span>Kunjungi Website Resmi: pringgodani-malangkab.desa.id</span>
                    <Icon name="arrow_outward" className="text-lg transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── 3. Jajaran Perangkat Desa (Carousel Slider) ── */}
      <section className="bg-surface-container-low/50 border-t border-outline-variant/20 py-16">
        <div className="max-w-container-max px-gutter mx-auto">
          <OfficialsCarousel officials={sortedOfficials} />
        </div>
      </section>
    </div>
  );
}
