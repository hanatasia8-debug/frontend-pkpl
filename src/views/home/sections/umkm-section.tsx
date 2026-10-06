"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Icon } from "@/shared/ui/icon";
import { UmkmCard } from "@/entities/umkm/ui/umkm-card";
import type { UmkmListItemDto } from "@/entities/umkm/model/types";

interface UmkmSectionProps {
  items: UmkmListItemDto[];
}

export function UmkmSection({ items }: UmkmSectionProps) {
  return (
    <section className="bg-surface-container-low py-12 md:py-16">
      <div className="max-w-container-max px-gutter mx-auto">
        <div className="mb-6 flex flex-col items-start justify-between gap-3 sm:mb-8 md:flex-row md:items-end">
          <div>
            <span className="bg-secondary/10 text-secondary mb-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold">
              <Icon name="storefront" className="text-sm" />
              Direktori Usaha Warga
            </span>
            <h2 className="font-headline-lg text-primary text-2xl font-bold md:text-3xl">
              UMKM Pringgodani Unggulan
            </h2>
            <p className="text-on-surface-variant mt-1 max-w-xl text-xs sm:text-sm">
              Profil usaha dan sentra kerajinan warga yang terverifikasi dan
              siap melayani pemesanan.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-on-surface-variant/70 md:hidden text-[11px] font-medium flex items-center gap-1">
              <Icon name="swipe" className="text-sm" /> Geser &rarr;
            </span>
            <Link
              href="/umkm"
              className="text-secondary hover:text-secondary/80 inline-flex items-center gap-1.5 text-xs font-bold transition sm:text-sm"
            >
              <span>Lihat Semua UMKM</span>
              <Icon name="arrow_forward" className="text-sm" />
            </Link>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="border-outline-variant/30 bg-surface-container-lowest rounded-3xl border border-dashed px-6 py-12 text-center">
            <p className="text-on-surface-variant text-sm">
              Belum ada UMKM terdaftar.
            </p>
          </div>
        ) : (
          <div className="scrollbar-hide -mx-gutter px-gutter flex snap-x snap-mandatory overflow-x-auto pb-4 pt-1 gap-4 sm:gap-6 md:grid md:grid-cols-2 lg:grid-cols-4 md:overflow-visible md:pb-0 md:mx-0 md:px-0">
            {items.slice(0, 6).map((umkm, idx) => (
              <motion.div
                key={umkm.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: idx * 0.08 }}
                className="w-[80vw] min-w-[260px] max-w-[340px] flex-shrink-0 snap-start md:w-auto md:min-w-0 md:max-w-none h-full flex flex-col"
              >
                <UmkmCard umkm={umkm} variant="listing" />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
