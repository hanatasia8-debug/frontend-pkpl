"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Icon } from "@/shared/ui/icon";
import type { MapLocationDto } from "@/entities/fasilitas/model/types";
import { GoogleMapCanvas } from "@/views/peta/sections/google-map-canvas";

interface MapPreviewSectionProps {
  locations: MapLocationDto[];
}

export function MapPreviewSection({ locations }: MapPreviewSectionProps) {
  const [selectedLocation, setSelectedLocation] =
    useState<MapLocationDto | null>(null);

  return (
    <section className="bg-surface-container-low py-16">
      <div className="max-w-container-max px-gutter mx-auto">
        <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <span className="bg-primary/10 text-primary mb-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold">
              <Icon name="map" className="text-sm" />
              Peta Persebaran Lokasi
            </span>
            <h2 className="font-headline-lg text-2xl md:text-3xl font-bold text-primary">
              Peta Lokasi UMKM Desa
            </h2>
            <p className="text-on-surface-variant mt-1 text-sm max-w-xl">
              Eksplorasi lokasi fisik toko, bengkel, warung, dan sentra produksi UMKM di seluruh wilayah Desa Pringgodani.
            </p>
          </div>
          <Link
            href="/peta"
            className="bg-primary text-on-primary hover:bg-primary/90 inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-bold shadow-sm transition active:scale-95"
          >
            <span>Buka Peta Interaktif</span>
            <Icon name="open_in_new" className="text-sm" />
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.99 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="border-outline-variant/30 relative h-[450px] w-full overflow-hidden rounded-3xl border shadow-md"
        >
          <GoogleMapCanvas
            locations={locations}
            selectedLocation={selectedLocation}
            onSelectLocation={setSelectedLocation}
          />
        </motion.div>
      </div>
    </section>
  );
}
