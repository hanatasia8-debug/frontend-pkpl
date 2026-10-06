import type { AdminProfilPayload } from "@/entities/admin/api/admin-profil.service";

const STORAGE_KEY = "app_village_profile_v1";

export const DEFAULT_PROFIL_DATA: AdminProfilPayload = {
  headName: "",
  headPosition: "",
  headPhoto: "",
  headGreeting: "",
  aboutText: "",
  officials: [],
};

const listeners = new Set<() => void>();

/** Last parsed profile, kept so repeated reads of an unchanged entry return the
 *  same object identity — required by `useSyncExternalStore` consumers. */
let snapshotRaw: string | null = null;
let snapshot: AdminProfilPayload = DEFAULT_PROFIL_DATA;

/** Subscribes to profile changes, for reading the stored profile during render
 *  via `useSyncExternalStore`. */
export function subscribeStoredVillageProfile(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  // Keeps other tabs in sync.
  window.addEventListener("storage", onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

export function getStoredVillageProfile(): AdminProfilPayload {
  if (typeof window === "undefined") return DEFAULT_PROFIL_DATA;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROFIL_DATA;
    if (raw !== snapshotRaw) {
      snapshotRaw = raw;
      snapshot = { ...DEFAULT_PROFIL_DATA, ...JSON.parse(raw) };
    }
    return snapshot;
  } catch {
    return DEFAULT_PROFIL_DATA;
  }
}

export function saveStoredVillageProfile(
  updated: Partial<AdminProfilPayload>,
): AdminProfilPayload {
  if (typeof window === "undefined") return DEFAULT_PROFIL_DATA;
  try {
    const current = getStoredVillageProfile();
    const merged = { ...current, ...updated };
    const raw = JSON.stringify(merged);
    localStorage.setItem(STORAGE_KEY, raw);
    snapshotRaw = raw;
    snapshot = merged;
    listeners.forEach((listener) => listener());
    return merged;
  } catch {
    return DEFAULT_PROFIL_DATA;
  }
}
