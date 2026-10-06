"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Icon } from "@/shared/ui/icon";
import { FallbackImage } from "@/shared/ui/fallback-image";
import { BannerService } from "@/entities/banner/api/banner.service";
import { getCustomBanner } from "@/shared/utils/custom-banner-storage";

export function Hero() {
  const [bannerImage, setBannerImage] = useState<string | null>(null);

  useEffect(() => {
    getCustomBanner().then((customUrl) => {
      if (customUrl) {
        setBannerImage(customUrl);
      } else {
        BannerService.getActive()
          .then((res) => {
            if (res && res.items && res.items.length > 0) {
              setBannerImage(res.items[0].imageUrl);
            }
          })
          .catch(() => {});
      }
    });
  }, []);

  return (
    <section className="relative flex min-h-[90vh] w-full items-center justify-center overflow-hidden">
      {/* Background Image & Overlay */}
      <div className="absolute inset-0 z-0">
        <div className="bg-gradient-to-t from-black/85 via-black/45 to-black/30 absolute inset-0 z-10" />
        {bannerImage ? (
          <FallbackImage
            src={bannerImage}
            alt="Desa Pringgodani"
            className="h-full w-full object-cover scale-105 transition-transform duration-1000"
          />
        ) : (
          <div className="bg-primary h-full w-full" />
        )}
      </div>

      {/* Content Center */}
      <div className="px-gutter relative z-20 mx-auto max-w-4xl text-center text-white pt-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-xs md:text-sm font-semibold text-white backdrop-blur-md">
            <Icon name="location_on" className="text-sm" />
            <span>Desa Pringgodani, Kec. Bantur, Kab. Malang</span>
          </div>

          <h1 className="font-display-hero text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-4 leading-tight">
            Lokal Pringgodani
            <br />
            <span className="text-primary-fixed">Produk, UMKM &amp; Hasil Bumi</span>
          </h1>

          <p className="font-body-lg text-base sm:text-lg text-white/90 max-w-2xl mx-auto mb-8 leading-relaxed">
            Katalog resmi produk olahan pangan, kerajinan tangan, dan hasil panen pertanian unggulan warga Desa Pringgodani. Pesan mudah langsung via WhatsApp produsen.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/produk"
              className="inline-flex items-center gap-2 rounded-full bg-white text-primary px-8 py-3.5 text-sm font-extrabold shadow-xl transition-all hover:bg-neutral-100 hover:scale-105 active:scale-95"
            >
              <Icon name="shopping_bag" className="text-base" />
              <span>Katalog Produk</span>
            </Link>
            <Link
              href="/umkm"
              className="inline-flex items-center gap-2 rounded-full border-2 border-white bg-white/10 text-white px-8 py-3.5 text-sm font-extrabold backdrop-blur-md transition-all hover:bg-white/20 hover:scale-105 active:scale-95"
            >
              <Icon name="storefront" className="text-base" />
              <span>Direktori UMKM</span>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Down indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-bounce opacity-75 text-white">
        <Icon name="keyboard_arrow_down" className="text-3xl" />
      </div>
    </section>
  );
}
