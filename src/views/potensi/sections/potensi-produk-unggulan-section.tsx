import Link from "next/link";
import { FallbackImage } from "@/shared/ui/fallback-image";
import { formatRupiah } from "@/shared/utils/format-currency";
import type { PotensiFeaturedProductDto } from "@/entities/potensi/model/types";

export function PotensiProdukUnggulanSection({
  products,
}: {
  products: PotensiFeaturedProductDto[];
}) {
  return (
    <section>
      <h2 className="font-headline-lg text-headline-lg text-primary border-primary relative mb-8 pb-3">
        Produk Unggulan
        <span className="bg-primary-container absolute bottom-0 left-0 h-[3px] w-12" />
      </h2>

      {products.length === 0 ? (
        <p className="font-body-base text-body-base text-on-surface-variant border-outline-variant/30 bg-surface-container-low rounded-lg border border-dashed px-6 py-10 text-center">
          Belum ada produk unggulan dari UMKM di ekosistem potensi ini.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/umkm/${product.umkmSlug}`}
              className="group block"
            >
              <div className="border-outline-variant/20 mb-3 aspect-square overflow-hidden rounded-2xl border">
                <FallbackImage
                  src={product.productPhoto}
                  alt={product.productName}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  fallbackIcon="inventory_2"
                />
              </div>
              <h5 className="text-primary font-bold">{product.productName}</h5>
              <p className="text-label-sm text-outline">
                {formatRupiah(product.price)}
              </p>
              <p className="text-on-surface-variant text-xs">
                {product.umkmName}
              </p>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
