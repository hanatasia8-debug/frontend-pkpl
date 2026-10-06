/**
 * Route-level loading UI for /potensi — see `berita/(list)/loading.tsx` for
 * why this must live inside a `(list)` route group rather than directly at
 * `potensi/loading.tsx` (it would otherwise also wrap `potensi/[slug]` and
 * break that route's 404 status code on an unknown slug).
 */
export default function Loading() {
  return (
    <div className="pb-section-padding animate-pulse pt-24">
      <div className="bg-surface-container-high py-24">
        <div className="max-w-container-max px-gutter mx-auto max-w-3xl space-y-4">
          <div className="bg-surface-container h-7 w-40 rounded-full" />
          <div className="bg-surface-container h-10 w-full max-w-xl rounded" />
          <div className="bg-surface-container h-4 w-full rounded" />
          <div className="bg-surface-container h-4 w-2/3 rounded" />
        </div>
      </div>
      <div className="max-w-container-max px-gutter mx-auto mt-10 mb-6 flex gap-3 overflow-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-surface-container h-11 w-32 shrink-0 rounded-full"
          />
        ))}
      </div>
      <div className="max-w-container-max px-gutter mx-auto grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <div className="bg-surface-container aspect-[4/3] w-full rounded-xl" />
            <div className="bg-surface-container h-4 w-3/4 rounded" />
            <div className="bg-surface-container h-3 w-1/2 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
