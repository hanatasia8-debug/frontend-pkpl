import Link from "next/link";
import { FallbackImage } from "@/shared/ui/fallback-image";
import { Icon } from "@/shared/ui/icon";
import type { NewsDetailDto } from "@/entities/berita/model/types";

export function ArticleBody({ news }: { news: NewsDetailDto }) {
  const coverUrl = news.coverUrl || news.coverImage;

  return (
    <>
      <figure className="mb-12">
        <div className="mb-4 aspect-[16/9] overflow-hidden rounded-2xl shadow-lg">
          <FallbackImage
            src={coverUrl}
            alt={news.coverCaption || news.title}
            className="h-full w-full object-cover"
            fallbackIcon="newspaper"
          />
        </div>
        {news.coverCaption && (
          <figcaption className="font-label-sm text-label-sm text-on-surface-variant text-center italic">
            {news.coverCaption}
          </figcaption>
        )}
      </figure>

      {/* Article Text Blocks */}
      <div className="max-w-none space-y-6">
        {(!news.contentSections || news.contentSections.length === 0) ? (
          <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
            {news.excerpt || news.summary}
          </p>
        ) : (
          news.contentSections.map((section, index) => {
            const title = section.title || section.sectionTitle;
            const paragraph = section.body || section.paragraph;
            const image = section.imageUrl || section.sectionImage;
            const caption = section.imageCaption;

            return (
              <section key={index} className="space-y-4">
                {title && (
                  <h2 className="font-headline-md text-headline-md text-primary mt-8 mb-3 font-bold">
                    {title}
                  </h2>
                )}
                {paragraph && (
                  <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
                    {paragraph}
                  </p>
                )}
                {image && (
                  <figure className="my-6 overflow-hidden rounded-2xl">
                    <FallbackImage
                      src={image}
                      alt={caption || title || news.title}
                      className="h-auto max-h-[500px] w-full object-cover"
                      fallbackIcon="image"
                    />
                    {caption && (
                      <figcaption className="font-label-sm text-on-surface-variant mt-2 text-center text-xs italic">
                        {caption}
                      </figcaption>
                    )}
                  </figure>
                )}
              </section>
            );
          })
        )}
      </div>

      {/* Gallery Images (if Galeri Foto) */}
      {news.galleryImages && news.galleryImages.length > 0 && (
        <section className="mt-12 space-y-6 border-t border-outline-variant/30 pt-8">
          <h2 className="font-headline-md text-primary flex items-center gap-2 text-xl font-bold">
            <Icon name="photo_library" className="text-2xl" />
            Galeri Foto Liputan
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {news.galleryImages.map((img, idx) => (
              <figure key={idx} className="overflow-hidden rounded-2xl border border-outline-variant/20 bg-surface-container shadow-sm">
                <div className="aspect-[4/3] w-full overflow-hidden">
                  <FallbackImage
                    src={img.imageUrl}
                    alt={img.caption || `Foto ${idx + 1}`}
                    className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>
                {img.caption && (
                  <figcaption className="p-3 text-xs text-on-surface-variant">
                    {img.caption}
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        </section>
      )}

      {/* Tagged Businesses (UMKM & Produk Terkait) */}
      {((news.taggedUmkms && news.taggedUmkms.length > 0) || (news.taggedProducts && news.taggedProducts.length > 0)) && (
        <section className="mt-12 space-y-4 rounded-3xl border border-primary/20 bg-primary/[0.03] p-6 sm:p-8">
          <h3 className="font-headline-md text-primary flex items-center gap-2 text-lg font-bold">
            <Icon name="storefront" className="text-xl" />
            UMKM & Produk Terkait Liputan Ini
          </h3>
          
          {news.taggedUmkms && news.taggedUmkms.length > 0 && (
            <div className="grid gap-3 sm:grid-cols-2">
              {news.taggedUmkms.map((u) => (
                <Link
                  key={u.id}
                  href={`/umkm/${u.slug}`}
                  className="flex items-center gap-3 rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-3.5 shadow-sm transition hover:border-primary hover:shadow-md"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon name="store" className="text-xl" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="truncate text-sm font-bold text-on-surface">{u.name}</h4>
                    {u.address && <p className="truncate text-xs text-on-surface-variant">{u.address}</p>}
                  </div>
                  <Icon name="chevron_right" className="text-sm text-primary" />
                </Link>
              ))}
            </div>
          )}
        </section>
      )}
      {/* Rujukan Informasi & Portal Resmi Pemerintah Desa (SEO In-Content Citation) */}
      <section className="mt-10 rounded-2xl border border-outline-variant/30 bg-surface-container-low/60 p-5 sm:p-6 text-xs sm:text-sm text-on-surface-variant flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="bg-primary/10 text-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-xl">
            <Icon name="verified" className="text-base" />
          </div>
          <div>
            <p className="font-semibold text-on-surface">
              Sumber Resmi Pemerintah Desa Pringgodani
            </p>
            <p className="text-xs text-on-surface-variant/80 mt-0.5">
              Kabar, regulasi kebijakan, dan layanan administrasi kependudukan resmi.
            </p>
          </div>
        </div>
        <a
          href="https://pringgodani-malangkab.desa.id"
          target="_blank"
          rel="noopener"
          className="inline-flex items-center gap-1.5 font-bold text-primary hover:underline shrink-0"
          title="Website Resmi Pemerintah Desa Pringgodani"
        >
          <span>pringgodani-malangkab.desa.id</span>
          <Icon name="arrow_outward" className="text-xs" />
        </a>
      </section>
    </>
  );
}

