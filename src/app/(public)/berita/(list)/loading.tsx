import { NewsGridSkeleton } from "@/views/berita-list/ui/news-grid-skeleton";

/**
 * Route-level loading UI for /berita — covers the first paint (hero + filter
 * bar + grid) before any data has resolved. Subsequent search/filter/page
 * changes are covered by the Suspense boundary around the grid itself.
 *
 * IMPORTANT — why this file lives inside the `(list)` route group:
 * `loading.tsx` creates a Suspense boundary for its segment *and every nested
 * segment*. Placed directly at `berita/loading.tsx` it also wrapped
 * `berita/[slug]`, which made the response start streaming before the detail
 * view could call `notFound()` — so an unknown slug rendered the 404 UI with
 * an HTTP **200** status (Next.js cannot change the status once headers have
 * been sent — see `loading.md` §"Status Codes" in `next/dist/docs`). The route
 * group keeps this boundary on the listing route only, so
 * `/berita/<slug-tidak-ada>` answers with a real 404. Verified both ways with
 * `npm run build && npm run start`; keep this structure for the other
 * list+detail pairs (UMKM, Potensi).
 */
export default function Loading() {
  return (
    <div className="pb-section-padding pt-24">
      <div className="max-w-container-max px-gutter mx-auto mb-16">
        <div className="bg-surface-container h-[500px] w-full animate-pulse rounded-xl" />
      </div>
      <div className="max-w-container-max px-gutter mx-auto mb-12">
        <div className="bg-surface-container-low border-outline-variant/30 h-[92px] w-full animate-pulse rounded-xl border" />
      </div>
      <div className="max-w-container-max px-gutter mx-auto">
        <NewsGridSkeleton />
      </div>
    </div>
  );
}
