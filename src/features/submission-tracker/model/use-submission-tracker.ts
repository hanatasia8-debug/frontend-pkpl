"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { apiClient, IS_API_CONNECTED } from "@/shared/api/axios-instance";

export interface PendingItemState {
  id: string;
  title: string;
  type: "UMKM" | "NEWS";
  status: string;
  createdAt: string;
}

export function usePendingSubmissions(type: "UMKM" | "NEWS") {
  const [items, setItems] = useState<PendingItemState[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPending = useCallback(() => {
    return apiClient
      .get("/public/submissions/pending", { params: { type, limit: 5 } })
      .then(({ data }) => {
        setItems(Array.isArray(data?.data?.items) ? data.data.items : []);
      })
      .catch((e) => {
        console.warn("Gagal mengambil daftar pending publik dari API:", e);
        setItems([]);
      });
  }, [type]);

  useEffect(() => {
    let cancelled = false;

    fetchPending().then(() => {
      if (!cancelled) setIsLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [fetchPending]);

  const refreshPending = useCallback(() => {
    setIsLoading(true);
    return fetchPending().then(() => setIsLoading(false));
  }, [fetchPending]);

  return {
    items,
    isLoading,
    refreshPending,
  };
}

export interface PendingSubmissionState {
  id: string;
  title: string;
  type: "UMKM" | "NEWS";
  createdAt: string;
}

/**
 * The tracked submission lives in localStorage, i.e. outside React, so it is
 * read through `useSyncExternalStore` instead of being copied into state from
 * an effect — that keeps it available on the first client render and avoids the
 * cascading re-render that `setState` inside an effect body causes.
 */
const listeners = new Set<() => void>();

/** Parsed snapshots keyed by storage key, so repeated reads of an unchanged
 *  entry keep returning the same object identity (required by the store). */
const snapshots = new Map<
  string,
  { raw: string | null; value: PendingSubmissionState | null }
>();

function notify() {
  listeners.forEach((listener) => listener());
}

function subscribe(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  // Keeps other tabs in sync.
  window.addEventListener("storage", onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

function readTracked(storageKey: string): PendingSubmissionState | null {
  let raw: string | null;
  try {
    raw = localStorage.getItem(storageKey);
  } catch (e) {
    console.warn("Gagal mengecek status pengajuan:", e);
    return null;
  }

  const cached = snapshots.get(storageKey);
  if (cached && cached.raw === raw) return cached.value;

  let value: PendingSubmissionState | null = null;
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as PendingSubmissionState;
      if (parsed?.id) value = parsed;
    } catch (e) {
      console.warn("Gagal mengecek status pengajuan:", e);
    }
  }

  snapshots.set(storageKey, { raw, value });
  return value;
}

function writeTracked(storageKey: string, state: PendingSubmissionState) {
  const raw = JSON.stringify(state);
  try {
    localStorage.setItem(storageKey, raw);
  } catch (e) {
    console.warn("Gagal menyimpan id pengajuan ke storage:", e);
  }
  snapshots.set(storageKey, { raw, value: state });
  notify();
}

function clearTracked(storageKey: string) {
  try {
    localStorage.removeItem(storageKey);
  } catch (e) {
    console.warn("Gagal menghapus id pengajuan dari storage:", e);
  }
  snapshots.set(storageKey, { raw: null, value: null });
  notify();
}

/** Nothing is tracked during SSR — localStorage is client-only. */
function getServerSnapshot(): PendingSubmissionState | null {
  return null;
}

export function useSubmissionTracker(type: "UMKM" | "NEWS") {
  const STORAGE_KEY = type === "UMKM" ? "my_pending_umkm" : "my_pending_news";

  const getSnapshot = useCallback(
    () => readTracked(STORAGE_KEY),
    [STORAGE_KEY],
  );
  const pendingSubmission = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const [isLoading, setIsLoading] = useState(IS_API_CONNECTED);

  /** Validates the tracked submission against the API, dropping it once it is
   *  no longer pending. Updates flow through localStorage, not state. */
  const checkStatus = useCallback(() => {
    if (typeof window === "undefined" || !IS_API_CONNECTED) {
      return Promise.resolve();
    }

    const tracked = readTracked(STORAGE_KEY);
    if (!tracked) return Promise.resolve();

    return apiClient
      .get("/public/submissions/status", {
        params: { type, id: tracked.id },
      })
      .then(({ data }) => {
        if (data?.data?.status !== "PENDING") {
          clearTracked(STORAGE_KEY);
        } else if (data.data.title && data.data.title !== tracked.title) {
          writeTracked(STORAGE_KEY, { ...tracked, title: data.data.title });
        }
      })
      .catch((e) => {
        // Keep the locally tracked submission when the check itself fails.
        console.warn("Gagal mengecek status pengajuan:", e);
      });
  }, [STORAGE_KEY, type]);

  useEffect(() => {
    let cancelled = false;

    checkStatus().then(() => {
      if (!cancelled) setIsLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [checkStatus]);

  const savePendingSubmission = useCallback(
    (id: string, title: string) => {
      if (typeof window === "undefined") return;
      writeTracked(STORAGE_KEY, {
        id,
        title,
        type,
        createdAt: `Diajukan ${new Date().toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
        })}`,
      });
    },
    [STORAGE_KEY, type],
  );

  return {
    pendingSubmission,
    isLoading,
    savePendingSubmission,
    refreshStatus: checkStatus,
  };
}
