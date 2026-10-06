"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Icon } from "@/shared/ui/icon";
import { FallbackImage } from "@/shared/ui/fallback-image";
import type { VillageOfficialDto } from "@/entities/desa/model/types";

interface OfficialsCarouselProps {
  officials: VillageOfficialDto[];
}

export function OfficialsCarousel({ officials }: OfficialsCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollPrev(scrollLeft > 10);
    setCanScrollNext(scrollLeft + clientWidth < scrollWidth - 10);

    // Calculate approximate active card index
    const cardWidth = 300 + 24; // width + gap
    const index = Math.round(scrollLeft / cardWidth);
    setActiveIndex(Math.min(Math.max(0, index), officials.length - 1));
  }, [officials.length]);

  useEffect(() => {
    updateScrollState();
    const el = scrollRef.current;
    if (!el) return;

    el.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [updateScrollState]);

  const handleScroll = (direction: "prev" | "next") => {
    const el = scrollRef.current;
    if (!el) return;

    const scrollAmount = el.clientWidth * 0.75;
    el.scrollBy({
      left: direction === "next" ? scrollAmount : -scrollAmount,
      behavior: "smooth",
    });
  };

  if (officials.length === 0) {
    return (
      <div className="border-outline-variant/30 bg-surface-container-lowest mx-auto max-w-md rounded-3xl border border-dashed p-12 text-center">
        <Icon
          name="person_outline"
          className="text-on-surface-variant/50 mx-auto mb-2 text-4xl"
        />
        <p className="text-on-surface-variant text-sm">
          Data susunan perangkat desa belum ditambahkan oleh administrator.
        </p>
      </div>
    );
  }

  return (
    <div className="relative space-y-6">
      {/* Header with Navigation Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="bg-primary/10 text-primary inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-bold">
            <Icon name="groups" className="text-sm" />
            Struktur Organisasi
          </span>
          <h2 className="font-headline-lg text-primary mt-2 text-2xl font-bold sm:text-3xl">
            Perangkat Desa Pringgodani
          </h2>
          <p className="text-on-surface-variant mt-1.5 max-w-xl text-xs sm:text-sm">
            Geser untuk melihat aparatur pemerintah desa yang siap melayani
            masyarakat dan memajukan potensi desa.
          </p>
        </div>

        {/* Carousel Prev/Next Navigation Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleScroll("prev")}
            disabled={!canScrollPrev}
            aria-label="Geser ke kiri"
            className="border-outline-variant/40 bg-surface-container-lowest text-on-surface hover:bg-primary hover:text-on-primary disabled:opacity-30 flex h-11 w-11 items-center justify-center rounded-2xl border shadow-sm transition-all duration-200 disabled:pointer-events-none"
          >
            <Icon name="arrow_back" className="text-xl" />
          </button>

          <button
            type="button"
            onClick={() => handleScroll("next")}
            disabled={!canScrollNext}
            aria-label="Geser ke kanan"
            className="border-outline-variant/40 bg-surface-container-lowest text-on-surface hover:bg-primary hover:text-on-primary disabled:opacity-30 flex h-11 w-11 items-center justify-center rounded-2xl border shadow-sm transition-all duration-200 disabled:pointer-events-none"
          >
            <Icon name="arrow_forward" className="text-xl" />
          </button>
        </div>
      </div>

      {/* Carousel Track Container */}
      <div
        ref={scrollRef}
        className="[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden -mx-4 flex snap-x snap-mandatory gap-6 overflow-x-auto px-4 py-2 sm:mx-0 sm:px-0"
      >
        {officials.map((official, idx) => (
          <motion.div
            key={official.id || idx}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: idx * 0.05 }}
            whileHover={{ y: -6 }}
            className="border-outline-variant/25 bg-surface-container-lowest hover:border-primary/40 group flex w-[270px] shrink-0 snap-start flex-col justify-between overflow-hidden rounded-3xl border shadow-sm transition-all duration-300 hover:shadow-xl sm:w-[290px] lg:w-[300px]"
          >
            <div>
              {/* Photo & Badge */}
              <div className="bg-surface-container relative aspect-[4/5] w-full overflow-hidden">
                <FallbackImage
                  src={
                    official.photoUrl ||
                    official.photo ||
                    "/images/placeholder-avatar.jpg"
                  }
                  alt={official.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  fallbackIcon="person"
                />
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                  <span className="bg-surface/90 text-primary border-outline-variant/30 truncate rounded-full border px-3 py-1 text-[11px] font-bold shadow-sm backdrop-blur-md">
                    {official.position}
                  </span>
                </div>
              </div>

              {/* Info Body */}
              <div className="p-5">
                <h3 className="font-headline-md text-on-surface group-hover:text-primary text-base font-bold transition">
                  {official.name}
                </h3>
                <p className="text-on-surface-variant mt-0.5 text-xs font-medium">
                  Pemerintah Desa Pringgodani
                </p>

                {official.greeting && (
                  <p className="text-on-surface-variant border-primary/30 mt-3 border-l-2 py-0.5 pl-2.5 text-xs leading-relaxed italic">
                    &ldquo;{official.greeting}&rdquo;
                  </p>
                )}
              </div>
            </div>

            {/* Email Footer */}
            {official.email && (
              <div className="border-outline-variant/15 bg-surface/40 border-t p-4 pt-2.5">
                <a
                  href={`mailto:${official.email}`}
                  className="text-on-surface-variant hover:text-primary inline-flex w-full items-center gap-1.5 truncate text-xs font-medium transition"
                >
                  <Icon name="mail" className="text-primary text-sm shrink-0" />
                  <span className="truncate">{official.email}</span>
                </a>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Pagination Progress Dots */}
      {officials.length > 1 && (
        <div className="flex items-center justify-center gap-1.5 pt-2">
          {officials.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                const el = scrollRef.current;
                if (!el) return;
                const cardWidth = 300 + 24;
                el.scrollTo({ left: i * cardWidth, behavior: "smooth" });
              }}
              aria-label={`Ke perangkat slide ${i + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === activeIndex
                  ? "bg-primary w-7"
                  : "bg-outline-variant/40 hover:bg-outline-variant w-2"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
