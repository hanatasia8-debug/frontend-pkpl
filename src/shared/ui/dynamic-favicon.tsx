"use client";

import { useEffect, useState } from "react";
import {
  getStoredAdminSettings,
  subscribeStoredAdminSettings,
} from "@/entities/admin/api/admin-settings.service";
import { SettingsService } from "@/entities/settings/api/settings.service";

export function DynamicFavicon() {
  const [faviconUrl, setFaviconUrl] = useState<string>("/images/favicon.png");

  useEffect(() => {
    // 1. Initial read from local cache
    const stored = getStoredAdminSettings();
    if (stored?.favicon_url && stored.favicon_url.trim()) {
      setFaviconUrl(stored.favicon_url);
    }

    // 2. Fetch public settings to ensure sync with server
    SettingsService.getAll()
      .then((res) => {
        const s = res?.settings as Record<string, any> | undefined;
        const url = s?.favicon_url || s?.faviconUrl;
        if (url && typeof url === "string" && url.trim()) {
          setFaviconUrl(url);
        }
      })
      .catch((err) => {
        console.warn("Gagal sinkronisasi favicon dari public settings:", err);
      });

    // 3. Subscribe to changes (updates when admin changes settings)
    const unsubscribe = subscribeStoredAdminSettings(() => {
      const latest = getStoredAdminSettings();
      if (latest?.favicon_url && latest.favicon_url.trim()) {
        setFaviconUrl(latest.favicon_url);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Update favicon in document.head
  useEffect(() => {
    if (!faviconUrl || typeof document === "undefined") return;

    // Helper function to update or create link tag
    const updateLinks = (rel: string) => {
      const links = document.querySelectorAll<HTMLLinkElement>(`link[rel='${rel}']`);
      if (links.length === 0) {
        const link = document.createElement("link");
        link.rel = rel;
        link.href = faviconUrl;
        document.head.appendChild(link);
      } else {
        links.forEach((link) => {
          link.href = faviconUrl;
        });
      }
    };

    updateLinks("icon");
    updateLinks("shortcut icon");
    updateLinks("apple-touch-icon");
  }, [faviconUrl]);

  return null;
}
