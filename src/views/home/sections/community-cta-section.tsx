"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Icon } from "@/shared/ui/icon";

export function CommunityCtaSection() {
  return (
    <section className="max-w-container-max pb-16 px-gutter mx-auto">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Card 1: UMKM Registration */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          whileHover={{ y: -4 }}
          className="group relative overflow-hidden rounded-3xl bg-secondary text-on-secondary p-8 md:p-10 shadow-lg"
        >
          <div className="relative z-10 flex flex-col justify-between h-full space-y-5">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1 text-xs font-semibold backdrop-blur-sm">
                <Icon name="storefront" className="text-sm" />
                <span>Pelaku Usaha Lokal</span>
              </div>
              <h3 className="font-headline-lg text-2xl md:text-3xl font-bold">
                Punya Usaha di Pringgodani?
              </h3>
              <p className="mt-2 text-sm opacity-90 leading-relaxed max-w-md">
                Daftarkan UMKM dan produk Anda untuk dipromosikan di platform resmi desa. Gratis dan langsung terhubung dengan pembeli via WhatsApp.
              </p>
            </div>
            <div>
              <Link
                href="/umkm/daftar"
                className="inline-flex items-center gap-2 rounded-full bg-on-secondary text-secondary px-6 py-3 text-sm font-bold shadow-md transition hover:bg-white hover:shadow-xl active:scale-95"
              >
                <span>Daftarkan Usaha Anda</span>
                <Icon name="arrow_forward" className="text-sm" />
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Card 2: News / Contribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          whileHover={{ y: -4 }}
          className="group relative overflow-hidden rounded-3xl bg-primary text-on-primary p-8 md:p-10 shadow-lg"
        >
          <div className="relative z-10 flex flex-col justify-between h-full space-y-5">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1 text-xs font-semibold backdrop-blur-sm">
                <Icon name="edit_square" className="text-sm" />
                <span>Kontribusi Warga</span>
              </div>
              <h3 className="font-headline-lg text-2xl md:text-3xl font-bold">
                Ada Informasi atau Kegiatan?
              </h3>
              <p className="mt-2 text-sm opacity-90 leading-relaxed max-w-md">
                Bagikan kabar UMKM, event bazar, pelatihan wirausaha, atau kegiatan positif warga desa untuk dipublikasikan.
              </p>
            </div>
            <div>
              <Link
                href="/submit/berita"
                className="inline-flex items-center gap-2 rounded-full bg-on-primary text-primary px-6 py-3 text-sm font-bold shadow-md transition hover:bg-white hover:shadow-xl active:scale-95"
              >
                <span>Kirim Berita / Event</span>
                <Icon name="arrow_forward" className="text-sm" />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
