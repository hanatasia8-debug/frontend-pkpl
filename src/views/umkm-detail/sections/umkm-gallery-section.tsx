import { FallbackImage } from "@/shared/ui/fallback-image";
import { cn } from "@/shared/utils/cn";

/**
 * Bento layout of the prototype's "Galeri Produk & Usaha": the first image is
 * a 2×2 feature tile, then two single tiles, then a wide one — repeating for
 * longer galleries so any number of images stays balanced.
 */
const BENTO_SPANS = ["md:col-span-2 md:row-span-2", "", "", "md:col-span-2"];

interface UmkmGallerySectionProps {
  images: string[];
  umkmName: string;
}

export function UmkmGallerySection({
  images,
  umkmName,
}: UmkmGallerySectionProps) {
  // `Umkm.gallery` may legitimately be empty (nothing uploaded yet) — the
  // section then disappears rather than showing an empty frame.
  if (images.length === 0) return null;

  return (
    <section className="mt-16 mb-20">
      <h2 className="font-headline-lg text-headline-lg text-primary mb-8">
        Galeri Produk &amp; Usaha
      </h2>
      <div className="grid auto-rows-[240px] grid-cols-1 gap-4 md:grid-cols-4">
        {images.map((image, index) => (
          <div
            key={`${image}-${index}`}
            className={cn(
              "scroll-reveal overflow-hidden rounded-xl shadow-sm",
              BENTO_SPANS[index % BENTO_SPANS.length],
            )}
          >
            <FallbackImage
              src={image}
              alt={`Galeri ${umkmName} ${index + 1}`}
              className="h-full w-full object-cover"
              fallbackIcon="image"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
