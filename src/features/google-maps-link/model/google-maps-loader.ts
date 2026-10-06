/**
 * Singleton Google Maps Script Loader
 *
 * Uses the standard callback pattern (`callback=...`) so the promise
 * resolves ONLY when the full Maps JS API — including the Map constructor,
 * InfoWindow, LatLngBounds, etc. — is ready for use.
 *
 * The previous `loading=async` approach caused a race condition where
 * `window.google.maps` existed but `Map` was undefined until an
 * additional `importLibrary("maps")` call completed.
 */

let loadPromise: Promise<typeof google.maps> | null = null;

export interface LoadGoogleMapsOptions {
  apiKey?: string;
  libraries?: string[];
}

export function loadGoogleMapsSDK(
  options: LoadGoogleMapsOptions = {},
): Promise<typeof google.maps> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Google Maps SDK cannot be loaded on SSR"));
  }

  // Already loaded globally (Map constructor available)
  if (window.google?.maps?.Map) {
    return Promise.resolve(window.google.maps);
  }

  // Already in-flight loading promise
  if (loadPromise) {
    return loadPromise;
  }

  const apiKey =
    options.apiKey || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

  if (!apiKey) {
    return Promise.reject(
      new Error("API Key Google Maps tidak ditemukan di process.env"),
    );
  }

  const libraries = options.libraries || ["marker", "places"];
  const scriptId = "google-maps-singleton-script";
  const callbackName = "__googleMapsCallback__";

  loadPromise = new Promise((resolve, reject) => {
    // If script already exists (e.g. HMR reload), wait for it
    const existingScript = document.getElementById(scriptId);
    if (existingScript) {
      // Poll until Map is available (max 10s)
      let waited = 0;
      const interval = setInterval(() => {
        waited += 100;
        if (window.google?.maps?.Map) {
          clearInterval(interval);
          resolve(window.google.maps);
        } else if (waited > 10000) {
          clearInterval(interval);
          reject(new Error("Timeout: Google Maps SDK gagal dimuat."));
        }
      }, 100);
      return;
    }

    // Register global callback
    const win = window as unknown as Record<string, unknown>;
    win[callbackName] = () => {
      delete win[callbackName];
      if (window.google?.maps?.Map) {
        resolve(window.google.maps);
      } else {
        reject(new Error("Gagal menginisialisasi object google.maps.Map"));
      }
    };

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=${libraries.join(
      ",",
    )}&v=weekly&loading=async&callback=${callbackName}`;
    script.async = true;
    script.defer = true;

    script.onerror = () => {
      delete win[callbackName];
      loadPromise = null;
      reject(new Error("Gagal mengunduh skrip Google Maps JS API"));
    };

    document.head.appendChild(script);
  });

  return loadPromise;
}
