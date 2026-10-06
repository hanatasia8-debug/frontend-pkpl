import Link from "next/link";
import { FallbackImage } from "@/shared/ui/fallback-image";
import { Icon } from "@/shared/ui/icon";
import { formatRupiah } from "@/shared/utils/format-currency";
import { createWhatsappUrl } from "@/entities/umkm/model/whatsapp-link";
import type { ProductItemDto } from "../model/types";

interface ProductCardProps {
  product: ProductItemDto;
}

export function ProductCard({ product }: ProductCardProps) {
  const umkm = product.umkm;
  const waUrl =
    product.whatsappLink ||
    (umkm?.phone
      ? createWhatsappUrl(
          umkm.phone,
          `Halo ${umkm.name || "Penjual"}, saya tertarik ingin memesan produk "${product.name}" yang saya lihat di platform LokalUMKM Pringgodani. Apakah produk ini masih tersedia?`,
        )
      : null);

  const categoryName =
    umkm?.category?.name || "Produk Desa";

  return (
    <article className="group bg-surface-container-lowest border-outline-variant/30 hover:border-primary/50 hover:shadow-xl relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border shadow-xs transition-all duration-300 hover:-translate-y-1">
      {/* Bagian Atas: Gambar & Informasi Utama */}
      <div>
        {/* Kontainer Foto Produk 1:1 E-Commerce */}
        <Link
          href={`/produk/${product.id}`}
          className="bg-surface-container relative block aspect-square w-full overflow-hidden"
        >
          <FallbackImage
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            fallbackIcon="inventory_2"
          />

          {/* Badge Kategori Produk */}
          <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1">
            <span className="bg-slate-900/75 text-white/95 font-label-sm rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase shadow-xs backdrop-blur-xs">
              {categoryName}
            </span>
          </div>

          {/* Badge Terverifikasi */}
          <div className="absolute top-2.5 right-2.5">
            <span
              className="bg-primary/90 text-on-primary flex h-6 w-6 items-center justify-center rounded-full shadow-xs backdrop-blur-xs"
              title="Produk Terverifikasi Pemdes"
            >
              <Icon name="verified" className="text-xs" />
            </span>
          </div>
        </Link>

        {/* Detail Produk */}
        <div className="p-3 sm:p-3.5">
          {/* Nama Toko / UMKM */}
          {umkm && (
            <Link
              href={`/umkm/${umkm.slug}`}
              className="text-on-surface-variant hover:text-primary mb-1 flex items-center gap-1 text-[11px] font-semibold transition"
            >
              <Icon name="storefront" className="text-primary shrink-0 text-xs" />
              <span className="truncate">{umkm.name}</span>
            </Link>
          )}

          {/* Judul Produk (Line Clamp 2 Baris Presisi) */}
          <Link href={`/produk/${product.id}`}>
            <h3 className="text-on-surface group-hover:text-primary line-clamp-2 min-h-[2.25rem] text-xs font-bold leading-tight transition sm:text-sm">
              {product.name}
            </h3>
          </Link>

          {/* Harga Produk */}
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-primary font-headline-md text-sm font-extrabold tracking-tight sm:text-base">
              {formatRupiah(product.price)}
            </span>
          </div>

          {/* Lokasi Dusun / Desa */}
          <div className="text-on-surface-variant/75 mt-1.5 flex items-center gap-1 text-[11px]">
            <Icon name="location_on" className="shrink-0 text-xs text-slate-400" />
            <span className="truncate">
              {umkm?.address || "Desa Pringgodani"}
            </span>
          </div>
        </div>
      </div>

      {/* Bagian Bawah: Aksi Beli / Pesan WhatsApp */}
      <div className="border-outline-variant/15 bg-surface/40 border-t p-2.5 sm:p-3">
        {waUrl ? (
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#25D366] hover:bg-[#20BD5A] text-white flex w-full items-center justify-center gap-1.5 rounded-xl py-2 text-center text-xs font-bold shadow-xs transition-all active:scale-98"
          >
            <Icon name="chat" className="text-sm" />
            <span>Pesan via WA</span>
          </a>
        ) : (
          <Link
            href={`/produk/${product.id}`}
            className="bg-primary/10 text-primary hover:bg-primary hover:text-on-primary flex w-full items-center justify-center gap-1 rounded-xl py-2 text-center text-xs font-bold transition-all"
          >
            <span>Lihat Detail</span>
            <Icon name="arrow_forward" className="text-xs" />
          </Link>
        )}
      </div>
    </article>
  );
}
