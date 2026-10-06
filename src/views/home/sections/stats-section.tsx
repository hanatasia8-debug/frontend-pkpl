"use client";

import { motion } from "framer-motion";
import { Icon } from "@/shared/ui/icon";
import { CountUp } from "@/shared/ui/count-up";
import type { VillageStatsDto } from "@/entities/desa/model/types";

interface StatsSectionProps {
  stats: VillageStatsDto;
}

export function StatsSection({ stats }: StatsSectionProps) {
  const items = [
    { icon: "storefront", value: stats.umkmCount, label: "UMKM Terdaftar" },
    { icon: "inventory_2", value: stats.productCount, label: "Produk Lokal" },
    { icon: "newspaper", value: stats.newsCount, label: "Kabar & Berita" },
  ];

  return (
    <section className="bg-primary-container text-on-primary-container py-12 md:py-16 shadow-inner relative overflow-hidden">
      {/* Decorative ambient background blur */}
      <div className="pointer-events-none absolute inset-0 -z-0 opacity-10 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.8),transparent_70%)]" />

      <div className="max-w-4xl px-gutter mx-auto relative z-10 grid grid-cols-3 gap-4 sm:gap-8 md:gap-12">
        {items.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.12 }}
            className="group flex flex-col items-center text-center"
          >
            <div className="mb-3 flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-white/12 text-on-primary-container backdrop-blur-sm border border-white/15 transition-all duration-300 group-hover:scale-110 group-hover:bg-white/20 shadow-sm">
              <Icon name={stat.icon} className="text-2xl sm:text-3xl" />
            </div>
            <div className="font-display-hero text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
              <CountUp value={stat.value} duration={1.8 + idx * 0.2} />
            </div>
            <div className="font-label-sm mt-1 sm:mt-1.5 text-[11px] sm:text-xs md:text-sm font-semibold tracking-wide uppercase opacity-90">
              {stat.label}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

