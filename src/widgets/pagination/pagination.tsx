import Link from "next/link";
import { Icon } from "@/shared/ui/icon";
import { cn } from "@/shared/utils/cn";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  /** Builds the href for a page number, preserving the caller's other query params. */
  buildHref: (page: number) => string;
}

const MAX_VISIBLE_PAGES = 5;

/**
 * Page numbers to render. Short page counts are listed in full (the prototype
 * shows "1 2 3"); longer ones collapse to a window around the current page
 * with `null` marking an ellipsis gap.
 */
function buildPageWindow(
  currentPage: number,
  totalPages: number,
): (number | null)[] {
  if (totalPages <= MAX_VISIBLE_PAGES + 2) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const half = Math.floor(MAX_VISIBLE_PAGES / 2);
  const start = Math.max(
    2,
    Math.min(currentPage - half, totalPages - MAX_VISIBLE_PAGES),
  );
  const end = Math.min(totalPages - 1, start + MAX_VISIBLE_PAGES - 1);

  return [
    1,
    ...(start > 2 ? [null] : []),
    ...Array.from({ length: end - start + 1 }, (_, i) => start + i),
    ...(end < totalPages - 1 ? [null] : []),
    totalPages,
  ];
}

/**
 * Shared, link-based pagination (widget layer — reused by /berita now and the
 * other listing pages later). Links rather than buttons so each page has a
 * shareable URL and works without JavaScript; Next.js still navigates
 * client-side, so there is no full page reload.
 */
export function Pagination({
  currentPage,
  totalPages,
  buildHref,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;
  const arrowClass =
    "border-outline-variant text-on-surface-variant hover:bg-surface-container flex h-10 w-10 items-center justify-center rounded-lg border transition-colors";

  return (
    <nav
      className="mt-16 flex items-center justify-center gap-4"
      aria-label="Navigasi halaman berita"
    >
      {hasPrev ? (
        <Link
          href={buildHref(currentPage - 1)}
          className={arrowClass}
          aria-label="Halaman sebelumnya"
          scroll
        >
          <Icon name="chevron_left" />
        </Link>
      ) : (
        <span
          className={cn(arrowClass, "cursor-not-allowed opacity-30")}
          aria-disabled="true"
        >
          <Icon name="chevron_left" />
        </span>
      )}

      <div className="flex gap-2">
        {buildPageWindow(currentPage, totalPages).map((page, index) =>
          page === null ? (
            <span
              key={`gap-${index}`}
              className="text-on-surface-variant flex h-10 w-10 items-center justify-center"
            >
              …
            </span>
          ) : (
            <Link
              key={page}
              href={buildHref(page)}
              aria-current={page === currentPage ? "page" : undefined}
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
                page === currentPage
                  ? "bg-primary text-on-primary font-bold"
                  : "border-outline-variant text-on-surface-variant hover:bg-surface-container border bg-white",
              )}
            >
              {page}
            </Link>
          ),
        )}
      </div>

      {hasNext ? (
        <Link
          href={buildHref(currentPage + 1)}
          className={arrowClass}
          aria-label="Halaman berikutnya"
          scroll
        >
          <Icon name="chevron_right" />
        </Link>
      ) : (
        <span
          className={cn(arrowClass, "cursor-not-allowed opacity-30")}
          aria-disabled="true"
        >
          <Icon name="chevron_right" />
        </span>
      )}
    </nav>
  );
}
