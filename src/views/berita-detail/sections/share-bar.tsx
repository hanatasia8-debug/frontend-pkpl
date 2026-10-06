"use client";

import { useState } from "react";
import { Icon } from "@/shared/ui/icon";

interface ShareBarProps {
  title: string;
  summary: string;
}

/**
 * Share controls. Uses the native Web Share sheet where the browser supports
 * it (every mobile browser) and falls back to copying the link — no real
 * social-network integration, which the brief explicitly does not ask for.
 */
export function ShareBar({ title, summary }: ShareBarProps) {
  const [feedback, setFeedback] = useState<string | null>(null);

  const flash = (message: string) => {
    setFeedback(message);
    setTimeout(() => setFeedback(null), 2500);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      flash("Tautan berita disalin.");
    } catch {
      flash("Gagal menyalin tautan.");
    }
  };

  const share = async () => {
    if (typeof navigator.share !== "function") {
      await copyLink();
      return;
    }
    try {
      await navigator.share({
        title,
        text: summary,
        url: window.location.href,
      });
    } catch {
      // The user dismissed the share sheet — not an error worth surfacing.
    }
  };

  return (
    <div className="border-outline-variant/30 mt-12 flex flex-wrap items-center justify-between gap-4 border-t pt-8">
      <div className="flex items-center gap-3">
        <span className="font-label-sm text-label-sm text-on-surface font-bold">
          Bagikan Berita:
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={share}
            aria-label="Bagikan berita"
            className="bg-surface-container hover:bg-primary-container hover:text-on-primary-container flex h-10 w-10 items-center justify-center rounded-full transition-all"
          >
            <Icon name="share" className="text-[20px]" />
          </button>
          <button
            type="button"
            onClick={copyLink}
            aria-label="Salin tautan berita"
            className="bg-surface-container hover:bg-secondary-container hover:text-on-secondary-container flex h-10 w-10 items-center justify-center rounded-full transition-all"
          >
            <Icon name="link" className="text-[20px]" />
          </button>
        </div>
      </div>

      <span
        role="status"
        className="font-label-sm text-label-sm text-on-surface-variant"
      >
        {feedback}
      </span>
    </div>
  );
}
