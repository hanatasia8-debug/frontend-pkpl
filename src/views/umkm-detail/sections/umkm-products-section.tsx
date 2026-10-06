import { FallbackImage } from "@/shared/ui/fallback-image";
import { Icon } from "@/shared/ui/icon";
import { formatRupiah } from "@/shared/utils/format-currency";
import { createWhatsappUrl } from "@/entities/umkm/model/whatsapp-link";
import type { UmkmProductDto } from "@/entities/umkm/model/types";

export function UmkmProductsSection({
  products,
  umkmName,
  phone,
}: {
  products: UmkmProductDto[];
  umkmName?: string;
  phone?: string;
}) {
  return (
    <section>
      <div className="border-outline-variant/30 mb-6 flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-2.5">
          <div className="bg-primary/10 text-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-xl">
            <Icon name="shopping_bag" className="text-base" />
          </div>
          <h2 className="font-headline-md text-primary text-lg font-bold sm:text-xl">
            Katalog Produk Unggulan
          </h2>
        </div>
        <span className="bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-bold">
          {products.length} Produk
        </span>
      </div>

      {products.length === 0 ? (
        <div className="border-outline-variant/30 bg-surface-container-low/50 rounded-2xl border border-dashed p-8 text-center sm:p-12">
          <div className="bg-primary/10 text-primary mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl">
            <Icon name="inventory_2" className="text-2xl" />
          </div>
          <h3 className="font-headline-md text-on-surface text-base font-bold">
            Belum Ada Produk Terdaftar
          </h3>
          <p className="text-on-surface-variant/80 mx-auto mt-1.5 max-w-md text-xs leading-relaxed sm:text-sm">
            Pelaku usaha belum menambahkan daftar produk secara spesifik. Hubungi
            langsung melalui WhatsApp untuk menanyakan katalog lengkap produk.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-2 md:gap-5">
          {products.map((product) => {
            const name = product.name || product.productName || "Produk UMKM";
            const photo = product.imageUrl || product.productPhoto;
            const waMessage = phone
              ? createWhatsappUrl(
                  phone,
                  `Halo ${umkmName || "Penjual"}, saya melihat produk "${name}" di katalog Lokal Pringgodani dan tertarik untuk memesan. Apakah produk ini tersedia?`,
                )
              : null;

            return (
              <article
                key={product.id}
                className="group bg-surface-container-lowest border-outline-variant/30 hover:border-primary/40 relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div>
                  <div className="bg-surface-container relative aspect-[4/3] w-full overflow-hidden">
                    <FallbackImage
                      src={photo}
                      alt={name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      fallbackIcon="inventory_2"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                  </div>

                  <div className="p-4">
                    <h3 className="font-headline-md text-on-surface group-hover:text-primary line-clamp-2 text-sm font-bold leading-snug transition sm:text-base">
                      {name}
                    </h3>
                    {product.description && (
                      <p className="text-on-surface-variant/80 mt-1.5 line-clamp-2 text-xs leading-relaxed">
                        {product.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="border-outline-variant/20 bg-surface/30 mt-auto flex items-center justify-between gap-3 border-t p-4">
                  <div className="min-w-0">
                    <p className="text-on-surface-variant/70 text-[10px] font-bold tracking-wider uppercase">
                      Harga
                    </p>
                    <p className="font-headline-md text-primary truncate text-sm font-extrabold sm:text-base">
                      {formatRupiah(product.price)}
                    </p>
                  </div>

                  {waMessage && (
                    <a
                      href={waMessage}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Pesan ${name} via WhatsApp`}
                      className="bg-[#25D366] hover:bg-[#20BD5A] text-white inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold shadow-xs transition-all duration-200 hover:shadow-md active:scale-95"
                    >
                      <Icon name="chat" className="text-sm" />
                      <span>Pesan</span>
                    </a>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
