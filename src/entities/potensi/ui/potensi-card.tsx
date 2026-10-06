import Link from "next/link";

import { Icon } from "@/shared/ui/icon";
import { FallbackImage } from "@/shared/ui/fallback-image";
import { getPotensiCategoryMeta } from "@/entities/potensi/model/category-meta";
import type { PotensiListItemDto } from "../model/types";

interface PotensiCardProps {
  item: PotensiListItemDto;
}

export function PotensiCard({ item }: PotensiCardProps) {
  const categoryMeta = getPotensiCategoryMeta(item.category);

  return (
    <article className="potential-card group border-outline-variant/30 bg-surface flex flex-col overflow-hidden rounded-[2rem] border shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <Link
        href={`/potensi/${item.slug}`}
        className="relative block h-64 overflow-hidden"
      >
        <FallbackImage
          src={item.coverImage}
          alt={item.title}
          className="card-image h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          fallbackIcon="landscape"
        />
        <div className="bg-primary-fixed text-on-primary-fixed-variant absolute top-4 left-4 rounded-full px-4 py-2 text-sm font-semibold tracking-[0.18em] uppercase shadow-sm">
          {categoryMeta.label}
        </div>
      </Link>

      <div className="flex flex-col gap-6 p-6">
        <Link
          href={`/potensi/${item.slug}`}
          className="hover:text-secondary transition-colors"
        >
          <h3 className="font-headline-md text-headline-md text-primary">
            {item.title}
          </h3>
        </Link>
        <p className="font-body-base text-body-base text-on-surface-variant line-clamp-3">
          {item.overview}
        </p>
        <div className="mt-auto flex items-center justify-between gap-4">
          <span className="bg-surface-container text-on-surface-variant inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium">
            <Icon name="verified" className="text-primary text-base" />
            Terverifikasi
          </span>
          <Link
            href={`/potensi/${item.slug}`}
            className="text-primary inline-flex items-center gap-2 font-semibold hover:underline"
          >
            Selengkapnya
            <Icon name="chevron_right" className="text-base" />
          </Link>
        </div>
      </div>
    </article>
  );
}
