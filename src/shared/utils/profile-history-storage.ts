export const PROFILE_HISTORY_STORAGE_KEY = "pringgodani-profile-history";
export const PROFILE_HISTORY_CHANGE_EVENT =
  "pringgodani-profile-history-change";

export const DEFAULT_PROFILE_HISTORY = "";

export function getStoredProfileHistory(defaultValue = "") {
  if (typeof window === "undefined") {
    return defaultValue;
  }

  try {
    const stored = window.localStorage.getItem(PROFILE_HISTORY_STORAGE_KEY);
    return stored ?? defaultValue;
  } catch {
    return defaultValue;
  }
}

export function saveProfileHistory(value: string) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(PROFILE_HISTORY_STORAGE_KEY, value);
  } catch {
    // Ignore persistence failures in this demo setup.
  }

  window.dispatchEvent(new Event(PROFILE_HISTORY_CHANGE_EVENT));
}

export function subscribeToProfileHistory(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  window.addEventListener("storage", onStoreChange);
  window.addEventListener(PROFILE_HISTORY_CHANGE_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(PROFILE_HISTORY_CHANGE_EVENT, onStoreChange);
  };
}

export function getProfileHistorySnapshot() {
  return getStoredProfileHistory(DEFAULT_PROFILE_HISTORY);
}

export function getProfileHistoryServerSnapshot() {
  return DEFAULT_PROFILE_HISTORY;
}
