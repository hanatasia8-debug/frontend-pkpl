/**
 * Loading skeleton for the UMKM directory grid (2-column grid).
 */
export function UmkmGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div
      className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-2 md:gap-6"
      aria-busy="true"
      aria-label="Memuat daftar UMKM"
    >
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          className="border-outline-variant/30 bg-surface-container-lowest overflow-hidden rounded-2xl border"
        >
          <div className="bg-surface-container h-52 w-full animate-pulse" />
          <div className="space-y-3 p-5">
            <div className="bg-surface-container h-6 w-3/4 animate-pulse rounded" />
            <div className="bg-surface-container h-4 w-full animate-pulse rounded" />
            <div className="bg-surface-container h-4 w-5/6 animate-pulse rounded" />
            <div className="border-outline-variant/20 flex items-center justify-between border-t pt-4">
              <div className="bg-surface-container h-4 w-28 animate-pulse rounded" />
              <div className="bg-surface-container h-4 w-20 animate-pulse rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
