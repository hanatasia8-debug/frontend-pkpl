"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@/shared/ui/icon";
import { formatRupiah } from "@/shared/utils/format-currency";
import { createWhatsappUrl } from "@/entities/umkm/model/whatsapp-link";
import type { ProductDetailDto } from "@/entities/produk/model/types";

interface ProductOrderBoxProps {
  product: ProductDetailDto;
}

export function ProductOrderBox({ product }: ProductOrderBoxProps) {
  const [quantity, setQuantity] = useState(1);
  const [copied, setCopied] = useState(false);

  const umkm = product.umkm;
  const sellerPhone = umkm?.phone || "";
  const unitPrice = product.price || 0;
  const totalPrice = unitPrice * quantity;

  // Personalized WhatsApp Order Message
  const orderMessage = sellerPhone
    ? createWhatsappUrl(
        sellerPhone,
        `Halo ${umkm?.name || "Penjual"}, saya tertarik ingin memesan produk "${product.name}" sebanyak ${quantity} item (Estimasi Total: ${formatRupiah(totalPrice)}) yang saya lihat di katalog Desa Pringgodani. Apakah stok masih tersedia?`,
      )
    : product.whatsappLink || null;

  // General Inquiry Message
  const askMessage = sellerPhone
    ? createWhatsappUrl(
        sellerPhone,
        `Halo ${umkm?.name || "Penjual"}, saya ingin menanyakan informasi lebih lanjut mengenai produk "${product.name}" yang ada di katalog Desa Pringgodani.`,
      )
    : null;

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleIncrement = () => {
    setQuantity((prev) => prev + 1);
  };

  const handleShare = async () => {
    const shareData = {
      title: `${product.name} — Lokal Pringgodani`,
      text: `Lihat produk unggulan "${product.name}" dari ${umkm?.name || "UMKM Desa Pringgodani"}:`,
      url: window.location.href,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        // Fallback to clipboard if cancelled or failed
      }
    }

    // Fallback: Copy to clipboard
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Gagal menyalin link:", err);
    }
  };

  return (
    <div className="flex flex-col justify-between space-y-4 sm:space-y-6">
      {/* Top Section: Title, Category & Price */}
      <div className="space-y-3 sm:space-y-4">
        {/* Category & Toko Link */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {umkm?.category && (
            <span className="bg-primary/10 text-primary rounded-full px-2.5 py-0.5 text-[11px] sm:text-xs font-bold">
              {umkm.category.name}
            </span>
          )}
          {umkm && (
            <Link
              href={`/umkm/${umkm.slug}`}
              className="text-on-surface-variant hover:text-primary flex items-center gap-1 text-[11px] sm:text-xs font-semibold transition truncate max-w-[220px]"
            >
              <Icon name="storefront" className="text-primary text-xs shrink-0" />
              <span className="truncate">{umkm.name}</span>
            </Link>
          )}
        </div>

        {/* Product Title */}
        <h1 className="font-display-hero text-on-surface text-xl font-extrabold tracking-tight sm:text-3xl lg:text-4xl leading-tight">
          {product.name}
        </h1>

        {/* Price Box */}
        <div className="bg-surface-container-low border-outline-variant/20 rounded-2xl border p-3.5 sm:p-5">
          <div className="flex items-baseline justify-between gap-2 flex-wrap sm:flex-nowrap">
            <div>
              <p className="text-on-surface-variant text-[10px] sm:text-[11px] uppercase tracking-wider font-semibold">
                Harga Resmi dari Pengrajin
              </p>
              <div className="mt-0.5 sm:mt-1 flex items-baseline gap-1.5 sm:gap-2">
                <span className="font-display-hero text-primary text-xl font-extrabold sm:text-3xl">
                  {formatRupiah(unitPrice)}
                </span>
                <span className="text-on-surface-variant/70 text-xs">/ satuan</span>
              </div>
            </div>

            {/* Status Ready Stock */}
            <div className="bg-emerald-500/10 text-emerald-700 border-emerald-500/30 flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 sm:px-3 sm:py-1 text-[11px] sm:text-xs font-bold shrink-0">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Siap Pesan</span>
            </div>
          </div>

          {/* Dynamic Quantity Selector & Total Calculation */}
          <div className="border-outline-variant/20 mt-3 sm:mt-4 border-t pt-3 sm:pt-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="text-on-surface-variant text-xs font-semibold">
                  Jumlah:
                </span>
                <div className="border-outline-variant/40 bg-surface-container-lowest flex items-center rounded-xl border shadow-xs">
                  <button
                    type="button"
                    onClick={handleDecrement}
                    disabled={quantity <= 1}
                    aria-label="Kurangi kuantitas"
                    className="text-on-surface hover:bg-surface-container disabled:opacity-30 flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-l-xl transition active:scale-90"
                  >
                    <Icon name="minus" className="text-xs sm:text-sm" />
                  </button>
                  <span className="min-w-[2rem] sm:min-w-[2.5rem] text-center text-xs sm:text-sm font-bold text-on-surface">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={handleIncrement}
                    aria-label="Tambah kuantitas"
                    className="text-on-surface hover:bg-surface-container flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-r-xl transition active:scale-90"
                  >
                    <Icon name="plus" className="text-xs sm:text-sm" />
                  </button>
                </div>
              </div>

              {/* Subtotal Preview */}
              <div className="text-right">
                <p className="text-on-surface-variant text-[10px] sm:text-[11px] font-semibold">
                  Estimasi Total
                </p>
                <p className="font-headline-md text-primary text-sm sm:text-lg font-extrabold">
                  {formatRupiah(totalPrice)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons: WhatsApp Buy & Inquire */}
      <div className="space-y-2.5 sm:space-y-3">
        {orderMessage ? (
          <a
            href={orderMessage}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#25D366] hover:bg-[#20BD5A] text-white flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 sm:py-4 px-4 sm:px-6 text-xs sm:text-sm font-bold shadow-md shadow-emerald-900/10 transition-all duration-200 hover:shadow-lg active:scale-[0.98]"
          >
            <Icon name="chat" className="text-lg sm:text-xl shrink-0" />
            <span className="truncate">Pesan Sekarang via WhatsApp ({quantity} item)</span>
          </a>
        ) : (
          <div className="bg-surface-container text-on-surface-variant rounded-2xl p-3.5 text-center text-xs">
            Kontak WhatsApp penjual belum tersedia saat ini.
          </div>
        )}

        {/* Secondary Actions: Tanya Penjual & Share */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          {askMessage && (
            <a
              href={askMessage}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-surface-container-lowest hover:bg-surface-container border-outline-variant/30 text-on-surface flex items-center justify-center gap-1.5 rounded-xl border py-2.5 px-2.5 text-[11px] sm:text-xs font-bold transition active:scale-95 text-center truncate"
            >
              <Icon name="message" className="text-primary text-xs sm:text-sm shrink-0" />
              <span className="truncate">Tanya Penjual</span>
            </a>
          )}

          <button
            type="button"
            onClick={handleShare}
            className="bg-surface-container-lowest hover:bg-surface-container border-outline-variant/30 text-on-surface flex items-center justify-center gap-1.5 rounded-xl border py-2.5 px-2.5 text-[11px] sm:text-xs font-bold transition active:scale-95 text-center truncate"
          >
            <Icon name={copied ? "check" : "share"} className="text-primary text-xs sm:text-sm shrink-0" />
            <span className="truncate">{copied ? "Link Disalin!" : "Bagikan"}</span>
          </button>
        </div>
      </div>

      {/* Info Highlights */}
      <div className="border-outline-variant/20 border-t pt-3 sm:pt-4">
        <ul className="text-on-surface-variant/85 space-y-1.5 sm:space-y-2 text-xs">
          <li className="flex items-center gap-2">
            <Icon name="location_on" className="text-primary text-sm shrink-0" />
            <span className="truncate">Lokasi: <strong>{umkm?.address || "Desa Pringgodani"}</strong></span>
          </li>
          <li className="flex items-center gap-2">
            <Icon name="verified" className="text-primary text-sm shrink-0" />
            <span>Status: <strong>Terverifikasi Resmi Pemdes</strong></span>
          </li>
          <li className="flex items-center gap-2">
            <Icon name="assignment_turned_in" className="text-primary text-sm shrink-0" />
            <span>Transaksi: <strong>Langsung ke Penjual</strong></span>
          </li>
        </ul>
      </div>
    </div>
  );
}
