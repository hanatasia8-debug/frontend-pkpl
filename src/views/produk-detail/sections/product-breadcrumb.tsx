import Link from "next/link";
import { Icon } from "@/shared/ui/icon";

interface ProductBreadcrumbProps {
  productName: string;
  categoryName?: string;
  categorySlug?: string;
}

export function ProductBreadcrumb({
  productName,
  categoryName,
  categorySlug,
}: ProductBreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="mb-4 sm:mb-6 flex items-center justify-between gap-2"
    >
      {/* Breadcrumb Links */}
      <ol className="text-on-surface-variant flex items-center gap-1 sm:gap-2 text-[11px] sm:text-xs font-semibold overflow-hidden">
        <li className="flex items-center gap-1 shrink-0">
          <Link
            href="/"
            className="hover:text-primary transition-colors flex items-center gap-1"
          >
            <Icon name="home" className="text-xs" />
            <span className="hidden xs:inline">Beranda</span>
          </Link>
        </li>

        <li className="text-outline-variant/60 flex items-center shrink-0" aria-hidden="true">
          <Icon name="chevron_right" className="text-xs" />
        </li>

        <li className="flex items-center shrink-0">
          <Link
            href="/produk"
            className="hover:text-primary transition-colors"
          >
            Produk
          </Link>
        </li>

        {categoryName && (
          <>
            <li className="text-outline-variant/60 flex items-center shrink-0" aria-hidden="true">
              <Icon name="chevron_right" className="text-xs" />
            </li>
            <li className="flex items-center shrink-0 max-w-[90px] xs:max-w-[140px] sm:max-w-[200px] truncate">
              <Link
                href={categorySlug ? `/produk?category=${categorySlug}` : "/produk"}
                className="hover:text-primary transition-colors truncate"
              >
                {categoryName}
              </Link>
            </li>
          </>
        )}

        <li className="text-outline-variant/60 flex items-center shrink-0" aria-hidden="true">
          <Icon name="chevron_right" className="text-xs" />
        </li>

        <li aria-current="page" className="max-w-[100px] xs:max-w-[160px] sm:max-w-[260px] md:max-w-[360px] truncate shrink">
          <span className="text-primary font-bold truncate">{productName}</span>
        </li>
      </ol>

      {/* Quick Back Button on Top Right */}
      <Link
        href="/produk"
        className="text-on-surface-variant hover:text-primary bg-surface-container-low hover:bg-surface-container border-outline-variant/30 inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] sm:text-xs font-semibold transition-all shrink-0"
      >
        <Icon name="arrow_back" className="text-xs" />
        <span>Katalog</span>
      </Link>
    </nav>
  );
}
