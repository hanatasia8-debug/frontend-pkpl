"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Icon } from "@/shared/ui/icon";
import { NewsCard } from "@/entities/berita/ui/news-card";
import type { NewsListItemDto } from "@/entities/berita/model/types";

interface NewsSectionProps {
  items: NewsListItemDto[];
}

export function NewsSection({ items }: NewsSectionProps) {
  return (
    <section className="py-16">
      <div className="max-w-container-max px-gutter mx-auto">
        <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <span className="bg-primary/10 text-primary mb-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold">
              <Icon name="newspaper" className="text-sm" />
              Kabar Desa & Wirausaha
            </span>
            <h2 className="font-headline-lg text-2xl md:text-3xl font-bold text-primary">
              Berita & Kegiatan Terkini
            </h2>
            <p className="text-on-surface-variant mt-1 text-sm max-w-xl">
              Informasi seputar pelatihan wirausaha, agenda desa, kemitraan UMKM, dan kegiatan warga Pringgodani.
            </p>
          </div>
          <Link
            href="/berita"
            className="text-primary hover:text-primary/80 inline-flex items-center gap-1.5 text-sm font-bold transition"
          >
            <span>Lihat Semua Berita</span>
            <Icon name="arrow_forward" className="text-sm" />
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="border-outline-variant/30 bg-surface-container-low rounded-3xl border border-dashed px-6 py-12 text-center">
            <p className="text-on-surface-variant text-sm">
              Belum ada berita yang dipublikasikan.
            </p>
          </div>
        ) : (
          <div className="gap-6 scrollbar-hide flex snap-x snap-mandatory overflow-x-auto pb-2 md:grid md:grid-cols-3 md:overflow-visible md:pb-0">
            {items.map((news, idx) => (
              <motion.div
                key={news.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: idx * 0.1 }}
                whileHover={{ y: -4 }}
                className="w-[85vw] flex-shrink-0 snap-center md:w-auto"
              >
                <NewsCard news={news} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
