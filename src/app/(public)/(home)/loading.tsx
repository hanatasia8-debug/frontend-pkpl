/**
 * Route-level loading UI for `/` — previously this route had none, so
 * Next.js held the whole navigation on a blank/previous screen until every
 * `Promise.allSettled` call in `HomePage` (profile+stats, latest UMKM,
 * latest berita, map facilities) resolved server-side. Navigating here from
 * another page felt noticeably slower than /umkm or /berita, which already
 * stream a skeleton immediately — this file closes that gap. See
 * `berita/(list)/loading.tsx` for the pattern this follows.
 */
export default function Loading() {
  return (
    <div className="animate-pulse">
      {/* Hero */}
      <div className="bg-surface-container-high relative flex h-screen w-full items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="bg-surface-container mx-auto h-10 w-80 max-w-[80vw] rounded" />
          <div className="bg-surface-container mx-auto h-5 w-56 max-w-[60vw] rounded" />
        </div>
      </div>

      {/* Welcome section */}
      <div className="max-w-container-max px-gutter py-section-padding mx-auto grid grid-cols-1 items-center gap-10 md:grid-cols-2">
        <div className="bg-surface-container aspect-[4/3] w-full rounded-2xl" />
        <div className="space-y-4">
          <div className="bg-surface-container h-8 w-2/3 rounded" />
          <div className="bg-surface-container h-4 w-full rounded" />
          <div className="bg-surface-container h-4 w-full rounded" />
          <div className="bg-surface-container h-4 w-3/4 rounded" />
        </div>
      </div>

      {/* Stats strip */}
      <div className="bg-surface-container-low px-gutter py-12 md:py-16">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-4 sm:gap-8 md:gap-12">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2 text-center">
              <div className="bg-surface-container mx-auto h-10 w-16 rounded-xl" />
              <div className="bg-surface-container mx-auto h-3 w-24 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* UMKM / Berita cards preview */}
      {[0, 1].map((section) => (
        <div
          key={section}
          className="max-w-container-max px-gutter py-section-padding mx-auto"
        >
          <div className="bg-surface-container mb-6 h-7 w-56 rounded" />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="bg-surface-container aspect-[4/3] w-full rounded-xl" />
                <div className="bg-surface-container h-4 w-3/4 rounded" />
                <div className="bg-surface-container h-3 w-1/2 rounded" />
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Map preview */}
      <div className="max-w-container-max px-gutter py-section-padding mx-auto">
        <div className="bg-surface-container h-[360px] w-full rounded-2xl" />
      </div>
    </div>
  );
}
