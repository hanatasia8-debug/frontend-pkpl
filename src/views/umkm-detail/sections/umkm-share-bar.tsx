"use client";

import { useState } from "react";
import { Icon } from "@/shared/ui/icon";

interface UmkmShareBarProps {
  name: string;
  categoryName?: string;
  description?: string;
}

/**
 * Share controls for UMKM detail page.
 * Supports native Web Share API (mobile/modern desktop), direct WhatsApp share,
 * and clipboard copy with instant feedback.
 */
export function UmkmShareBar({
  name,
  categoryName,
  description,
}: UmkmShareBarProps) {
  const [feedback, setFeedback] = useState<string | null>(null);

  const flash = (message: string) => {
    setFeedback(message);
    setTimeout(() => setFeedback(null), 2500);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      flash("Tautan profil UMKM berhasil disalin.");
    } catch {
      flash("Gagal menyalin tautan.");
    }
  };

  const shareNative = async () => {
    const text = `${name}${categoryName ? ` (${categoryName})` : ""} - UMKM Desa Pringgodani. ${description ? description.slice(0, 100) + "..." : ""}`;
    if (typeof navigator.share !== "function") {
      await copyLink();
      return;
    }
    try {
      await navigator.share({
        title: `${name} — UMKM Desa Pringgodani`,
        text,
        url: window.location.href,
      });
    } catch {
      // User dismissed share dialog
    }
  };

  const shareWhatsApp = () => {
    const currentUrl = typeof window !== "undefined" ? window.location.href : "";
    const text = `Halo, lihat profil usaha *${name}* di Website Desa Pringgodani: ${currentUrl}`;
    window.open(
      `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <div className="border-outline-variant/20 mt-8 flex flex-wrap items-center justify-between gap-4 border-t pt-6">
      <div className="flex flex-wrap items-center gap-3">
        <span className="font-label-sm text-label-sm text-on-surface font-bold">
          Bagikan Usaha:
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={shareNative}
            aria-label="Bagikan profil UMKM"
            title="Bagikan ke aplikasi lain"
            className="bg-surface-container hover:bg-primary-container hover:text-on-primary-container text-on-surface flex h-10 w-10 items-center justify-center rounded-full transition-all active:scale-95"
          >
            <Icon name="share" className="text-[20px]" />
          </button>

          <button
            type="button"
            onClick={shareWhatsApp}
            aria-label="Bagikan via WhatsApp"
            title="Bagikan ke WhatsApp"
            className="bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white flex h-10 w-10 items-center justify-center rounded-full transition-all active:scale-95"
          >
            <Icon name="chat" className="text-[20px]" />
          </button>

          <button
            type="button"
            onClick={copyLink}
            aria-label="Salin tautan profil UMKM"
            title="Salin tautan web"
            className="bg-surface-container hover:bg-secondary-container hover:text-on-secondary-container text-on-surface flex h-10 w-10 items-center justify-center rounded-full transition-all active:scale-95"
          >
            <Icon name="link" className="text-[20px]" />
          </button>
        </div>
      </div>

      {feedback && (
        <span
          role="status"
          className="text-primary font-label-sm text-xs font-bold animate-fade-in"
        >
          ✓ {feedback}
        </span>
      )}
    </div>
  );
}
