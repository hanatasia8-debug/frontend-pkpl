"use client";

import { useState, useEffect } from "react";
import { FallbackImage } from "@/shared/ui/fallback-image";
import { Icon } from "@/shared/ui/icon";

interface ProductGalleryProps {
  imageUrl: string;
  productName: string;
  categoryName?: string;
}

export function ProductGallery({
  imageUrl,
  productName,
  categoryName,
}: ProductGalleryProps) {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Close lightbox on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsLightboxOpen(false);
    };
    if (isLightboxOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isLightboxOpen]);

  return (
    <>
      <div className="relative flex flex-col gap-2 sm:gap-3">
        {/* Main Image Container */}
        <div
          onClick={() => setIsLightboxOpen(true)}
          className="group bg-surface-container relative aspect-square sm:aspect-square w-full cursor-zoom-in overflow-hidden rounded-2xl sm:rounded-3xl border border-outline-variant/30 shadow-xs sm:shadow-sm transition-all duration-300 hover:shadow-md"
          role="button"
          tabIndex={0}
          aria-label={`Buka gambar ${productName} ukuran penuh`}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setIsLightboxOpen(true);
            }
          }}
        >
          <FallbackImage
            src={imageUrl}
            alt={productName}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            fallbackIcon="inventory_2"
          />

          {/* Gradient Overlay on Bottom */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-60 transition-opacity group-hover:opacity-40" />

          {/* Floating Badges */}
          <div className="absolute top-2.5 left-2.5 right-2.5 sm:top-3.5 sm:left-3.5 sm:right-3.5 flex items-center justify-between gap-2 pointer-events-none">
            {/* Category Tag */}
            {categoryName ? (
              <span className="bg-slate-900/80 text-white/95 rounded-full px-2.5 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-[11px] font-bold tracking-wider uppercase shadow-xs backdrop-blur-md truncate max-w-[150px]">
                {categoryName}
              </span>
            ) : (
              <span />
            )}

            {/* Verified Badge */}
            <span
              className="bg-primary/95 text-on-primary flex items-center gap-1 rounded-full px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-[11px] font-bold shadow-xs backdrop-blur-md shrink-0"
              title="Produk Terverifikasi Resmi Pemdes Pringgodani"
            >
              <Icon name="verified" className="text-xs" />
              <span className="text-[9px] sm:text-[10px] uppercase tracking-wider">Terverifikasi</span>
            </span>
          </div>

          {/* Zoom hint button floating bottom-right */}
          <div className="absolute bottom-2.5 right-2.5 sm:bottom-3.5 sm:right-3.5 bg-black/60 text-white hover:bg-black/80 flex items-center gap-1 sm:gap-1.5 rounded-full px-2.5 py-1 sm:px-3 sm:py-1.5 text-[11px] sm:text-xs font-semibold backdrop-blur-md transition-transform duration-200 group-hover:scale-105">
            <Icon name="visibility" className="text-xs sm:text-sm" />
            <span className="text-[10px] sm:text-[11px]">Perbesar</span>
          </div>
        </div>

        {/* Caption beneath photo */}
        <p className="text-on-surface-variant/65 text-center text-[10px] sm:text-[11px] italic">
          *Ketuk gambar untuk melihat foto detail ukuran penuh
        </p>
      </div>

      {/* Lightbox / Fullscreen Modal */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-3 sm:p-4 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setIsLightboxOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label={`Pratinjau gambar penuh ${productName}`}
        >
          {/* Close button */}
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-4 right-4 z-10 flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-all active:scale-95"
            aria-label="Tutup pratinjau gambar"
          >
            <Icon name="close" className="text-xl sm:text-2xl" />
          </button>

          {/* Inner Image Container */}
          <div
            className="relative max-h-[85vh] max-w-[95vw] sm:max-w-[90vw] overflow-hidden rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <FallbackImage
              src={imageUrl}
              alt={productName}
              className="max-h-[85vh] max-w-[95vw] sm:max-w-[90vw] object-contain"
              fallbackIcon="inventory_2"
            />
            <div className="bg-gradient-to-t from-black/85 via-black/40 to-transparent absolute bottom-0 inset-x-0 p-3 sm:p-4 text-white">
              <h3 className="font-headline-md text-sm sm:text-lg font-bold">{productName}</h3>
              {categoryName && (
                <p className="text-[11px] sm:text-xs text-white/80 mt-0.5">{categoryName} — Desa Pringgodani</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
