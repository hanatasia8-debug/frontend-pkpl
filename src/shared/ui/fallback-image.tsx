"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/shared/ui/icon";
import { cn } from "@/shared/utils/cn";
import { resolveImageUrl } from "@/shared/utils/resolve-image-url";

interface FallbackImageProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  /** Material Symbols icon shown in the empty-state placeholder. */
  fallbackIcon?: string;
}

/**
 * Renders an image with a graceful empty-state fallback (icon on a muted
 * surface) when `src` is missing or fails to load — needed everywhere
 * right now since seed data and freshly-submitted content reference
 * storage keys that may not have a real uploaded file behind them yet.
 * Required by the brief's "empty state" pattern for every data-driven view.
 */
export function FallbackImage({
  src,
  alt,
  className,
  fallbackIcon = "image",
}: FallbackImageProps) {
  const resolvedUrl = resolveImageUrl(src);
  const [failed, setFailed] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);

  // The <img> is server-rendered, so a request that already failed before
  // React hydrated never fires `onError` — the visitor was left with the
  // browser's broken-image glyph instead of the placeholder. Re-check the
  // "finished loading but has no pixels" state once on mount.
  useEffect(() => {
    const image = imageRef.current;
    if (image?.complete && image.naturalWidth === 0) setFailed(true);
  }, [resolvedUrl]);

  if (!resolvedUrl || failed) {
    return (
      <div
        className={cn(
          "bg-surface-container flex items-center justify-center",
          className,
        )}
        role="img"
        aria-label={alt}
      >
        <Icon name={fallbackIcon} className="text-outline-variant text-4xl" />
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- storage domain is dynamic per Supabase project; plain <img> avoids next/image remotePatterns config.
    <img
      ref={imageRef}
      src={resolvedUrl}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}
