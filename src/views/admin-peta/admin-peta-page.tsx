"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { Icon } from "@/shared/ui/icon";
import { AdminMapsService } from "@/entities/admin/api/admin-maps.service";
import type {
  AdminMapLocation,
  AdminMapCategory,
} from "@/entities/admin/model/admin.types";
import { extractCoordinatesFromUrl } from "@/shared/utils/google-maps";
import { GoogleMapCanvas } from "@/views/peta/sections/google-map-canvas";
import type { MapLocationDto } from "@/entities/fasilitas/model/types";
import { FallbackImage } from "@/shared/ui/fallback-image";

export function AdminPetaPage() {
  const [locations, setLocations] = useState<AdminMapLocation[]>([]);
  const [categories, setCategories] = useState<AdminMapCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCatFilter, setSelectedCatFilter] = useState("ALL");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingCategoryName, setEditingCategoryName] = useState("");
  const [address, setAddress] = useState("");
  const [googleMapsUrl, setGoogleMapsUrl] = useState("");
  const [latitude, setLatitude] = useState(-8.2811);
  const [longitude, setLongitude] = useState(112.5664);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedLocation, setSelectedLocation] =
    useState<MapLocationDto | null>(null);

  const modalMapRef = useRef<google.maps.Map | null>(null);

  const loadData = () => {
    setIsLoading(true);
    Promise.all([
      AdminMapsService.getLocations(),
      AdminMapsService.getCategories(),
    ])
      .then(([locs, cats]) => {
        setLocations(locs);
        setCategories(cats);
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    let ignore = false;
    Promise.all([
      AdminMapsService.getLocations(),
      AdminMapsService.getCategories(),
    ])
      .then(([locs, cats]) => {
        if (!ignore) {
          setLocations(locs);
          setCategories(cats);
        }
      })
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const openEditModal = (loc: AdminMapLocation) => {
    setEditingId(loc.id);
    setEditingName(loc.name);
    setEditingCategoryName(loc.categoryName || "UMKM");
    setAddress(loc.address || "");
    setGoogleMapsUrl(loc.googleMapsUrl || loc.mapsUrl || "");
    const lat = loc.latitude || -8.2811;
    const lng = loc.longitude || 112.5664;
    setLatitude(lat);
    setLongitude(lng);
    setIsModalOpen(true);
    setTimeout(() => {
      if (modalMapRef.current) {
        modalMapRef.current.panTo({ lat, lng });
        modalMapRef.current.setZoom(17);
      }
    }, 300);
  };

  const centerToPin = () => {
    if (modalMapRef.current) {
      modalMapRef.current.panTo({ lat: latitude, lng: longitude });
      modalMapRef.current.setZoom(18);
    }
  };

  const resetToVillageCenter = () => {
    const defaultLat = -8.2811;
    const defaultLng = 112.5664;
    setLatitude(defaultLat);
    setLongitude(defaultLng);
    if (modalMapRef.current) {
      modalMapRef.current.panTo({ lat: defaultLat, lng: defaultLng });
      modalMapRef.current.setZoom(16);
    }
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Browser Anda tidak mendukung deteksi lokasi GPS.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setLatitude(lat);
        setLongitude(lng);
        if (modalMapRef.current) {
          modalMapRef.current.panTo({ lat, lng });
          modalMapRef.current.setZoom(18);
        }
        showToast("Titik lokasi diperbarui ke koordinat GPS Anda.");
      },
      (err) => {
        alert("Gagal mendeteksi lokasi GPS: " + err.message);
      },
      { enableHighAccuracy: true },
    );
  };

  const copyCoordinates = () => {
    navigator.clipboard.writeText(`${latitude}, ${longitude}`);
    showToast("Koordinat disalin ke clipboard!");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId || isSaving) return;
    setIsSaving(true);

    try {
      const payload = {
        name: editingName,
        address,
        latitude,
        longitude,
        googleMapsUrl,
        mapsUrl: googleMapsUrl,
      };

      await AdminMapsService.updateLocation(editingId, payload);
      showToast(`Titik koordinat UMKM "${editingName}" berhasil diperbarui.`);
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      console.error("Gagal memperbarui koordinat UMKM:", err);
      showToast("Gagal memperbarui koordinat. Silakan coba lagi.");
    } finally {
      setIsSaving(false);
    }
  };

  // Filter locations
  const filteredLocations = useMemo(() => {
    return locations.filter((loc) => {
      const matchSearch =
        !searchQuery.trim() ||
        loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (loc.address &&
          loc.address.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchCat =
        selectedCatFilter === "ALL" || loc.categoryId === selectedCatFilter;

      return matchSearch && matchCat;
    });
  }, [locations, searchQuery, selectedCatFilter]);

  return (
    <div className="space-y-8">
      {toastMessage && (
        <div className="bg-primary text-on-primary animate-fade-in fixed right-6 bottom-6 z-50 flex items-center gap-3 rounded-2xl px-6 py-4 text-sm font-semibold shadow-2xl">
          <Icon name="check_circle" className="text-xl" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Halaman */}
      <div className="flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="text-on-surface-variant font-label-sm text-xs font-bold tracking-wider uppercase">
            Sistem Geospasial UMKM Desa
          </span>
          <h2 className="font-headline-lg text-primary mt-1 text-3xl font-bold">
            Kelola Titik Geospasial UMKM
          </h2>
          <p className="text-on-surface-variant mt-1 text-sm">
            Pantau sebaran toko UMKM di peta dan sesuaikan titik koordinat GPS (latitude & longitude) atau link Google Maps agar posisi pin di peta publik selalu presisi.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-primary/10 text-primary flex items-center gap-2 rounded-2xl px-4 py-3 text-xs font-bold">
            <Icon name="storefront" className="text-lg" />
            <span>{locations.length} UMKM Terdaftar</span>
          </div>
        </div>
      </div>

      {/* Peta Interaktif Sebaran UMKM Desa */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-headline-md text-primary flex items-center gap-2 text-base font-bold">
            <Icon name="map" className="text-lg" /> Pratinjau Peta Interaktif UMKM
          </h3>
          <span className="text-on-surface-variant text-xs font-medium">
            Klik pin untuk melihat detail UMKM
          </span>
        </div>

        <div className="border-outline-variant/30 relative h-96 w-full overflow-hidden rounded-3xl border shadow-sm">
          <GoogleMapCanvas
            locations={locations.map((loc) => ({
              id: loc.id,
              name: loc.name,
              mapCategoryId: loc.categoryId,
              categoryName: loc.categoryName,
              shortDescription: loc.shortDescription || null,
              address: loc.address || null,
              latitude: loc.latitude,
              longitude: loc.longitude,
              googleMapsUrl: loc.googleMapsUrl || null,
              imageUrl: loc.imageUrl || null,
              category: {
                id: loc.categoryId,
                name: loc.categoryName,
                slug: loc.categoryName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
                icon: "store",
                color: "#16a34a",
              },
            }))}
            selectedLocation={selectedLocation}
            onSelectLocation={(loc) => setSelectedLocation(loc)}
          />
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Icon
            name="search"
            className="text-on-surface-variant absolute top-1/2 left-4 -translate-y-1/2 text-lg"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama UMKM atau alamat..."
            className="bg-surface-container-lowest border-outline-variant/40 text-on-surface focus:border-primary w-full rounded-2xl border py-3 pr-4 pl-11 text-sm outline-none shadow-sm"
          />
        </div>

        {categories.length > 0 && (
          <div className="flex items-center gap-2">
            <select
              value={selectedCatFilter}
              onChange={(e) => setSelectedCatFilter(e.target.value)}
              className="bg-surface-container-lowest border-outline-variant/40 text-on-surface focus:border-primary rounded-2xl border px-4 py-3 text-xs font-semibold outline-none shadow-sm"
            >
              <option value="ALL">Semua Kategori ({locations.length})</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name} ({cat.count || 0})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Tabel Titik Peta UMKM */}
      <div className="border-outline-variant/30 bg-surface-container-lowest overflow-hidden rounded-3xl border shadow-sm">
        {isLoading ? (
          <div className="text-on-surface-variant py-12 text-center text-sm font-medium">
            <Icon name="sync" className="animate-spin text-2xl mx-auto mb-2 text-primary" />
            Memuat data geospasial UMKM...
          </div>
        ) : filteredLocations.length === 0 ? (
          <div className="text-on-surface-variant space-y-2 py-12 text-center text-sm font-medium">
            <Icon name="storefront" className="text-primary/40 mx-auto text-4xl" />
            <p>Tidak ada data UMKM yang cocok dengan pencarian.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-container-highest text-on-surface-variant border-b text-xs font-bold uppercase">
                <tr>
                  <th className="px-6 py-4">Nama UMKM & Alamat</th>
                  <th className="px-6 py-4">Kategori</th>
                  <th className="px-6 py-4">Koordinat GPS</th>
                  <th className="px-6 py-4">Tautan Google Maps</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-outline-variant/20 divide-y">
                {filteredLocations.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-surface-container-low transition"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="border-outline-variant bg-surface-container h-10 w-10 shrink-0 overflow-hidden rounded-xl border">
                          <FallbackImage
                            src={item.imageUrl || "/images/placeholder-umkm.jpg"}
                            alt={item.name}
                            className="h-full w-full object-cover"
                            fallbackIcon="store"
                          />
                        </div>
                        <div>
                          <p className="text-primary text-base font-bold">
                            {item.name}
                          </p>
                          <p className="text-on-surface-variant mt-0.5 text-xs">
                            {item.address || "Desa Pringgodani"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="bg-secondary-container text-on-secondary-container rounded-full px-3 py-1 text-xs font-bold">
                        {item.categoryName || "UMKM"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-xs">
                      {item.latitude && item.longitude ? (
                        <span className="text-primary font-bold">
                          {item.latitude.toFixed(5)}, {item.longitude.toFixed(5)}
                        </span>
                      ) : (
                        <span className="text-error font-semibold">
                          Belum ditentukan
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.googleMapsUrl ? (
                        <a
                          href={item.googleMapsUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary inline-flex items-center gap-1 text-xs font-semibold hover:underline"
                        >
                          <Icon name="open_in_new" className="text-sm" /> Buka
                          Google Maps
                        </a>
                      ) : (
                        <span className="text-on-surface-variant/50 text-xs italic">
                          -
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => openEditModal(item)}
                        className="bg-surface border-outline-variant text-on-surface hover:text-primary hover:border-primary inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-bold shadow-sm transition"
                      >
                        <Icon name="edit_location_alt" className="text-sm" />
                        <span>Sunting Koordinat</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Form Edit Titik Koordinat UMKM */}
      {isModalOpen && (
        <div className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-3 sm:p-6 backdrop-blur-sm">
          <div className="border-outline-variant/30 bg-surface-container-lowest text-on-surface flex max-h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-[2.5rem] border shadow-2xl">
            {/* Modal Header */}
            <div className="bg-surface flex items-center justify-between border-b px-6 py-4 sm:px-8">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-2xl">
                  <Icon name="location_on" className="text-2xl" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-secondary-container text-on-secondary-container rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                      {editingCategoryName}
                    </span>
                    <span className="text-on-surface-variant text-xs font-semibold">
                      Peta Lokasi Desa Pringgodani
                    </span>
                  </div>
                  <h3 className="font-headline-md text-primary text-lg font-bold sm:text-xl">
                    Sunting Koordinat: {editingName}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-on-surface-variant hover:bg-surface-container hover:text-on-surface flex h-10 w-10 items-center justify-center rounded-full transition"
                title="Tutup"
              >
                <Icon name="close" className="text-2xl" />
              </button>
            </div>

            {/* Modal Body: 2 Columns */}
            <form onSubmit={handleSave} className="flex flex-1 flex-col overflow-hidden">
              <div className="grid flex-1 grid-cols-1 gap-6 overflow-y-auto p-6 lg:grid-cols-12 sm:p-8">
                {/* Left Side: Large Map Canvas */}
                <div className="flex flex-col space-y-3 lg:col-span-7">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="bg-primary/10 text-primary inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold">
                      <Icon name="touch_app" className="text-sm" />
                      Klik pada peta untuk memindahkan pin lokasi
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={centerToPin}
                        className="bg-surface border-outline-variant hover:bg-surface-container text-on-surface flex items-center gap-1 rounded-xl border px-2.5 py-1 text-xs font-semibold shadow-xs transition"
                        title="Pusatkan peta ke pin saat ini"
                      >
                        <Icon name="my_location" className="text-primary text-sm" />
                        <span>Pusatkan</span>
                      </button>
                      <button
                        type="button"
                        onClick={resetToVillageCenter}
                        className="bg-surface border-outline-variant hover:bg-surface-container text-on-surface flex items-center gap-1 rounded-xl border px-2.5 py-1 text-xs font-semibold shadow-xs transition"
                        title="Reset ke pusat Desa Pringgodani"
                      >
                        <Icon name="home" className="text-primary text-sm" />
                        <span>Pusat Desa</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleGetCurrentLocation}
                        className="bg-surface border-outline-variant hover:bg-surface-container text-on-surface flex items-center gap-1 rounded-xl border px-2.5 py-1 text-xs font-semibold shadow-xs transition"
                        title="Gunakan posisi GPS perangkat Anda saat ini"
                      >
                        <Icon name="gps_fixed" className="text-primary text-sm" />
                        <span>GPS Saya</span>
                      </button>
                    </div>
                  </div>

                  {/* Interactive Map */}
                  <div className="border-outline-variant/30 bg-surface-container relative h-[380px] w-full flex-1 overflow-hidden rounded-2xl border shadow-inner sm:h-[440px] lg:min-h-[460px]">
                    <GoogleMapCanvas
                      locations={[
                        {
                          id: "temp-pin",
                          mapCategoryId: "cat-umkm",
                          name: editingName || "Lokasi Usaha",
                          shortDescription: address || "Desa Pringgodani",
                          latitude,
                          longitude,
                          address: address || null,
                          imageUrl: null,
                          category: {
                            id: "cat-umkm",
                            name: editingCategoryName || "UMKM",
                            slug: "umkm",
                            icon: "store",
                            color: "#16a34a",
                          },
                        },
                      ]}
                      selectedLocation={null}
                      onSelectLocation={() => {}}
                      onMapLoaded={(map) => {
                        modalMapRef.current = map;
                        map.panTo({ lat: latitude, lng: longitude });
                        map.setZoom(17);
                      }}
                      onMapClick={(lat: number, lng: number) => {
                        setLatitude(lat);
                        setLongitude(lng);
                      }}
                    />
                  </div>

                  {/* Live Coordinate Status Bar */}
                  <div className="bg-surface border-outline-variant/40 flex items-center justify-between rounded-xl border px-3.5 py-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500"></span>
                      <span className="text-on-surface-variant font-medium">
                        Titik Koordinat Terpilih:
                      </span>
                      <span className="text-on-surface font-mono font-bold">
                        {latitude.toFixed(6)}, {longitude.toFixed(6)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={copyCoordinates}
                      className="text-primary hover:text-primary/80 flex items-center gap-1 font-semibold"
                      title="Salin koordinat"
                    >
                      <Icon name="content_copy" className="text-sm" />
                      <span>Salin</span>
                    </button>
                  </div>
                </div>

                {/* Right Side: Form Controls */}
                <div className="flex flex-col justify-between space-y-4 lg:col-span-5">
                  <div className="space-y-4">
                    <div>
                      <label className="font-label-sm text-on-surface-variant mb-1.5 block text-xs font-bold uppercase">
                        Link / Tautan Google Maps
                      </label>
                      <div className="relative">
                        <input
                          type="url"
                          value={googleMapsUrl}
                          onChange={(e) => {
                            const url = e.target.value;
                            setGoogleMapsUrl(url);
                            const { lat, lng } = extractCoordinatesFromUrl(url);
                            if (lat !== 0 && lng !== 0) {
                              setLatitude(lat);
                              setLongitude(lng);
                              if (modalMapRef.current) {
                                modalMapRef.current.panTo({ lat, lng });
                                modalMapRef.current.setZoom(18);
                              }
                            }
                          }}
                          className="bg-surface border-outline-variant text-on-surface focus:border-primary w-full rounded-2xl border p-3.5 pr-10 text-xs outline-none"
                          placeholder="https://maps.app.goo.gl/... atau https://google.com/maps?q=..."
                        />
                        <Icon
                          name="link"
                          className="text-on-surface-variant absolute top-3.5 right-3 text-lg"
                        />
                      </div>
                      <p className="text-on-surface-variant mt-1.5 text-[11px] leading-relaxed">
                        💡 Tempel link share dari Google Maps untuk otomatis mengisi koordinat dan mengarahkan peta ke lokasi toko.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-label-sm text-on-surface-variant mb-1 block text-xs font-bold uppercase">
                          Latitude (Garis Lintang)
                        </label>
                        <input
                          type="number"
                          step="any"
                          required
                          value={latitude}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setLatitude(val);
                            if (modalMapRef.current && !isNaN(val)) {
                              modalMapRef.current.panTo({ lat: val, lng: longitude });
                            }
                          }}
                          className="bg-surface border-outline-variant text-on-surface focus:border-primary w-full rounded-xl border p-3 font-mono text-xs font-bold outline-none"
                        />
                      </div>
                      <div>
                        <label className="font-label-sm text-on-surface-variant mb-1 block text-xs font-bold uppercase">
                          Longitude (Garis Bujur)
                        </label>
                        <input
                          type="number"
                          step="any"
                          required
                          value={longitude}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setLongitude(val);
                            if (modalMapRef.current && !isNaN(val)) {
                              modalMapRef.current.panTo({ lat: latitude, lng: val });
                            }
                          }}
                          className="bg-surface border-outline-variant text-on-surface focus:border-primary w-full rounded-xl border p-3 font-mono text-xs font-bold outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-label-sm text-on-surface-variant mb-1.5 block text-xs font-bold uppercase">
                        Alamat Lengkap Toko / Usaha
                      </label>
                      <textarea
                        rows={3}
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="bg-surface border-outline-variant text-on-surface focus:border-primary w-full rounded-2xl border p-3 text-xs leading-relaxed outline-none"
                        placeholder="Contoh: RT 03 RW 02 Dusun Krajan, Desa Pringgodani..."
                      />
                    </div>

                    {/* Panduan Singkat */}
                    <div className="bg-surface-container/50 border-outline-variant/30 rounded-2xl border p-4 text-xs">
                      <div className="text-primary mb-1.5 flex items-center gap-1.5 font-bold">
                        <Icon name="lightbulb" className="text-base" />
                        <span>Panduan Menyesuaikan Lokasi</span>
                      </div>
                      <ol className="text-on-surface-variant list-inside list-decimal space-y-1 text-[11px] leading-relaxed">
                        <li>Geser dan perbesar peta di sisi kiri ke titik bangunan toko.</li>
                        <li>Klik tepat pada atap / lokasi toko untuk menaruh pin.</li>
                        <li>Pastikan alamat dan titik koordinat sudah sesuai, lalu klik tombol Simpan.</li>
                      </ol>
                    </div>
                  </div>

                  {/* Modal Footer Actions */}
                  <div className="flex items-center justify-end gap-3 border-t pt-4">
                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={() => setIsModalOpen(false)}
                      className="bg-surface border-outline-variant hover:bg-surface-container text-on-surface rounded-2xl border px-5 py-3 text-xs font-bold transition disabled:opacity-50"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="bg-primary text-on-primary hover:bg-primary/90 flex items-center gap-2 rounded-2xl px-6 py-3 text-xs font-bold shadow-md transition disabled:opacity-50"
                    >
                      {isSaving ? (
                        <>
                          <Icon name="sync" className="animate-spin text-base" />
                          <span>Menyimpan...</span>
                        </>
                      ) : (
                        <>
                          <Icon name="save" className="text-base" />
                          <span>Simpan Koordinat</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
