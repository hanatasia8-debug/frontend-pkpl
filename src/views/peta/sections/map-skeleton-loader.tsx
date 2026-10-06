"use client";

import { Icon } from "@/shared/ui/icon";

export function MapSkeletonLoader() {
  return (
    <div className="bg-surface-container-low relative h-full w-full overflow-hidden">
      {/* Animated Topography Grid Background */}
      <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] opacity-60" />

      {/* Pulsing Sonar Ring & Center Marker Pin Placeholder */}
      <div className="absolute top-1/2 left-1/2 z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-3">
        <div className="relative flex h-20 w-20 items-center justify-center">
          <div className="bg-primary/20 absolute inset-0 animate-ping rounded-full" />
          <div className="bg-primary/10 absolute inset-2 animate-pulse rounded-full" />
          <div className="bg-primary text-on-primary relative flex h-12 w-12 items-center justify-center rounded-full shadow-2xl">
            <Icon name="map" className="animate-bounce text-2xl" />
          </div>
        </div>
        <div className="glass-panel border-outline-variant/30 flex items-center gap-2.5 rounded-full border px-4 py-2 shadow-lg backdrop-blur-md">
          <div className="bg-primary h-2 w-2 animate-ping rounded-full" />
          <span className="font-label-sm text-primary text-xs font-bold tracking-wide">
            Memuat Peta Desa Pringgodani...
          </span>
        </div>
      </div>

      {/* Floating Pin Marker Placeholders on Map Grid */}
      <div className="absolute top-1/4 left-1/3 flex animate-pulse items-center gap-1.5 rounded-full bg-white/80 px-3 py-1 text-xs shadow-md backdrop-blur-sm">
        <div className="h-2 w-2 rounded-full bg-blue-600" />
        <div className="h-3 w-16 rounded bg-slate-200 animate-pulse" />
      </div>

      <div className="absolute top-1/3 right-1/4 flex animate-pulse items-center gap-1.5 rounded-full bg-white/80 px-3 py-1 text-xs shadow-md backdrop-blur-sm">
        <div className="h-2 w-2 rounded-full bg-emerald-600" />
        <div className="h-3 w-20 rounded bg-slate-200 animate-pulse" />
      </div>

      <div className="absolute bottom-1/3 left-1/4 flex animate-pulse items-center gap-1.5 rounded-full bg-white/80 px-3 py-1 text-xs shadow-md backdrop-blur-sm">
        <div className="h-2 w-2 rounded-full bg-amber-600" />
        <div className="h-3 w-24 rounded bg-slate-200 animate-pulse" />
      </div>

      {/* Skeleton Top Search / Controls Bar */}
      <div className="absolute top-4 right-4 z-10 hidden md:block">
        <div className="h-10 w-64 animate-pulse rounded-full bg-white/80 shadow-md backdrop-blur-sm" />
      </div>

      {/* Skeleton Filter Category Chips (Top Left) */}
      <div className="absolute top-4 left-4 z-10 hidden flex-col gap-2 md:flex">
        <div className="h-8 w-44 animate-pulse rounded-2xl bg-white/80 shadow-md backdrop-blur-sm" />
      </div>

      {/* Skeleton Bottom Zoom Controls Placeholder (Bottom Left) */}
      <div className="absolute bottom-6 left-6 z-10 flex flex-col gap-2">
        <div className="h-10 w-10 animate-pulse rounded-full bg-white/80 shadow-md backdrop-blur-sm" />
        <div className="h-10 w-10 animate-pulse rounded-full bg-white/80 shadow-md backdrop-blur-sm" />
      </div>
    </div>
  );
}
