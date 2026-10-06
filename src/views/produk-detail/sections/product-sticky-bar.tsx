"use client";

import { useEffect, useState } from "react";
import { FallbackImage } from "@/shared/ui/fallback-image";
import { Icon } from "@/shared/ui/icon";
import { formatRupiah } from "@/shared/utils/format-currency";
import { createWhatsappUrl } from "@/entities/umkm/model/whatsapp-link";
import type { ProductDetailDto } from "@/entities/produk/model/types";

interface ProductStickyBarProps {
  product: ProductDetailDto;
}

export function ProductStickyBar({ product }: ProductStickyBarProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show sticky bar after scrolling past 200px
      if (window.scrollY > 200) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const umkm = product.umkm;
  const sellerPhone = umkm?.phone || "";
  const unitPrice = product.price || 0;

  const waUrl = sellerPhone
    ? createWhatsappUrl(
        sellerPhone,
        `Halo ${umkm?.name || "Penjual"}, saya ingin memesan produk "${product.name}" (${formatRupiah(unitPrice)}) yang ada di katalog Desa Pringgodani. Apakah stok masih tersedia?`,
      )
    : product.whatsappLink || null;

  if (!isVisible) return null;

  return (
    <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-surface-container-lowest/95 border-outline-variant/30 border-t p-3 shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-full duration-300">
      <div className="mx-auto flex max-w-md items-center justify-between gap-3">
        {/* Left: Thumbnail & Price */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-surface-container border border-outline-variant/20">
            <FallbackImage
              src={product.imageUrl}
              alt={product.name}
              className="h-full w-full object-cover"
              fallbackIcon="inventory_2"
            />
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-bold text-on-surface">
              {product.name}
            </p>
            <p className="font-headline-md text-primary text-sm font-extrabold">
              {formatRupiah(unitPrice)}
            </p>
          </div>
        </div>

        {/* Right: WhatsApp CTA Button */}
        {waUrl ? (
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#25D366] hover:bg-[#20BD5A] text-white flex shrink-0 items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold shadow-md active:scale-95 transition-all"
          >
            <Icon name="chat" className="text-base" />
            <span>Pesan WA</span>
          </a>
        ) : (
          <span className="text-on-surface-variant text-xs italic">
            Stok Habis
          </span>
        )}
      </div>
    </div>
  );
}
