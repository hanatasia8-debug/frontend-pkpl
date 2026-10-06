/**
 * Route-level loading UI for /profil. Also covers /profil/sejarah, since a
 * `loading.tsx` wraps every nested segment — that's fine here (unlike the
 * list+detail pairs) because sejarah is a plain static page with no
 * `notFound()` call whose status code could be affected. See
 * `berita/(list)/loading.tsx` for that caveat where it does matter.
 */
export default function Loading() {
  return (
    <div className="pb-section-padding animate-pulse pt-24">
      <div className="bg-surface-container-high py-24">
        <div className="max-w-container-max px-gutter mx-auto max-w-3xl space-y-4 text-center">
          <div className="bg-surface-container mx-auto h-10 w-2/3 rounded" />
          <div className="bg-surface-container mx-auto h-4 w-full rounded" />
          <div className="bg-surface-container mx-auto h-4 w-1/2 rounded" />
        </div>
      </div>

      <div className="max-w-container-max px-gutter mx-auto mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-surface-container-lowest border-outline-variant/20 space-y-3 rounded-3xl border p-5"
          >
            <div className="bg-surface-container mx-auto h-12 w-12 rounded-2xl" />
            <div className="bg-surface-container mx-auto h-6 w-12 rounded" />
            <div className="bg-surface-container mx-auto h-3 w-16 rounded" />
          </div>
        ))}
      </div>

      <div className="max-w-container-max px-gutter mx-auto mt-16">
        <div className="bg-surface-container mb-6 h-7 w-56 rounded" />
        <div className="flex gap-5 overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-surface-container h-[340px] w-[280px] shrink-0 rounded-[2rem]"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
