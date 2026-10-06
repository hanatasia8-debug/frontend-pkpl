"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Icon } from "@/shared/ui/icon";
import { ProductCard } from "@/entities/produk/ui/product-card";
import type { ProductItemDto } from "@/entities/produk/model/types";

interface ProductsSectionProps {
  items: ProductItemDto[];
}

export function ProductsSection({ items }: ProductsSectionProps) {
  return (
    <section className="max-w-container-max px-gutter mx-auto py-12 md:py-16">
      <div className="mb-6 flex flex-col items-start justify-between gap-3 sm:mb-8 md:flex-row md:items-end">
        <div>
          <span className="bg-primary/10 text-primary mb-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold">
            <Icon name="shopping_bag" className="text-sm" />
            Produk Lokal Pringgodani
          </span>
          <h2 className="font-headline-lg text-primary text-2xl font-bold md:text-3xl">
            Produk Pilihan Warga
          </h2>
          <p className="text-on-surface-variant mt-1 max-w-xl text-xs sm:text-sm">
            Aneka olahan pangan, kerajinan, dan hasil bumi asli desa
            Pringgodani yang siap dipesan langsung via WhatsApp.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-on-surface-variant/70 md:hidden text-[11px] font-medium flex items-center gap-1">
            <Icon name="swipe" className="text-sm" /> Geser &rarr;
          </span>
          <Link
            href="/produk"
            className="text-primary hover:text-primary/80 inline-flex items-center gap-1.5 text-xs font-bold transition sm:text-sm"
          >
            <span>Lihat Semua Produk</span>
            <Icon name="arrow_forward" className="text-sm" />
          </Link>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="border-outline-variant/30 bg-surface-container-low rounded-3xl border border-dashed px-6 py-12 text-center">
          <p className="text-on-surface-variant text-sm">
            Belum ada produk yang dipublikasikan.
          </p>
        </div>
      ) : (
        <div className="scrollbar-hide -mx-gutter px-gutter flex snap-x snap-mandatory overflow-x-auto pb-3 pt-1 gap-3.5 sm:gap-4 md:grid md:grid-cols-3 lg:grid-cols-6 md:overflow-visible md:pb-0 md:mx-0 md:px-0">
          {items.slice(0, 6).map((product, idx) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: idx * 0.06 }}
              className="w-[46vw] min-w-[160px] max-w-[210px] flex-shrink-0 snap-start md:w-auto md:min-w-0 md:max-w-none h-full flex flex-col"
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}
