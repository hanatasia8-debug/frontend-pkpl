/**
 * High-performance browser IndexedDB helper for persistent local image drafts.
 * Saves raw File/Blob objects locally in client browser storage to preserve
 * form image uploads across page refreshes without cluttering the server.
 */

const DB_NAME = "DesaPringgodaniDraftsDB";
const DB_VERSION = 1;
const STORE_NAME = "draft_images";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !("indexedDB" in window)) {
      return reject(
        new Error("IndexedDB is not supported in this environment"),
      );
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Save a binary File or Blob to IndexedDB under a unique key.
 */
export async function saveDraftImage(
  key: string,
  file: File | Blob,
): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(file, key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    console.warn(`Gagal menyimpan file biner ke IndexedDB (${key}):`, e);
  }
}

/**
 * Retrieve a binary File or Blob from IndexedDB by key.
 */
export async function getDraftImage(key: string): Promise<File | Blob | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    console.warn(`Gagal membaca file biner dari IndexedDB (${key}):`, e);
    return null;
  }
}

/**
 * Delete a binary File or Blob from IndexedDB by key.
 */
export async function deleteDraftImage(key: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    console.warn(`Gagal menghapus file biner dari IndexedDB (${key}):`, e);
  }
}

/**
 * Clear all draft images or all keys starting with a specific prefix.
 */
export async function clearDraftImages(prefix?: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);

      if (!prefix) {
        const req = store.clear();
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
        return;
      }

      const req = store.openKeyCursor();
      req.onsuccess = () => {
        const cursor = req.result;
        if (cursor) {
          const keyStr = String(cursor.key);
          if (keyStr.startsWith(prefix)) {
            store.delete(cursor.key);
          }
          cursor.continue();
        } else {
          resolve();
        }
      };
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    console.warn("Gagal membersihkan IndexedDB:", e);
  }
}

/**
 * Synchronize IndexedDB keys when an array item is deleted/re-ordered.
 * Clears old array keys under `prefix` and re-saves non-null files with clean contiguous indices.
 */
export async function syncArrayDraftImages(
  prefix: string,
  files: (File | null)[],
): Promise<void> {
  await clearDraftImages(prefix);
  for (let i = 0; i < files.length; i++) {
    if (files[i]) {
      await saveDraftImage(`${prefix}${i}`, files[i]!);
    }
  }
}
