"use client";

import { Icon } from "@/shared/ui/icon";

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onMyLocation: () => void;
}

export function MapControls({
  onZoomIn,
  onZoomOut,
  onMyLocation,
}: MapControlsProps) {
  return (
    <div className="glass-panel border-outline-variant/30 absolute bottom-6 left-6 z-20 flex flex-col gap-1 rounded-2xl border p-1.5 shadow-xl">
      <button
        onClick={onZoomIn}
        className="hover:bg-surface-container text-on-surface flex h-10 w-10 items-center justify-center rounded-xl transition-colors"
        title="Perbesar (Zoom In)"
      >
        <Icon name="add" className="text-xl font-bold" />
      </button>
      <div className="bg-outline-variant/30 mx-2 h-[1px]" />
      <button
        onClick={onZoomOut}
        className="hover:bg-surface-container text-on-surface flex h-10 w-10 items-center justify-center rounded-xl transition-colors"
        title="Perkecil (Zoom Out)"
      >
        <Icon name="remove" className="text-xl font-bold" />
      </button>
      <div className="bg-outline-variant/30 mx-2 h-[1px]" />
      <button
        onClick={onMyLocation}
        className="hover:bg-surface-container text-primary flex h-10 w-10 items-center justify-center rounded-xl transition-colors"
        title="Lokasi Saya"
      >
        <Icon name="my_location" className="text-xl font-bold" />
      </button>
    </div>
  );
}
