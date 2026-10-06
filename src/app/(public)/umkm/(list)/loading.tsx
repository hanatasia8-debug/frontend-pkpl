import { UmkmGridSkeleton } from "@/views/umkm-list/ui/umkm-grid-skeleton";

/**
 * Route-level loading UI for /umkm — covers the first paint (header + filter
 * bar + grid) before any data has resolved. Subsequent search/filter/page
 * changes are covered by the Suspense boundary around the grid itself.
 *
 * IMPORTANT — this file must stay inside the `(list)` route group: a
 * `loading.tsx` creates a Suspense boundary for its segment *and every nested
 * segment*, so at `umkm/loading.tsx` it would also wrap `umkm/[slug]` and make
 * the response start streaming before the detail view can call `notFound()`
 * — an unknown slug would then render the 404 UI with an HTTP **200**. Same
 * finding as /berita (see `berita/(list)/loading.tsx`).
 */
export default function Loading() {
  return (
    <div className="pb-section-padding pt-24">
      <div className="max-w-container-max px-gutter mb-stack-lg mx-auto">
        <div className="bg-surface-container mb-4 h-10 w-2/3 animate-pulse rounded" />
        <div className="bg-surface-container h-6 w-full max-w-2xl animate-pulse rounded" />
        <div className="bg-surface-container-low border-outline-variant/30 mt-stack-lg h-[76px] w-full animate-pulse rounded-xl border" />
      </div>
      <div className="max-w-container-max px-gutter mx-auto">
        <UmkmGridSkeleton />
      </div>
    </div>
  );
}
