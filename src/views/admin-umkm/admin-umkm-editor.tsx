"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Icon } from "@/shared/ui/icon";
import { FallbackImage } from "@/shared/ui/fallback-image";
import { AdminUmkmService } from "@/entities/admin/api/admin-umkm.service";
import type {
  UmkmStatus,
  AdminCategoryItem,
} from "@/entities/admin/model/admin.types";
import type { ApiSuccessBody } from "@/shared/api/response";
import { apiClient } from "@/shared/api/axios-instance";
import { extractCoordinatesFromUrl } from "@/shared/utils/google-maps";
import {
  compressImage,
  type ImagePreset,
} from "@/shared/utils/image-compression";

export interface ProductInput {
  name: string;
  price: number;
  description: string;
  imageUrl?: string;
}

export function AdminUmkmEditor({
  isNew = true,
  umkmId,
}: {
  isNew?: boolean;
  umkmId?: string;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [categories, setCategories] = useState<AdminCategoryItem[]>([]);
  const [umkmCategoryId, setUmkmCategoryId] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [mapsUrl, setMapsUrl] = useState("");
  const [description, setDescription] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [status, setStatus] = useState<UmkmStatus>("APPROVED");
  const [since, setSince] = useState<number | undefined>(
    new Date().getFullYear(),
  );
  const [openDay, setOpenDay] = useState("Senin - Sabtu");
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("17:00");

  const [latitude, setLatitude] = useState(-8.2811);
  const [longitude, setLongitude] = useState(112.5664);

  const [galleries, setGalleries] = useState<string[]>([]);
  const [galleryFiles, setGalleryFiles] = useState<Record<number, File>>({});

  const [products, setProducts] = useState<ProductInput[]>([]);
  const [productFiles, setProductFiles] = useState<Record<number, File>>({});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const uploadSingleFile = async (
    file: File,
    preset: ImagePreset = "banner",
  ): Promise<string> => {
    const compressed = await compressImage(file, preset);
    const formData = new FormData();
    formData.append("file", compressed);
    formData.append("category", "umkm");

    const { data } = await apiClient.post<ApiSuccessBody<{ url: string }>>(
      "/uploads?category=umkm",
      formData,
      { timeout: 60000 },
    );
    if (!data?.data?.url) {
      throw new Error("Gagal mengunggah berkas gambar");
    }
    return data.data.url;
  };

  const DRAFT_KEY = "admin_umkm_draft_v1";

  const clearDraft = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(DRAFT_KEY);
    }
  };

  // Fetch all UMKM categories on mount
  useEffect(() => {
    AdminUmkmService.getCategories()
      .then((items) => {
        if (items && items.length > 0) {
          setCategories(items);
          if (isNew && !umkmCategoryId) {
            setUmkmCategoryId(String(items[0].id));
            setCategoryName(items[0].name);
          }
        }
      })
      .catch((err) => console.error("Gagal memuat kategori UMKM:", err));
  }, [isNew, umkmCategoryId]);

  // Restore draft when creating new
  useEffect(() => {
    if (typeof window !== "undefined" && isNew) {
      try {
        const saved = localStorage.getItem(DRAFT_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          setTimeout(() => {
            if (parsed.name) setName(parsed.name);
            if (parsed.ownerName) setOwnerName(parsed.ownerName);
            if (parsed.umkmCategoryId) setUmkmCategoryId(parsed.umkmCategoryId);
            if (parsed.categoryName) setCategoryName(parsed.categoryName);
            if (parsed.newCategoryName)
              setNewCategoryName(parsed.newCategoryName);
            if (parsed.phone) setPhone(parsed.phone);
            if (parsed.address) setAddress(parsed.address);
            if (parsed.mapsUrl) setMapsUrl(parsed.mapsUrl);
            if (parsed.description) setDescription(parsed.description);
            if (parsed.coverUrl) setCoverUrl(parsed.coverUrl);
            if (parsed.status) setStatus(parsed.status);
            if (parsed.since) setSince(parsed.since);
            if (parsed.openDay) setOpenDay(parsed.openDay);
            if (parsed.startTime) setStartTime(parsed.startTime);
            if (parsed.endTime) setEndTime(parsed.endTime);
            if (parsed.galleries) setGalleries(parsed.galleries);
            if (parsed.products) setProducts(parsed.products);
          }, 0);
        }
      } catch (e) {
        console.error("Gagal memulihkan draf UMKM admin:", e);
      }
    }
  }, [isNew]);

  // Load existing data when editing
  useEffect(() => {
    if (umkmId && !isNew) {
      AdminUmkmService.getUmkmById(umkmId).then((data) => {
        if (data) {
          setTimeout(() => {
            setName(data.name || "");
            setOwnerName(data.ownerName || "");
            const catId = data.umkmCategoryId
              ? String(data.umkmCategoryId)
              : "";
            setUmkmCategoryId(catId);
            setCategoryName(data.categoryName || "");
            setPhone(data.phone || "");
            setAddress(data.address || "");
            setMapsUrl(data.mapsUrl || "");
            setDescription(data.description || "");
            setCoverUrl(data.coverUrl || "");
            setStatus(data.status || "APPROVED");
            setSince(data.since || undefined);
            setOpenDay(data.openDay || "Senin - Sabtu");
            setStartTime(data.startTime || "08:00");
            setEndTime(data.endTime || "17:00");
            setLatitude(Number(data.latitude) || -8.2811);
            setLongitude(Number(data.longitude) || 112.5664);

            if (data.galleries && Array.isArray(data.galleries)) {
              setGalleries(
                data.galleries.map((g) =>
                  typeof g === "string" ? g : g.imageUrl,
                ),
              );
            }
            if (data.products && Array.isArray(data.products)) {
              setProducts(
                data.products.map((p) => ({
                  name: p.name || "",
                  price: p.price || 0,
                  description: p.description || "",
                  imageUrl: p.imageUrl || "",
                })),
              );
            }
          }, 0);
        }
      });
    }
  }, [umkmId, isNew]);

  // Save to draft when creating new
  useEffect(() => {
    if (typeof window !== "undefined" && isNew) {
      try {
        const draft = {
          name,
          ownerName,
          umkmCategoryId,
          categoryName,
          newCategoryName,
          phone,
          address,
          mapsUrl,
          description,
          coverUrl: coverFile ? "" : coverUrl,
          status,
          since,
          openDay,
          startTime,
          endTime,
          galleries: galleries.map((g, idx) => (galleryFiles[idx] ? "" : g)),
          products: products.map((p, idx) => ({
            ...p,
            imageUrl: productFiles[idx] ? "" : p.imageUrl,
          })),
        };
        localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      } catch (e) {
        console.error("Gagal menyimpan draf UMKM admin:", e);
      }
    }
  }, [
    name,
    ownerName,
    umkmCategoryId,
    categoryName,
    newCategoryName,
    phone,
    address,
    mapsUrl,
    description,
    coverUrl,
    coverFile,
    status,
    since,
    openDay,
    startTime,
    endTime,
    galleries,
    galleryFiles,
    products,
    productFiles,
    isNew,
  ]);

  // Gallery Handlers
  const addGallery = () => {
    setGalleries([...galleries, ""]);
  };

  const updateGalleryUrl = (index: number, url: string) => {
    const next = [...galleries];
    next[index] = url;
    setGalleries(next);
  };

  const handleGalleryFileSelect = async (index: number, file: File | null) => {
    setGalleryFiles((prev) => {
      const next = { ...prev };
      if (file) next[index] = file;
      else delete next[index];
      return next;
    });

    if (file) {
      const previewUrl = URL.createObjectURL(file);
      updateGalleryUrl(index, previewUrl);
    }
  };

  const removeGallery = (index: number) => {
    if (galleries[index]?.startsWith("blob:")) {
      URL.revokeObjectURL(galleries[index]);
    }
    setGalleries(galleries.filter((_, i) => i !== index));
    setGalleryFiles((prev) => {
      const next = { ...prev };
      delete next[index];
      return next;
    });
  };

  // Product Handlers
  const addProduct = () => {
    setProducts([
      ...products,
      { name: "", price: 0, description: "", imageUrl: "" },
    ]);
  };

  const updateProduct = (
    index: number,
    key: keyof ProductInput,
    value: string | number,
  ) => {
    const next = [...products];
    next[index] = { ...next[index], [key]: value };
    setProducts(next);
  };

  const handleProductFileSelect = async (index: number, file: File | null) => {
    setProductFiles((prev) => {
      const next = { ...prev };
      if (file) next[index] = file;
      else delete next[index];
      return next;
    });

    if (file) {
      const previewUrl = URL.createObjectURL(file);
      updateProduct(index, "imageUrl", previewUrl);
    }
  };

  const removeProductImage = (index: number) => {
    if (products[index]?.imageUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(products[index].imageUrl!);
    }
    updateProduct(index, "imageUrl", "");
    setProductFiles((prev) => {
      const next = { ...prev };
      delete next[index];
      return next;
    });
  };

  const removeProduct = (index: number) => {
    if (products[index]?.imageUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(products[index].imageUrl!);
    }
    setProducts(products.filter((_, i) => i !== index));
    setProductFiles((prev) => {
      const next = { ...prev };
      delete next[index];
      return next;
    });
  };

  const clearError = (field: string) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const validateForm = (): boolean => {
    const fieldErrors: Record<string, string> = {};
    if (!name.trim()) fieldErrors.name = "Nama usaha wajib diisi";
    if (!ownerName.trim()) fieldErrors.ownerName = "Nama pemilik wajib diisi";
    if (!phone.trim()) fieldErrors.phone = "Nomor telepon/WhatsApp wajib diisi";
    if (!address.trim()) fieldErrors.address = "Alamat usaha wajib diisi";
    if (!description.trim())
      fieldErrors.description = "Deskripsi usaha wajib diisi";
    if (!coverUrl.trim() && !coverFile)
      fieldErrors.coverUrl = "Foto sampul/logo usaha wajib diunggah";

    setErrors(fieldErrors);

    const firstErrorField = Object.keys(fieldErrors)[0];
    if (firstErrorField) {
      setTimeout(() => {
        const el = document.getElementById(`field-${firstErrorField}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          if (typeof el.focus === "function") el.focus();
        }
      }, 80);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    setUploadProgressText("Mempersiapkan berkas...");

    try {
      // 1. Upload cover
      let finalCoverUrl = coverUrl;
      if (coverFile) {
        setUploadProgressText("Mengunggah foto sampul utama...");
        finalCoverUrl = await uploadSingleFile(coverFile, "banner");
        if (coverUrl.startsWith("blob:")) {
          URL.revokeObjectURL(coverUrl);
        }
      }

      // 2. Upload products
      const finalProducts: ProductInput[] = [];
      for (let idx = 0; idx < products.length; idx++) {
        const prod = products[idx];
        let finalProdImg = prod.imageUrl || "";
        const localProdFile = productFiles[idx];
        if (localProdFile) {
          setUploadProgressText(
            `Mengunggah foto produk ${idx + 1} dari ${products.length}...`,
          );
          try {
            finalProdImg = await uploadSingleFile(localProdFile, "product");
            if (prod.imageUrl?.startsWith("blob:")) {
              URL.revokeObjectURL(prod.imageUrl);
            }
          } catch (err) {
            console.warn(`Gagal mengunggah foto produk #${idx + 1}:`, err);
          }
        }
        finalProducts.push({
          name: prod.name,
          price: Number(prod.price) || 0,
          description: prod.description || "",
          imageUrl: finalProdImg || undefined,
        });
      }

      // 3. Upload galleries
      const finalGalleries: string[] = [];
      for (let idx = 0; idx < galleries.length; idx++) {
        const galUrl = galleries[idx];
        let finalGalImg = galUrl;
        const localGalFile = galleryFiles[idx];
        if (localGalFile) {
          setUploadProgressText(
            `Mengunggah foto galeri ${idx + 1} dari ${galleries.length}...`,
          );
          try {
            finalGalImg = await uploadSingleFile(localGalFile, "gallery");
            if (galUrl.startsWith("blob:")) {
              URL.revokeObjectURL(galUrl);
            }
          } catch (err) {
            console.warn(`Gagal mengunggah foto galeri #${idx + 1}:`, err);
          }
        }
        if (finalGalImg && finalGalImg.trim()) {
          finalGalleries.push(finalGalImg);
        }
      }

      if (umkmCategoryId === "other" && !newCategoryName.trim()) {
        setErrors((prev) => ({
          ...prev,
          newCategoryName: "Nama kategori baru wajib diisi",
        }));
        setIsSubmitting(false);
        return;
      }

      setUploadProgressText("Menyimpan profil UMKM ke database...");

      const activeCategoryName =
        umkmCategoryId === "other"
          ? newCategoryName.trim()
          : categories.find((c) => String(c.id) === String(umkmCategoryId))
              ?.name ||
            categoryName ||
            "UMKM";

      const payload = {
        name,
        ownerName,
        umkmCategoryId:
          umkmCategoryId && umkmCategoryId !== "other"
            ? String(umkmCategoryId)
            : undefined,
        categoryName: activeCategoryName,
        newCategoryName:
          umkmCategoryId === "other" ? newCategoryName.trim() : undefined,
        phone,
        address,
        mapsUrl: mapsUrl?.trim() || null,
        coverUrl: finalCoverUrl,
        status,
        since: since ? Number(since) : undefined,
        openDay,
        startTime,
        endTime,
        products: finalProducts,
        galleries: finalGalleries,
        description,
        latitude,
        longitude,
      };

      if (isNew) {
        await AdminUmkmService.createUmkm(
          payload as unknown as Parameters<
            typeof AdminUmkmService.createUmkm
          >[0],
        );
      } else if (umkmId) {
        const { success } = await AdminUmkmService.updateUmkm(
          umkmId,
          payload as unknown as Parameters<
            typeof AdminUmkmService.updateUmkm
          >[1],
        );
        if (!success) {
          throw new Error("Gagal menyimpan perubahan UMKM ke server.");
        }
      }
      clearDraft();
      router.push("/admin/umkm");
    } catch (err: unknown) {
      console.error("Gagal menyimpan UMKM:", err);
      alert(
        "Gagal menyimpan profil UMKM ke server. Periksa koneksi internet Anda, atau pastikan berkas foto berformat gambar dan berukuran di bawah 15MB.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/admin/umkm"
            onClick={clearDraft}
            className="text-primary font-label-sm mb-2 inline-flex items-center gap-1.5 text-xs font-bold hover:underline"
          >
            <Icon name="arrow_back" className="text-base" /> Kembali ke Daftar
            UMKM
          </Link>
          <h2 className="font-headline-lg text-primary text-3xl font-bold">
            {isNew ? "Tambah UMKM Baru" : "Sunting Profil UMKM"}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/umkm"
            onClick={clearDraft}
            className="bg-surface border-outline-variant text-on-surface hover:bg-surface-container-high rounded-2xl border px-5 py-3 text-xs font-bold transition"
          >
            Batal
          </Link>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-primary text-on-primary hover:bg-primary/90 flex items-center gap-2 rounded-2xl px-6 py-3 text-xs font-bold shadow-md transition disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <Icon name="sync" className="animate-spin text-base" />
                {uploadProgressText || "Menyimpan..."}
              </>
            ) : (
              <>
                <Icon name="save" className="text-base" />
                Simpan Profil UMKM
              </>
            )}
          </button>
        </div>
      </div>

      {/* Grid Split-View 2 Kolom (Kiri: Form Input, Kanan: Real-Time Preview) */}
      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-2">
        {/* Kolom Kiri: Formulir Penyuntingan */}
        <form
          onSubmit={handleSubmit}
          className="border-outline-variant/30 bg-surface-container-lowest space-y-6 rounded-3xl border p-8 shadow-sm"
        >
          <div className="border-b pb-4">
            <h3 className="font-headline-md text-primary flex items-center gap-2 text-lg font-bold">
              <Icon name="edit" className="text-xl" /> Informasi Profil UMKM
            </h3>
            <p className="text-on-surface-variant mt-1 text-xs">
              Setiap perubahan pada formulir ini langsung memperbarui pratinjau
              profil di sebelah kanan secara real-time.
            </p>
          </div>

          {/* ERROR SUMMARY BANNER */}
          {Object.keys(errors).length > 0 && (
            <div className="animate-in fade-in slide-in-from-top-2 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-900 shadow-sm">
              <Icon
                name="error"
                className="mt-0.5 shrink-0 text-xl text-red-600"
              />
              <div className="flex-1">
                <h4 className="text-sm font-bold text-red-800">
                  Beberapa Kolom Wajib Belum Diisi:
                </h4>
                <ul className="mt-2 list-inside list-disc space-y-1 text-xs text-red-700">
                  {Object.entries(errors).map(([field, msg]) => (
                    <li key={field}>
                      <button
                        type="button"
                        onClick={() => {
                          const el = document.getElementById(`field-${field}`);
                          el?.scrollIntoView({
                            behavior: "smooth",
                            block: "center",
                          });
                          el?.focus();
                        }}
                        className="text-left font-bold text-red-800 hover:underline"
                      >
                        {msg} ↗
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <div>
            <label className="font-label-sm text-on-surface-variant mb-2 block text-xs font-bold uppercase">
              Nama Usaha / Brand UMKM (Wajib)
            </label>
            <input
              id="field-name"
              type="text"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                clearError("name");
              }}
              className={`bg-surface w-full rounded-2xl border p-3.5 text-sm font-bold outline-none ${errors.name ? "border-error focus:border-error" : "border-outline-variant text-on-surface focus:border-primary"}`}
              placeholder="Masukkan nama UMKM..."
            />
            {errors.name && (
              <p className="text-error mt-1.5 text-xs font-semibold">
                {errors.name}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-label-sm text-on-surface-variant mb-2 block text-xs font-bold uppercase">
                Nama Pemilik Usaha
              </label>
              <input
                id="field-ownerName"
                type="text"
                required
                value={ownerName}
                onChange={(e) => {
                  setOwnerName(e.target.value);
                  clearError("ownerName");
                }}
                className={`bg-surface w-full rounded-2xl border p-3.5 text-sm font-semibold outline-none ${errors.ownerName ? "border-error focus:border-error" : "border-outline-variant text-on-surface focus:border-primary"}`}
                placeholder="Nama pemilik..."
              />
              {errors.ownerName && (
                <p className="text-error mt-1.5 text-xs font-semibold">
                  {errors.ownerName}
                </p>
              )}
            </div>

            <div>
              <label className="font-label-sm text-on-surface-variant mb-2 block text-xs font-bold uppercase">
                Kategori Usaha
              </label>
              <select
                value={umkmCategoryId}
                onChange={(e) => {
                  const val = e.target.value;
                  setUmkmCategoryId(val);
                  if (val !== "other") {
                    const matched = categories.find(
                      (c) => String(c.id) === val,
                    );
                    if (matched) setCategoryName(matched.name);
                  }
                  clearError("umkmCategoryId");
                }}
                className="bg-surface border-outline-variant text-on-surface focus:border-primary w-full rounded-2xl border p-3.5 text-sm font-semibold outline-none"
              >
                {categories.length === 0 && (
                  <option value="">Memuat kategori...</option>
                )}
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
                <option value="other">+ Tambah Kategori Baru</option>
              </select>

              {umkmCategoryId === "other" && (
                <div className="mt-2.5 space-y-1">
                  <input
                    type="text"
                    required
                    value={newCategoryName}
                    onChange={(e) => {
                      setNewCategoryName(e.target.value);
                      clearError("newCategoryName");
                    }}
                    placeholder="Ketik nama kategori baru..."
                    className={`bg-surface w-full rounded-xl border p-3 text-xs font-bold outline-none focus:ring-2 ${
                      errors.newCategoryName
                        ? "border-error focus:ring-error/20"
                        : "border-primary text-on-surface focus:ring-primary/20"
                    }`}
                  />
                  {errors.newCategoryName && (
                    <p className="text-error text-xs font-semibold">
                      {errors.newCategoryName}
                    </p>
                  )}
                  <p className="text-on-surface-variant text-[11px]">
                    * Kategori baru akan otomatis ditambahkan ke master kategori
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-label-sm text-on-surface-variant mb-2 block text-xs font-bold uppercase">
                No. Telepon / WhatsApp
              </label>
              <input
                id="field-phone"
                type="text"
                required
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  clearError("phone");
                }}
                className={`bg-surface w-full rounded-2xl border p-3.5 font-mono text-sm outline-none ${errors.phone ? "border-error focus:border-error" : "border-outline-variant text-on-surface focus:border-primary"}`}
                placeholder="081234567890"
              />
              {errors.phone && (
                <p className="text-error mt-1.5 text-xs font-semibold">
                  {errors.phone}
                </p>
              )}
            </div>

            <div>
              <label className="font-label-sm text-on-surface-variant mb-2 block text-xs font-bold uppercase">
                Status Verifikasi
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as UmkmStatus)}
                className="bg-surface border-outline-variant text-on-surface focus:border-primary w-full rounded-2xl border p-3.5 text-sm font-semibold outline-none"
              >
                <option value="APPROVED">APPROVED (Setujui Usaha)</option>
                <option value="PENDING">PENDING (Tinjau Warga)</option>
                <option value="DRAFT">DRAFT (Draf Arsip)</option>
                <option value="REJECTED">REJECTED (Tolak Usaha)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="font-label-sm text-on-surface-variant mb-2 block text-xs font-bold uppercase">
                Tahun Berdiri
              </label>
              <input
                type="number"
                value={since || ""}
                onChange={(e) =>
                  setSince(
                    e.target.value ? Number(e.target.value) : undefined,
                  )
                }
                placeholder="2020"
                className="bg-surface border-outline-variant text-on-surface focus:border-primary w-full rounded-2xl border p-3 text-sm outline-none"
              />
            </div>
            <div>
              <label className="font-label-sm text-on-surface-variant mb-2 block text-xs font-bold uppercase">
                Jam Buka
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="bg-surface border-outline-variant text-on-surface focus:border-primary w-full rounded-2xl border p-3 text-sm outline-none"
              />
            </div>
            <div>
              <label className="font-label-sm text-on-surface-variant mb-2 block text-xs font-bold uppercase">
                Jam Tutup
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="bg-surface border-outline-variant text-on-surface focus:border-primary w-full rounded-2xl border p-3 text-sm outline-none"
              />
            </div>
          </div>

          {/* FOTO SAMPUL / LOGO UTAMA */}
          <div className="border-outline-variant/30 rounded-2xl border p-4">
            <label className="font-label-sm text-on-surface-variant mb-2 block text-xs font-bold uppercase">
              Foto Sampul / Logo Usaha (Wajib)
            </label>

            {coverUrl ? (
              <div className="space-y-3">
                <div className="bg-surface-container relative aspect-[16/9] w-full overflow-hidden rounded-xl border">
                  <FallbackImage
                    src={coverUrl}
                    alt={name || "Sampul UMKM"}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="bg-secondary/10 text-secondary hover:bg-secondary/20 flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition">
                    <Icon name="upload" className="text-base" /> Ganti Foto
                    Sampul
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setCoverFile(file);
                          const localUrl = URL.createObjectURL(file);
                          setCoverUrl(localUrl);
                          clearError("coverUrl");
                        }
                      }}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      if (coverUrl.startsWith("blob:")) {
                        URL.revokeObjectURL(coverUrl);
                      }
                      setCoverUrl("");
                      setCoverFile(null);
                    }}
                    className="text-error hover:bg-error/10 flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-bold transition"
                  >
                    <Icon name="delete" className="text-base" /> Hapus Foto
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-surface-container-low border-outline-variant/40 flex flex-col items-center justify-center rounded-xl border border-dashed p-6 text-center">
                <Icon
                  name="add_photo_alternate"
                  className="text-on-surface-variant/50 mb-2 text-3xl"
                />
                <p className="text-on-surface-variant text-xs">
                  Belum ada foto sampul yang dipilih
                </p>
                <label className="bg-primary text-on-primary hover:bg-primary/90 mt-3 inline-flex cursor-pointer items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold shadow-sm transition">
                  <Icon name="upload" className="text-base" /> Unggah Foto
                  Sampul
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setCoverFile(file);
                        const localUrl = URL.createObjectURL(file);
                        setCoverUrl(localUrl);
                        clearError("coverUrl");
                      }
                    }}
                  />
                </label>
              </div>
            )}

            {errors.coverUrl && (
              <p className="text-error mt-1.5 text-xs font-semibold">
                {errors.coverUrl}
              </p>
            )}
          </div>

          <div>
            <label className="font-label-sm text-on-surface-variant mb-2 block text-xs font-bold uppercase">
              Alamat Lengkap Usaha
            </label>
            <input
              id="field-address"
              type="text"
              value={address}
              onChange={(e) => {
                setAddress(e.target.value);
                clearError("address");
              }}
              className={`bg-surface w-full rounded-2xl border p-3.5 text-sm outline-none ${errors.address ? "border-error focus:border-error" : "border-outline-variant text-on-surface focus:border-primary"}`}
              placeholder="Alamat dusun / RT / RW..."
            />
            {errors.address && (
              <p className="text-error mt-1.5 text-xs font-semibold">
                {errors.address}
              </p>
            )}
          </div>

          <div>
            <label className="font-label-sm text-on-surface-variant mb-2 block text-xs font-bold uppercase">
              Link Google Maps Lokasi Usaha (Opsional)
            </label>
            <div className="relative">
              <input
                type="url"
                value={mapsUrl}
                onChange={(e) => {
                  const url = e.target.value;
                  setMapsUrl(url);
                  const { lat, lng } = extractCoordinatesFromUrl(url);
                  if (lat !== -8.2811 && lng !== 112.5664) {
                    setLatitude(lat);
                    setLongitude(lng);
                  }
                }}
                className="bg-surface border-outline-variant text-on-surface focus:border-primary w-full rounded-2xl border p-3.5 pl-10 text-sm outline-none"
                placeholder="https://maps.app.goo.gl/..."
              />
              <Icon
                name="link"
                className="text-on-surface-variant absolute top-3.5 left-3 text-lg"
              />
            </div>
          </div>

          <div>
            <label className="font-label-sm text-on-surface-variant mb-2 block text-xs font-bold uppercase">
              Deskripsi Produk / Profil Singkat Usaha
            </label>
            <textarea
              id="field-description"
              rows={3}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                clearError("description");
              }}
              className={`bg-surface w-full rounded-2xl border p-3.5 text-sm leading-relaxed outline-none ${errors.description ? "border-error focus:border-error" : "border-outline-variant text-on-surface focus:border-primary"}`}
              placeholder="Jelaskan produk unggulan & keunikan usaha..."
            />
            {errors.description && (
              <p className="text-error mt-1.5 text-xs font-semibold">
                {errors.description}
              </p>
            )}
          </div>

          {/* SEKSI: MEDIA GALERI FOTO USAHA */}
          <div className="space-y-4 border-t pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-primary text-sm font-bold tracking-wider uppercase">
                  Galeri Foto Tempat & Aktivitas Usaha
                </h4>
                <p className="text-on-surface-variant text-xs">
                  Foto tempat produksi, stan, sertifikat, atau aktivitas usaha.
                </p>
              </div>
              <button
                type="button"
                onClick={addGallery}
                className="bg-secondary/10 text-secondary hover:bg-secondary/20 flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-bold transition"
              >
                <Icon name="add_photo_alternate" className="text-sm" /> Tambah
                Foto Galeri
              </button>
            </div>

            {galleries.length === 0 ? (
              <div className="bg-surface-container-low border-outline-variant/40 rounded-xl border border-dashed p-4 text-center">
                <p className="text-on-surface-variant text-xs">
                  Belum ada foto galeri tambahan.
                </p>
                <button
                  type="button"
                  onClick={addGallery}
                  className="text-primary mt-2 text-xs font-bold hover:underline"
                >
                  + Tambah Foto Galeri Pertama
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {galleries.map((url, idx) => (
                  <div
                    key={idx}
                    className="bg-surface border-outline-variant/30 relative flex flex-col justify-between overflow-hidden rounded-2xl border p-3"
                  >
                    <div className="bg-surface-container mb-2 aspect-video w-full overflow-hidden rounded-xl border">
                      <FallbackImage
                        src={url}
                        alt={`Galeri ${idx + 1}`}
                        className="h-full w-full object-cover"
                        fallbackIcon="photo"
                      />
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <label className="bg-primary/10 text-primary hover:bg-primary/20 flex flex-1 cursor-pointer items-center justify-center gap-1 rounded-xl py-1.5 text-xs font-bold transition">
                        <Icon name="upload" className="text-sm" /> Unggah Foto
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleGalleryFileSelect(idx, file);
                          }}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => removeGallery(idx)}
                        className="text-error hover:bg-error/10 flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-bold transition"
                      >
                        <Icon name="delete" className="text-sm" /> Hapus
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SEKSI: KATALOG PRODUK DINAMIS DENGAN FOTO */}
          <div className="space-y-4 border-t pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-primary text-sm font-bold tracking-wider uppercase">
                  Katalog Produk Unggulan
                </h4>
                <p className="text-on-surface-variant text-xs">
                  Tambahkan nama, harga, dan foto produk jualan Anda.
                </p>
              </div>
              <button
                type="button"
                onClick={addProduct}
                className="bg-primary/10 text-primary hover:bg-primary hover:text-on-primary flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-bold transition"
              >
                <Icon name="add" className="text-sm" /> Tambah Produk
              </button>
            </div>

            {products.length === 0 ? (
              <div className="bg-surface-container-low border-outline-variant/40 rounded-xl border border-dashed p-4 text-center">
                <p className="text-on-surface-variant text-xs">
                  Belum ada produk yang ditambahkan.
                </p>
                <button
                  type="button"
                  onClick={addProduct}
                  className="text-primary mt-2 text-xs font-bold hover:underline"
                >
                  + Tambah Produk Pertama
                </button>
              </div>
            ) : (
              products.map((p, idx) => (
                <div
                  key={idx}
                  className="bg-surface border-outline-variant/30 relative space-y-3 rounded-2xl border p-4"
                >
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="text-primary text-xs font-bold">
                      Produk #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeProduct(idx)}
                      className="text-error text-xs font-bold hover:underline"
                    >
                      Hapus Produk Ini
                    </button>
                  </div>

                  {/* Foto Produk */}
                  <div className="flex items-center gap-3">
                    <div className="bg-surface-container relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border">
                      <FallbackImage
                        src={p.imageUrl || ""}
                        alt={p.name || "Foto Produk"}
                        className="h-full w-full object-cover"
                        fallbackIcon="shopping_bag"
                      />
                    </div>
                    <div className="flex flex-1 flex-wrap items-center gap-2">
                      <label className="bg-secondary/10 text-secondary hover:bg-secondary/20 flex cursor-pointer items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-bold transition">
                        <Icon name="upload" className="text-sm" />
                        {p.imageUrl ? "Ganti Foto" : "Pilih Foto Produk"}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleProductFileSelect(idx, file);
                          }}
                        />
                      </label>
                      {p.imageUrl && (
                        <button
                          type="button"
                          onClick={() => removeProductImage(idx)}
                          className="text-error hover:bg-error/10 flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-bold transition"
                        >
                          <Icon name="delete" className="text-sm" /> Hapus Foto
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={p.name}
                      onChange={(e) =>
                        updateProduct(idx, "name", e.target.value)
                      }
                      placeholder="Nama produk..."
                      className="bg-surface-container-lowest border-outline-variant text-on-surface w-full rounded-xl border p-2.5 text-xs font-bold outline-none"
                    />
                    <input
                      type="number"
                      value={p.price || ""}
                      onChange={(e) =>
                        updateProduct(
                          idx,
                          "price",
                          e.target.value ? Number(e.target.value) : 0,
                        )
                      }
                      placeholder="Harga (Rp)..."
                      className="bg-surface-container-lowest border-outline-variant text-on-surface w-full rounded-xl border p-2.5 font-mono text-xs font-bold outline-none"
                    />
                  </div>

                  <input
                    type="text"
                    value={p.description}
                    onChange={(e) =>
                      updateProduct(idx, "description", e.target.value)
                    }
                    placeholder="Keterangan singkat produk..."
                    className="bg-surface-container-lowest border-outline-variant text-on-surface w-full rounded-xl border p-2.5 text-xs outline-none"
                  />
                </div>
              ))
            )}
          </div>
        </form>

        {/* Kolom Kanan: Live Real-Time Public UMKM Profile Preview */}
        <div className="sticky top-24 space-y-4">
          <div className="bg-surface-container-lowest border-outline-variant/30 space-y-6 rounded-3xl border p-8 shadow-xl">
            <div className="flex items-center justify-between border-b pb-4">
              <span className="bg-primary/10 text-primary font-label-sm inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-bold">
                <Icon name="visibility" className="text-sm" /> Live Pratinjau
                Tampilan Publik
              </span>
              <span className="text-on-surface-variant text-xs font-medium">
                Real-time Layout
              </span>
            </div>

            {/* Layout Pratinjau UMKM */}
            <div className="space-y-6">
              <div className="bg-surface-container relative aspect-[16/9] overflow-hidden rounded-2xl">
                <FallbackImage
                  src={coverUrl}
                  alt={name}
                  className="h-full w-full object-cover"
                />
              </div>

              <div>
                <span className="bg-secondary-container text-on-secondary-container rounded-full px-3 py-1 text-xs font-bold">
                  {umkmCategoryId === "other"
                    ? newCategoryName || "Kategori Baru"
                    : categories.find(
                        (c) => String(c.id) === String(umkmCategoryId),
                      )?.name ||
                      categoryName ||
                      "Kategori Usaha"}
                </span>
                <h1 className="font-headline-lg text-primary mt-3 text-2xl leading-tight font-bold">
                  {name || "Nama UMKM Belum Diisi"}
                </h1>
                <p className="text-on-surface-variant mt-2 text-xs">
                  Pemilik:{" "}
                  <span className="text-primary font-semibold">
                    {ownerName || "Pemilik"}
                  </span>{" "}
                  • {address || "Alamat usaha"}
                </p>
                {since && (
                  <p className="text-on-surface-variant/80 mt-1 text-xs font-medium">
                    Berdiri sejak Tahun {since} • Jam Buka: {startTime} -{" "}
                    {endTime} ({openDay})
                  </p>
                )}
              </div>

              <div className="bg-primary-container/30 border-primary/20 flex items-center justify-between rounded-2xl border p-4">
                <div>
                  <p className="text-on-surface-variant text-xs font-bold">
                    Pesan via WhatsApp
                  </p>
                  <p className="text-primary font-mono text-sm font-bold">
                    {phone || "Belum ada nomor"}
                  </p>
                </div>
                <span className="bg-primary text-on-primary flex items-center gap-1 rounded-xl px-4 py-2 text-xs font-bold">
                  <Icon name="chat" className="text-sm" /> Hubungi
                </span>
              </div>

              {mapsUrl && (
                <div className="bg-surface-container border-outline-variant/30 flex items-center justify-between rounded-2xl border p-4">
                  <div className="overflow-hidden pr-2">
                    <p className="text-on-surface-variant text-xs font-bold">
                      Lokasi Google Maps
                    </p>
                    <p className="text-primary max-w-[200px] truncate font-mono text-xs font-semibold">
                      {mapsUrl}
                    </p>
                  </div>
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-primary text-on-primary hover:bg-primary/90 flex shrink-0 items-center gap-1 rounded-xl px-3 py-2 text-xs font-bold shadow-sm transition"
                  >
                    <Icon name="open_in_new" className="text-sm" /> Buka Maps
                  </a>
                </div>
              )}

              <div className="text-on-surface-variant border-t pt-4 text-sm leading-relaxed">
                {description || "Deskripsi usaha belum diisi..."}
              </div>

              {/* Pratinjau Galeri Foto */}
              {galleries.filter(Boolean).length > 0 && (
                <div className="space-y-3 border-t pt-4">
                  <h4 className="text-primary text-sm font-bold">
                    Galeri Foto Usaha:
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    {galleries.filter(Boolean).map((g, idx) => (
                      <div
                        key={idx}
                        className="bg-surface-container aspect-square overflow-hidden rounded-xl border"
                      >
                        <FallbackImage
                          src={g}
                          alt={`Galeri ${idx + 1}`}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pratinjau Katalog Produk */}
              {products.length > 0 && (
                <div className="space-y-3 border-t pt-4">
                  <h4 className="text-primary text-sm font-bold">
                    Katalog Produk Unggulan:
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    {products.map((p, idx) => (
                      <div
                        key={idx}
                        className="bg-surface flex items-center justify-between rounded-xl border p-3"
                      >
                        <div className="flex items-center gap-3">
                          {p.imageUrl && (
                            <div className="bg-surface-container h-10 w-10 shrink-0 overflow-hidden rounded-lg border">
                              <FallbackImage
                                src={p.imageUrl}
                                alt={p.name}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          )}
                          <div>
                            <p className="text-xs font-bold">
                              {p.name || "Nama Produk"}
                            </p>
                            <p className="text-on-surface-variant text-xs">
                              {p.description}
                            </p>
                          </div>
                        </div>
                        <span className="text-primary font-mono text-xs font-bold">
                          Rp {(p.price || 0).toLocaleString("id-ID")}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
