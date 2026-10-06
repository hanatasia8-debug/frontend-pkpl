/**
 * Loading skeleton for the news grid — required by the brief for every
 * data-driven flow (loading / empty / error). Shown by the Suspense boundary
 * in `berita-list-page.tsx` on first load and on every search/filter/page
 * change.
 */
export function NewsGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div
      className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-2 md:gap-6"
      aria-busy="true"
      aria-label="Memuat berita"
    >
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          className="border-outline-variant/30 bg-surface-container-lowest overflow-hidden rounded-2xl border"
        >
          <div className="bg-surface-container h-56 w-full animate-pulse" />
          <div className="space-y-3 p-6">
            <div className="bg-surface-container h-4 w-28 animate-pulse rounded" />
            <div className="bg-surface-container h-6 w-full animate-pulse rounded" />
            <div className="bg-surface-container h-6 w-3/4 animate-pulse rounded" />
            <div className="bg-surface-container h-4 w-full animate-pulse rounded" />
            <div className="bg-surface-container h-4 w-5/6 animate-pulse rounded" />
            <div className="border-outline-variant/20 flex items-center justify-between border-t pt-4">
              <div className="bg-surface-container h-4 w-24 animate-pulse rounded" />
              <div className="bg-surface-container h-4 w-20 animate-pulse rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
