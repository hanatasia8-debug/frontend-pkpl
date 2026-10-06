"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useRef, useState, useCallback } from "react";
import type { MapLocationDto } from "@/entities/fasilitas/model/types";
import { buildDirectionsUrl } from "@/features/google-maps-link/model/maps-url";
import { loadGoogleMapsSDK } from "@/features/google-maps-link/model/google-maps-loader";
import { Icon } from "@/shared/ui/icon";
import { MapSkeletonLoader } from "./map-skeleton-loader";

interface GoogleMapCanvasProps {
  locations: MapLocationDto[];
  selectedLocation: MapLocationDto | null;
  onSelectLocation: (location: MapLocationDto | null) => void;
  onMapLoaded?: (mapInstance: google.maps.Map) => void;
  onMapClick?: (lat: number, lng: number) => void;
}

// Center point of Desa Pringgodani, Kecamatan Bantur, Kabupaten Malang
const DEFAULT_CENTER = { lat: -8.2811, lng: 112.5664 };
const DEFAULT_ZOOM = 15;

export function GoogleMapCanvas({
  locations,
  selectedLocation,
  onSelectLocation,
  onMapLoaded,
  onMapClick,
}: GoogleMapCanvasProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const markersRef = useRef<Map<string, any>>(new Map());
  const onMapClickRef = useRef(onMapClick);

  useEffect(() => {
    onMapClickRef.current = onMapClick;
  }, [onMapClick]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);

  const [isVisible, setIsVisible] = useState(
    () => typeof window !== "undefined" && Boolean(window.google?.maps),
  );
  const [isLoaded, setIsLoaded] = useState(
    () => typeof window !== "undefined" && Boolean(window.google?.maps),
  );
  const [loadError, setLoadError] = useState<string | null>(null);

  // 1. Intersection Observer: Only activate map loading when container enters viewport
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return;

    // If Google Maps is already initialized globally, do not set up observer
    if (window.google?.maps) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "150px" },
    );

    observer.observe(mapRef.current);
    return () => observer.disconnect();
  }, []);

  // 2. Load Google Maps Script asynchronously via Singleton Loader when visible
  useEffect(() => {
    if (!isVisible || isLoaded) return;

    let isMounted = true;

    loadGoogleMapsSDK()
      .then(() => {
        if (isMounted) setIsLoaded(true);
      })
      .catch((err) => {
        if (isMounted)
          setLoadError(err.message || "Gagal memuat SDK Google Maps.");
      });

    return () => {
      isMounted = false;
    };
  }, [isVisible, isLoaded]);

  // Helper to create HTML string for InfoWindow popup
  const createInfoWindowContent = useCallback((loc: MapLocationDto) => {
    const color = loc.category?.color || "#006399";
    const categoryName = loc.category?.name || "Fasilitas Publik";
    const directionsUrl = buildDirectionsUrl(
      loc.latitude,
      loc.longitude,
      loc.googleMapsUrl || (loc as any).mapsUrl,
    );
    const imageUrl = loc.imageUrl
      ? loc.imageUrl.startsWith("http")
        ? loc.imageUrl
        : `https://lh3.googleusercontent.com/aida-public/AB6AXuCPuD79rMJV73ZCZ6t8RfNJ7l1bhJYtnHgeAz36bDbzhCKhbjnYRILlGxSOrahOv1uTWWM8_ePRH91-R9dAVsERMmmTpk7YuvkrPOd7OJ_74KuG1yfG_0Kb9sCOuY1sxvzUokltuuGKMiF09eYW39VU4FHzdVpLmONvzN_847AqRkwWAxNdnMLOyDwAKPL6LR7bsU3NBfCm6K6iNMNOTaPywEwG_FEcMKARBaEujtsakdP_q0u8vng`
      : null;

    return `
      <div style="font-family: Inter, system-ui, sans-serif; max-width: 280px; padding: 4px;">
        ${
          imageUrl
            ? `<div style="height: 125px; width: 100%; border-radius: 12px; background-image: url('${imageUrl}'); background-size: cover; background-position: center; margin-bottom: 12px; position: relative;">
                <span style="position: absolute; bottom: 8px; left: 8px; background-color: ${color}; color: white; padding: 3px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; box-shadow: 0 2px 6px rgba(0,0,0,0.3);">${categoryName}</span>
              </div>`
            : `<div style="display: inline-block; background-color: ${color}; color: white; padding: 3px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">${categoryName}</div>`
        }
        <h4 style="font-size: 16px; font-weight: 700; color: #0f172a; margin: 0 0 4px 0;">${loc.name}</h4>
        <p style="font-size: 13px; color: #475569; margin: 0 0 12px 0; line-height: 1.4;">${loc.shortDescription || loc.address || "Fasilitas Desa Pringgodani"}</p>
        
        ${
          loc.address
            ? `<div style="display: flex; align-items: center; gap: 6px; font-size: 12px; color: #334155; margin-bottom: 12px;">
                <span>📍 ${loc.address}</span>
              </div>`
            : ""
        }

        <div style="display: flex; gap: 8px; margin-top: 12px;">
          <a href="${directionsUrl}" target="_blank" rel="noopener noreferrer" style="flex: 1; text-align: center; background-color: ${color}; color: white; padding: 9px 12px; border-radius: 10px; font-size: 12px; font-weight: 700; text-decoration: none; display: inline-block; box-shadow: 0 4px 10px ${color}40;">
            Petunjuk Arah ↗
          </a>
          ${
            loc.slug
              ? `<a href="/umkm/${loc.slug}" style="flex: 1; text-align: center; background-color: #f1f5f9; color: #0f172a; border: 1px solid #cbd5e1; padding: 9px 12px; border-radius: 10px; font-size: 12px; font-weight: 700; text-decoration: none; display: inline-block;">
                  Profil UMKM →
                </a>`
              : ""
          }
        </div>
      </div>
    `;
  }, []);

  // 3. Initialize Google Map — loader guarantees Map constructor is ready
  useEffect(() => {
    if (!isLoaded || !mapRef.current || mapInstanceRef.current) return;

    // Filter out internal Google Maps SDK deprecation warnings in browser console
    const originalWarn = console.warn;
    console.warn = (...args: any[]) => {
      const msg = args[0] ? String(args[0]) : "";
      if (
        msg.includes("google.maps.Marker is deprecated") ||
        msg.includes("AdvancedMarkerElement") ||
        msg.includes("gmp-click") ||
        msg.includes("DEMO_MAP_ID")
      ) {
        return;
      }
      originalWarn.apply(console, args);
    };

    let isMounted = true;

    async function initMap() {
      if (!window.google?.maps) return;

      const mapOptions: google.maps.MapOptions = {
        center: DEFAULT_CENTER,
        zoom: DEFAULT_ZOOM,
        mapTypeId: "hybrid",
        gestureHandling: "cooperative",
        clickableIcons: false,
        disableDefaultUI: false,
        fullscreenControl: false,
        zoomControl: false,
        mapTypeControl: true,
        mapTypeControlOptions: {
          position: google.maps?.ControlPosition?.TOP_RIGHT ?? 3,
        },
        streetViewControl: true,
        streetViewControlOptions: {
          position: google.maps?.ControlPosition?.RIGHT_BOTTOM ?? 9,
        },
      };

      if (!window.google?.maps?.Map) {
        throw new Error("Pustaka google.maps.Map belum siap.");
      }

      let MapConstructor = window.google.maps.Map;

      if (window.google.maps.importLibrary) {
        try {
          const mapsLibrary = (await window.google.maps.importLibrary(
            "maps",
          )) as any;
          await window.google.maps.importLibrary("marker");
          if (mapsLibrary?.Map && typeof mapsLibrary.Map === "function") {
            MapConstructor = mapsLibrary.Map;
          }
        } catch {
          // Handled silently
        }
      }

      if (!isMounted || !mapRef.current || mapInstanceRef.current) return;

      if (!MapConstructor || typeof MapConstructor !== "function") {
        throw new Error("Google Maps Map constructor is unavailable.");
      }

      const map = new MapConstructor(mapRef.current, mapOptions);

      map.addListener("click", (e: any) => {
        if (e.latLng && onMapClickRef.current) {
          onMapClickRef.current(e.latLng.lat(), e.latLng.lng());
        }
      });

      mapInstanceRef.current = map;
      setMapInstance(map);
      infoWindowRef.current = new window.google.maps.InfoWindow();

      if (onMapLoaded) {
        onMapLoaded(map);
      }
    }

    initMap().catch((err) => {
      console.error("Gagal menginisialisasi Google Maps:", err);
      setLoadError("Gagal menginisialisasi peta Google Maps.");
    });

    return () => {
      console.warn = originalWarn;
      isMounted = false;
    };
  }, [isLoaded, onMapLoaded]);

  // 4. Sync Markers with locations prop
  useEffect(() => {
    if (!isLoaded || !mapInstance) return;

    const map = mapInstance;
    const currentMarkers = markersRef.current;
    const activeLocationIds = new Set(locations.map((l) => l.id));

    // Remove markers that are no longer in locations
    currentMarkers.forEach((marker, id) => {
      if (!activeLocationIds.has(id)) {
        if (marker.setMap) marker.setMap(null);
        else if (marker.map !== undefined) marker.map = null;
        currentMarkers.delete(id);
      }
    });

    // Add or update markers
    locations.forEach((loc) => {
      const lat = Number(loc.latitude);
      const lng = Number(loc.longitude);
      if (isNaN(lat) || isNaN(lng)) return;

      const handleClick = () => {
        onSelectLocation(loc);
        if (infoWindowRef.current) {
          infoWindowRef.current.setContent(createInfoWindowContent(loc));
          const existingMarker = currentMarkers.get(loc.id);
          if (existingMarker) {
            infoWindowRef.current.open({ map, anchor: existingMarker });
          }
        }
      };

      const color = loc.category?.color || "#006399";
      const iconSvgUrl = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="54" viewBox="0 0 48 54">
          <g filter="drop-shadow(0px 4px 6px rgba(0,0,0,0.4))">
            <path d="M24 2 C13.5 2 5 10.5 5 21 C5 33 24 50 24 50 C24 50 43 33 43 21 C43 10.5 34.5 2 24 2 Z" fill="${color}" stroke="#FFFFFF" stroke-width="2.5"/>
            <circle cx="24" cy="21" r="11" fill="#FFFFFF"/>
            <circle cx="24" cy="21" r="6" fill="${color}"/>
          </g>
        </svg>
      `)}`;

      if (currentMarkers.has(loc.id)) {
        // Update existing marker position
        const marker = currentMarkers.get(loc.id);
        if (marker.setPosition) {
          marker.setPosition({ lat, lng });
        } else if (marker.position !== undefined) {
          marker.position = { lat, lng };
        }
      } else {
        // Create new standard Marker (clean & zero console warnings)
        const marker = new window.google.maps.Marker({
          position: { lat, lng },
          map,
          title: loc.name,
          icon: {
            url: iconSvgUrl,
            scaledSize: new window.google.maps.Size(48, 54),
            anchor: new window.google.maps.Point(24, 54),
          },
        });
        marker.addListener("click", handleClick);
        currentMarkers.set(loc.id, marker);
      }
    });

    // Auto-fit bounds to show all markers
    if (locations.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      let count = 0;
      locations.forEach((loc) => {
        const lat = Number(loc.latitude);
        const lng = Number(loc.longitude);
        if (!isNaN(lat) && !isNaN(lng)) {
          bounds.extend({ lat, lng });
          count++;
        }
      });
      if (count > 0) {
        map.fitBounds(bounds, 50);
      }
    }
  }, [
    isLoaded,
    mapInstance,
    locations,
    selectedLocation,
    createInfoWindowContent,
    onSelectLocation,
  ]);

  // 5. Pan to selectedLocation change and show InfoWindow
  useEffect(() => {
    if (!isLoaded || !mapInstance || !selectedLocation) return;

    const lat = Number(selectedLocation.latitude);
    const lng = Number(selectedLocation.longitude);
    if (isNaN(lat) || isNaN(lng)) return;

    mapInstance.panTo({ lat, lng });

    const marker = markersRef.current.get(selectedLocation.id);
    if (marker && infoWindowRef.current) {
      infoWindowRef.current.setContent(
        createInfoWindowContent(selectedLocation),
      );
      infoWindowRef.current.open({
        map: mapInstance,
        anchor: marker,
      });
    }
  }, [selectedLocation, isLoaded, mapInstance, createInfoWindowContent]);

  if (loadError) {
    return (
      <div className="bg-surface-container flex h-full w-full flex-col items-center justify-center p-6 text-center">
        <div className="bg-primary/10 text-primary mb-3 flex h-14 w-14 items-center justify-center rounded-full">
          <Icon name="map" className="text-3xl" />
        </div>
        <h3 className="font-headline-md text-headline-md text-primary font-bold">
          Peta Fasilitas Desa Pringgodani
        </h3>
        <p className="text-on-surface-variant mt-1 max-w-md text-sm">
          {locations.length > 0
            ? `Terdapat ${locations.length} titik fasilitas desa terdaftar.`
            : "Kecamatan Bantur, Kabupaten Malang, Jawa Timur."}
        </p>
        {locations.length > 0 && (
          <div className="mt-4 flex max-w-lg flex-wrap justify-center gap-2">
            {locations.slice(0, 4).map((loc) => (
              <a
                key={loc.id}
                href={loc.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${loc.latitude},${loc.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-surface text-primary border-outline-variant/30 hover:bg-primary hover:text-on-primary inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold shadow-sm transition"
              >
                <Icon name="location_on" className="text-sm" />
                {loc.name}
              </a>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      {!isLoaded && (
        <div className="absolute inset-0 z-30 transition-opacity duration-300">
          <MapSkeletonLoader />
        </div>
      )}
      <div ref={mapRef} className="h-full w-full" />
    </div>
  );
}
