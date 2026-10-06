"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useRef } from "react";
import { Icon } from "@/shared/ui/icon";
import type { UmkmCategoryDto } from "@/entities/umkm/model/types";
import type { RegisterUmkmDTO } from "@/entities/umkm/model/register-umkm.schema";
import { extractCoordinatesFromUrl } from "@/shared/utils/google-maps";
import { PendingStatusCard } from "@/features/submission-tracker/ui/pending-status-card";
import { compressImage } from "@/shared/utils/image-compression";

interface SubmitUmkmFormProps {
  formData: Partial<RegisterUmkmDTO>;
  categories: UmkmCategoryDto[];
  errors: Record<string, string>;
  onChange: (field: keyof RegisterUmkmDTO, value: any) => void;
  onAddProduct: () => void;
  onRemoveProduct: (index: number) => void;
  onProductChange: (index: number, field: string, value: any) => void;
  onClearDraft: () => void;
  onSubmitStep: (e: React.FormEvent) => void;
  hideSidebar?: boolean;
  onSetCoverFile?: (file: File | null) => void;
  onSetProductFile?: (index: number, file: File | null) => void;
  onSetGalleryFile?: (index: number, file: File | null) => void;
  /**
   * Overrides the default "Draf Isian Tersimpan Otomatis (LocalStorage)"
   * banner. Used by the revision flow (`submit-revision`), where the form
   * is hydrated from a rejected submission rather than a local draft, so
   * that banner's copy would be misleading. Pass `null` to hide it
   * entirely.
   */
  draftBanner?: React.ReactNode | null;
  /** Overrides the default "Lihat Pratinjau Tampilan" submit button — used
   * by the revision flow, which submits directly instead of going to a
   * preview step. */
  submitButton?: React.ReactNode;
}

export function SubmitUmkmForm({
  formData,
  categories,
  errors,
  onChange,
  onAddProduct,
  onRemoveProduct,
  onProductChange,
  onClearDraft,
  onSubmitStep,
  hideSidebar = false,
  onSetCoverFile,
  onSetProductFile,
  onSetGalleryFile,
  draftBanner,
  submitButton,
}: SubmitUmkmFormProps) {
  const coverFileInputRef = useRef<HTMLInputElement>(null);

  // Helper to scroll and focus field
  const scrollToField = (fieldId: string) => {
    const el = document.getElementById(`field-${fieldId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      if (typeof el.focus === "function") el.focus();
    }
  };

  // Helper to compress & read file to Data URL
  const handleFileChange = async (
    file: File | undefined,
    onSuccess: (dataUrl: string) => void,
    preset: "banner" | "product" | "gallery" | "avatar" | "default" = "default",
  ) => {
    if (!file) return;
    const compressed = await compressImage(file, preset);
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        onSuccess(e.target.result as string);
      }
    };
    reader.readAsDataURL(compressed);
  };

  const handleAddGallery = () => {
    const currentGalleries = formData.galleries || [];
    onChange("galleries", [...currentGalleries, ""]);
  };

  const handleRemoveGallery = (index: number) => {
    const currentGalleries = formData.galleries || [];
    onChange(
      "galleries",
      currentGalleries.filter((_, i) => i !== index),
    );
  };

  const handleGalleryChange = (index: number, value: string) => {
    const currentGalleries = [...(formData.galleries || [])];
    currentGalleries[index] = value;
    onChange("galleries", currentGalleries);
  };

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <section className="bg-surface-container-lowest border-outline-variant/30 rounded-xl border p-6 shadow-sm transition-all md:p-8">
      {/* ERROR SUMMARY BANNER (Direct UX Feedback) */}
      {hasErrors && (
        <div className="animate-in fade-in slide-in-from-top-2 mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-900 shadow-sm">
          <Icon name="error" className="mt-0.5 shrink-0 text-xl text-red-600" />
          <div className="flex-1">
            <h4 className="text-sm font-bold text-red-800">
              Beberapa Kolom Wajib Belum Diisi dengan Benar:
            </h4>
            <p className="mt-0.5 text-xs text-red-700">
              Klik pada nama kolom di bawah ini untuk langsung menuju ke lokasi
              pengisian:
            </p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-xs text-red-700">
              {Object.entries(errors).map(([field, msg]) => (
                <li key={field}>
                  <button
                    type="button"
                    onClick={() => scrollToField(field)}
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

      {/* Draft Auto-save Banner (overridable — see `draftBanner` prop) */}
      {draftBanner !== null &&
        (draftBanner ?? (
          <div className="bg-surface-container-low border-outline-variant/20 mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border px-4 py-3">
            <div className="text-on-surface-variant flex items-center gap-2 text-xs">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
              <span>Draf Isian Tersimpan Otomatis (LocalStorage)</span>
            </div>
            <button
              type="button"
              onClick={onClearDraft}
              className="text-error flex items-center gap-1 text-xs font-medium hover:underline"
            >
              <Icon name="delete" className="text-sm" /> Kosongkan Draf
            </button>
          </div>
        ))}

      <div
        className={
          hideSidebar
            ? "w-full"
            : "grid grid-cols-1 items-start gap-8 lg:grid-cols-12"
        }
      >
        <div className={hideSidebar ? "w-full space-y-8" : "space-y-8 lg:col-span-7"}>
          <form onSubmit={onSubmitStep} className="space-y-8" noValidate>
            {/* SEKSI 1: IDENTITAS USAHA */}
            <div>
              <h3 className="font-headline-md text-headline-md text-primary border-outline-variant/20 mb-4 flex items-center gap-2 border-b pb-2">
                <Icon name="storefront" className="text-primary text-xl" />{" "}
                Identitas Usaha
              </h3>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Nama Usaha */}
                <div className="space-y-1.5">
                  <label className="font-label-sm text-on-surface-variant">
                    Nama Usaha <span className="text-error">*</span>
                  </label>
                  <input
                    id="field-name"
                    type="text"
                    value={formData.name || ""}
                    onChange={(e) => onChange("name", e.target.value)}
                    placeholder="Contoh: Keripik Tempe Barokah"
                    className={`text-body-base text-on-surface w-full rounded-lg bg-[#F1F5F9] p-3 transition-all ${
                      errors.name
                        ? "border-error ring-error/20 border-2 bg-red-50/30 ring-2"
                        : "focus:ring-primary/20 border-none focus:ring-2"
                    }`}
                  />
                  {errors.name && (
                    <p className="text-error mt-1 text-xs font-medium">
                      ⚠️ {errors.name}
                    </p>
                  )}
                </div>

                {/* Nama Pemilik */}
                <div className="space-y-1.5">
                  <label className="font-label-sm text-on-surface-variant">
                    Nama Pemilik <span className="text-error">*</span>
                  </label>
                  <input
                    id="field-ownerName"
                    type="text"
                    value={formData.ownerName || ""}
                    onChange={(e) => onChange("ownerName", e.target.value)}
                    placeholder="Nama Lengkap Sesuai KTP"
                    className={`text-body-base text-on-surface w-full rounded-lg bg-[#F1F5F9] p-3 transition-all ${
                      errors.ownerName
                        ? "border-error ring-error/20 border-2 bg-red-50/30 ring-2"
                        : "focus:ring-primary/20 border-none focus:ring-2"
                    }`}
                  />
                  {errors.ownerName && (
                    <p className="text-error mt-1 text-xs font-medium">
                      ⚠️ {errors.ownerName}
                    </p>
                  )}
                </div>

                {/* Kategori Usaha */}
                <div className="space-y-1.5">
                  <label className="font-label-sm text-on-surface-variant">
                    Kategori Usaha <span className="text-error">*</span>
                  </label>
                  <select
                    id="field-umkmCategoryId"
                    value={formData.umkmCategoryId || ""}
                    onChange={(e) => onChange("umkmCategoryId", e.target.value)}
                    className={`text-body-base text-on-surface w-full rounded-lg bg-[#F1F5F9] p-3 transition-all ${
                      errors.umkmCategoryId
                        ? "border-error ring-error/20 border-2 bg-red-50/30 ring-2"
                        : "focus:ring-primary/20 border-none focus:ring-2"
                    }`}
                  >
                    <option value="">-- Pilih Kategori --</option>
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                    <option value="other">Lainnya (Kategori Baru)</option>
                  </select>
                  {errors.umkmCategoryId && (
                    <p className="text-error mt-1 text-xs font-medium">
                      ⚠️ {errors.umkmCategoryId}
                    </p>
                  )}
                </div>

                {/* Kategori Baru (JIKA "other" dipilih) */}
                {formData.umkmCategoryId === "other" && (
                  <div className="space-y-1.5">
                    <label className="font-label-sm text-on-surface-variant">
                      Nama Kategori Baru <span className="text-error">*</span>
                    </label>
                    <input
                      id="field-newCategoryName"
                      type="text"
                      value={formData.newCategoryName || ""}
                      onChange={(e) =>
                        onChange("newCategoryName", e.target.value)
                      }
                      placeholder="Contoh: Peternakan Organik"
                      className={`text-body-base text-on-surface w-full rounded-lg bg-[#F1F5F9] p-3 transition-all ${
                        errors.newCategoryName
                          ? "border-error ring-error/20 border-2 bg-red-50/30 ring-2"
                          : "focus:ring-primary/20 border-none focus:ring-2"
                      }`}
                    />
                    {errors.newCategoryName && (
                      <p className="text-error mt-1 text-xs font-medium">
                        ⚠️ {errors.newCategoryName}
                      </p>
                    )}
                  </div>
                )}

                {/* Tahun Berdiri */}
                <div className="space-y-1.5">
                  <label className="font-label-sm text-on-surface-variant">
                    Tahun Berdiri
                  </label>
                  <input
                    id="field-since"
                    type="number"
                    value={formData.since || ""}
                    onChange={(e) =>
                      onChange(
                        "since",
                        e.target.value ? Number(e.target.value) : null,
                      )
                    }
                    placeholder="Contoh: 2018"
                    className="text-body-base text-on-surface focus:ring-primary/20 w-full rounded-lg border-none bg-[#F1F5F9] p-3 focus:ring-2"
                  />
                  {errors.since && (
                    <p className="text-error mt-1 text-xs font-medium">
                      ⚠️ {errors.since}
                    </p>
                  )}
                </div>
              </div>

              {/* Deskripsi Usaha */}
              <div className="mt-4 space-y-1.5">
                <label className="font-label-sm text-on-surface-variant">
                  Deskripsi Usaha <span className="text-error">*</span>
                </label>
                <textarea
                  id="field-description"
                  rows={4}
                  value={formData.description || ""}
                  onChange={(e) => onChange("description", e.target.value)}
                  placeholder="Ceritakan tentang produk unggulan, keunikan, dan sejarah singkat usaha Anda..."
                  className={`text-body-base text-on-surface w-full rounded-lg bg-[#F1F5F9] p-3 transition-all ${
                    errors.description
                      ? "border-error ring-error/20 border-2 bg-red-50/30 ring-2"
                      : "focus:ring-primary/20 border-none focus:ring-2"
                  }`}
                />
                {errors.description && (
                  <p className="text-error mt-1 text-xs font-medium">
                    ⚠️ {errors.description}
                  </p>
                )}
              </div>
            </div>

            {/* SEKSI 2: KONTAK & OPERASIONAL */}
            <div>
              <h3 className="font-headline-md text-headline-md text-primary border-outline-variant/20 mb-4 flex items-center gap-2 border-b pb-2">
                <Icon name="call" className="text-primary text-xl" /> Kontak &
                Jam Operasional
              </h3>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* WhatsApp */}
                <div className="space-y-1.5">
                  <label className="font-label-sm text-on-surface-variant">
                    Nomor WhatsApp <span className="text-error">*</span>
                  </label>
                  <input
                    id="field-phone"
                    type="tel"
                    value={formData.phone || ""}
                    onChange={(e) => onChange("phone", e.target.value)}
                    placeholder="Contoh: 628123456789"
                    className={`text-body-base text-on-surface w-full rounded-lg bg-[#F1F5F9] p-3 transition-all ${
                      errors.phone
                        ? "border-error ring-error/20 border-2 bg-red-50/30 ring-2"
                        : "focus:ring-primary/20 border-none focus:ring-2"
                    }`}
                  />
                  <p className="text-on-surface-variant/70 text-[11px] italic">
                    Gunakan format internasional diawali 628...
                  </p>
                  {errors.phone && (
                    <p className="text-error mt-1 text-xs font-medium">
                      ⚠️ {errors.phone}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="font-label-sm text-on-surface-variant">
                    Email Usaha (Opsional)
                  </label>
                  <input
                    id="field-email"
                    type="email"
                    value={formData.email || ""}
                    onChange={(e) => onChange("email", e.target.value)}
                    placeholder="usaha@pringgodani.desa.id"
                    className={`text-body-base text-on-surface w-full rounded-lg bg-[#F1F5F9] p-3 transition-all ${
                      errors.email
                        ? "border-error ring-error/20 border-2 bg-red-50/30 ring-2"
                        : "focus:ring-primary/20 border-none focus:ring-2"
                    }`}
                  />
                  {errors.email && (
                    <p className="text-error mt-1 text-xs font-medium">
                      ⚠️ {errors.email}
                    </p>
                  )}
                </div>

                {/* Hari Buka */}
                <div className="space-y-1.5">
                  <label className="font-label-sm text-on-surface-variant">
                    Hari Buka
                  </label>
                  <input
                    type="text"
                    value={formData.openDay || ""}
                    onChange={(e) => onChange("openDay", e.target.value)}
                    placeholder="Contoh: Senin - Sabtu"
                    className="text-body-base text-on-surface focus:ring-primary/20 w-full rounded-lg border-none bg-[#F1F5F9] p-3 focus:ring-2"
                  />
                </div>

                {/* Jam Operasional */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <label className="font-label-sm text-on-surface-variant">
                      Jam Buka
                    </label>
                    <input
                      id="field-startTime"
                      type="text"
                      value={formData.startTime || ""}
                      onChange={(e) => onChange("startTime", e.target.value)}
                      placeholder="08:00"
                      className={`text-body-base text-on-surface w-full rounded-lg bg-[#F1F5F9] p-3 transition-all ${
                        errors.startTime
                          ? "border-error ring-error/20 border-2 bg-red-50/30 ring-2"
                          : "focus:ring-primary/20 border-none focus:ring-2"
                      }`}
                    />
                    {errors.startTime && (
                      <p className="text-error mt-1 text-xs font-medium">
                        ⚠️ {errors.startTime}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-label-sm text-on-surface-variant">
                      Jam Tutup
                    </label>
                    <input
                      id="field-endTime"
                      type="text"
                      value={formData.endTime || ""}
                      onChange={(e) => onChange("endTime", e.target.value)}
                      placeholder="17:00"
                      className={`text-body-base text-on-surface w-full rounded-lg bg-[#F1F5F9] p-3 transition-all ${
                        errors.endTime
                          ? "border-error ring-error/20 border-2 bg-red-50/30 ring-2"
                          : "focus:ring-primary/20 border-none focus:ring-2"
                      }`}
                    />
                    {errors.endTime && (
                      <p className="text-error mt-1 text-xs font-medium">
                        ⚠️ {errors.endTime}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* SEKSI 3: LOKASI USAHA & GOOGLE MAPS LINK */}
            <div>
              <h3 className="font-headline-md text-headline-md text-primary border-outline-variant/20 mb-4 flex items-center gap-2 border-b pb-2">
                <Icon name="location_on" className="text-primary text-xl" />{" "}
                Lokasi Usaha
              </h3>

              <div className="space-y-4">
                {/* Alamat Fisik */}
                <div className="space-y-1.5">
                  <label className="font-label-sm text-on-surface-variant">
                    Alamat Lengkap Usaha <span className="text-error">*</span>
                  </label>
                  <textarea
                    id="field-address"
                    rows={2}
                    value={formData.address || ""}
                    onChange={(e) => onChange("address", e.target.value)}
                    placeholder="Dusun Krajan RT 02 RW 01, Desa Pringgodani, Kec. Bantur, Malang"
                    className={`text-body-base text-on-surface w-full rounded-lg bg-[#F1F5F9] p-3 transition-all ${
                      errors.address
                        ? "border-error ring-error/20 border-2 bg-red-50/30 ring-2"
                        : "focus:ring-primary/20 border-none focus:ring-2"
                    }`}
                  />
                  {errors.address && (
                    <p className="text-error mt-1 text-xs font-medium">
                      ⚠️ {errors.address}
                    </p>
                  )}
                </div>

                {/* Link Google Maps */}
                <div className="space-y-1.5">
                  <label className="font-label-sm text-on-surface-variant">
                    Link Google Maps Lokasi Usaha (Opsional)
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      value={formData.mapsUrl || ""}
                      onChange={(e) => {
                        const url = e.target.value;
                        onChange("mapsUrl", url);
                        const { lat, lng } = extractCoordinatesFromUrl(url);
                        if (lat) onChange("latitude", lat);
                        if (lng) onChange("longitude", lng);
                      }}
                      placeholder="https://maps.app.goo.gl/..."
                      className="text-body-base text-on-surface focus:ring-primary/20 w-full rounded-lg border-none bg-[#F1F5F9] p-3 pl-10 focus:ring-2"
                    />
                    <Icon
                      name="link"
                      className="text-on-surface-variant absolute top-3.5 left-3 text-lg"
                    />
                  </div>
                  <p className="text-on-surface-variant/80 text-xs leading-relaxed italic">
                    💡 <strong>Cara mudah mendapatkan link:</strong> Buka
                    aplikasi Google Maps di HP &rarr; Cari toko/lokasi Anda
                    &rarr; Tekan tombol <strong>Bagikan (Share)</strong> &rarr;
                    Salin Link lalu tempelkan di sini. Tautan asli akan tersimpan untuk navigasi langsung.
                  </p>
                </div>
              </div>
            </div>

            {/* SEKSI 4: UPLOAD FOTO SAMPUL & GALERI DINAMIS */}
            <div id="field-coverUrl">
              <h3 className="font-headline-md text-headline-md text-primary border-outline-variant/20 mb-4 flex items-center gap-2 border-b pb-2">
                <Icon name="image" className="text-primary text-xl" /> Media &
                Foto Usaha
              </h3>

              <div className="space-y-6">
                {/* Foto Sampul Utama Upload Box */}
                <div className="space-y-2">
                  <label className="font-label-sm text-on-surface-variant">
                    Foto Sampul Utama / Logo Usaha (Opsional)
                  </label>

                  <input
                    ref={coverFileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        if (onSetCoverFile) {
                          onSetCoverFile(file);
                          onChange("coverUrl", URL.createObjectURL(file));
                        } else {
                          handleFileChange(file, (url) =>
                            onChange("coverUrl", url),
                          );
                        }
                      }
                    }}
                  />

                  {formData.coverUrl ? (
                    <div className="border-outline-variant/30 bg-surface-container-low group relative h-48 max-w-md overflow-hidden rounded-xl border">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={formData.coverUrl}
                        alt="Foto Sampul"
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                          type="button"
                          onClick={() => coverFileInputRef.current?.click()}
                          className="text-on-surface flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-bold shadow-md hover:bg-gray-100"
                        >
                          <Icon name="edit" className="text-sm" /> Ganti Sampul
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (onSetCoverFile) onSetCoverFile(null);
                            onChange("coverUrl", "");
                          }}
                          className="bg-error flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold text-white shadow-md hover:bg-red-700"
                        >
                          <Icon name="delete" className="text-sm" /> Hapus
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => coverFileInputRef.current?.click()}
                      className={`max-w-md cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition-all ${
                        errors.coverUrl
                          ? "border-error ring-error/20 bg-red-50/40 ring-2"
                          : "border-outline-variant/60 hover:border-primary bg-surface-container-low/50 hover:bg-surface-container-low"
                      }`}
                    >
                      <div className="bg-primary/10 text-primary mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full">
                        <Icon name="add_a_photo" className="text-2xl" />
                      </div>
                      <p className="font-label-sm text-primary text-sm font-bold">
                        Klik untuk Unggah Foto Sampul (Opsional)
                      </p>
                      <p className="text-on-surface-variant/70 mt-1 text-xs">
                        Format PNG, JPG, atau WEBP. Jika dikosongkan, gambar default akan digunakan otomatis.
                      </p>
                    </div>
                  )}
                  {errors.coverUrl && (
                    <p className="text-error mt-1 text-xs font-medium">
                      ⚠️ {errors.coverUrl}
                    </p>
                  )}
                </div>

                {/* GALERI FOTO REPEATABLE / DINAMIS */}
                <div className="border-outline-variant/20 space-y-3 border-t pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-label-sm text-on-surface-variant font-bold">
                        Galeri Foto Usaha
                      </label>
                      <p className="text-on-surface-variant/70 text-xs">
                        Tambahkan foto suasana toko, proses produksi, atau
                        dokumentasi usaha.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddGallery}
                      className="bg-secondary/10 text-secondary hover:bg-secondary/20 font-label-sm flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold transition-all"
                    >
                      <Icon name="add_photo_alternate" className="text-base" />{" "}
                      Tambah Foto Galeri
                    </button>
                  </div>

                  {!formData.galleries || formData.galleries.length === 0 ? (
                    <div className="bg-surface-container-low border-outline-variant/40 rounded-lg border border-dashed p-4 text-center">
                      <p className="text-on-surface-variant/80 text-xs">
                        Belum ada foto galeri tambahan.
                      </p>
                      <button
                        type="button"
                        onClick={handleAddGallery}
                        className="text-primary mt-2 inline-flex items-center gap-1 text-xs font-bold hover:underline"
                      >
                        + Unggah Foto Galeri Pertama
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                      {formData.galleries?.map((url, idx) => (
                        <GalleryItemUpload
                          key={idx}
                          index={idx}
                          url={url}
                          onUpdate={(val) => handleGalleryChange(idx, val)}
                          onRemove={() => handleRemoveGallery(idx)}
                          onSetFile={(file) => onSetGalleryFile?.(idx, file)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* SEKSI 5: KATALOG PRODUK DINAMIS */}
            <div>
              <div className="border-outline-variant/30 mb-4 flex items-center justify-between border-b pb-3">
                <h3 className="font-headline-md text-headline-md text-primary flex items-center gap-2">
                  <Icon name="inventory_2" className="text-primary text-xl" />{" "}
                  Daftar Produk Unggulan
                </h3>
                <button
                  type="button"
                  onClick={onAddProduct}
                  className="bg-secondary/10 text-secondary hover:bg-secondary/20 font-label-sm flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-all"
                >
                  <Icon name="add_circle" className="text-base" /> Tambah Produk
                </button>
              </div>

              {!formData.products || formData.products.length === 0 ? (
                <div className="bg-surface-container-low border-outline-variant/40 rounded-lg border border-dashed p-6 text-center">
                  <Icon
                    name="shopping_bag"
                    className="text-on-surface-variant/40 mb-2 text-3xl"
                  />
                  <p className="text-on-surface-variant text-sm font-medium">
                    Belum ada produk yang ditambahkan.
                  </p>
                  <button
                    type="button"
                    onClick={onAddProduct}
                    className="text-primary mt-3 inline-flex items-center gap-1 text-xs font-bold hover:underline"
                  >
                    + Tambah Produk Pertama
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {formData.products?.map((prod, idx) => (
                    <ProductItemUpload
                      key={idx}
                      index={idx}
                      product={prod}
                      onChange={(field, val) =>
                        onProductChange(idx, field, val)
                      }
                      onRemove={() => onRemoveProduct(idx)}
                      onSetFile={(file) => onSetProductFile?.(idx, file)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* ACTION BUTTON — sticky to the bottom of the viewport while
            scrolling the form, so it's always reachable without scrolling
            all the way down (UX #211: previously only sat at the natural
            end of the form, easy to lose track of on a long form). */}
            <div className="bg-surface-container-lowest/95 border-outline-variant/30 sticky bottom-0 z-10 -mx-6 flex justify-end gap-4 border-t px-6 py-4 backdrop-blur-sm md:-mx-8 md:px-8">
              {submitButton ?? (
                <button
                  type="submit"
                  className="bg-primary text-on-primary flex items-center gap-2 rounded-full px-8 py-3 font-bold shadow-lg transition-all hover:opacity-90 active:scale-95"
                >
                  <span>Lihat Pratinjau Tampilan</span>
                  <Icon name="arrow_forward" className="text-lg" />
                </button>
              )}
            </div>
          </form>
        </div>

        {/* RIGHT COLUMN: SIDEBAR GUIDELINES & STATUS */}
        {!hideSidebar && (
          <div className="space-y-6 lg:sticky lg:top-24 lg:col-span-5">
            {/* Panduan Pendaftaran */}
            <div className="bg-primary-container text-on-primary-container rounded-xl p-6 shadow-sm">
              <h4 className="font-headline-md text-label-sm mb-4 flex items-center gap-2 font-bold tracking-wider uppercase">
                <Icon name="gavel" className="text-lg" /> Panduan Pendaftaran UMKM
              </h4>
              <ul className="font-body-base space-y-3 text-xs leading-relaxed">
                <li className="flex gap-2.5">
                  <Icon
                    name="check_circle"
                    className="text-on-primary-container/80 shrink-0 text-base"
                  />
                  <span>
                    Gunakan nama usaha yang jelas dan sesuai lokasi di Desa
                    Pringgodani.
                  </span>
                </li>
                <li className="flex gap-2.5">
                  <Icon
                    name="check_circle"
                    className="text-on-primary-container/80 shrink-0 text-base"
                  />
                  <span>
                    Pastikan nomor HP/WhatsApp aktif agar pembeli dan admin desa
                    dapat menghubungi Anda.
                  </span>
                </li>
                <li className="flex gap-2.5">
                  <Icon
                    name="check_circle"
                    className="text-on-primary-container/80 shrink-0 text-base"
                  />
                  <span>
                    Unggah foto produk & sampul dengan pencahayaan yang terang.
                  </span>
                </li>
                <li className="flex gap-2.5">
                  <Icon
                    name="check_circle"
                    className="text-on-primary-container/80 shrink-0 text-base"
                  />
                  <span>
                    Admin desa akan meninjau setiap pengajuan sebelum
                    dipublikasikan (Maks 24 Jam).
                  </span>
                </li>
              </ul>
            </div>

            {/* Status Pengajuan Terakhir Real Data */}
            <PendingStatusCard type="UMKM" />
          </div>
        )}
      </div>
    </section>
  );
}

// Sub-component: Individual Gallery Upload Box
function GalleryItemUpload({
  index,
  url,
  onUpdate,
  onRemove,
  onSetFile,
}: {
  index: number;
  url: string;
  onUpdate: (url: string) => void;
  onRemove: () => void;
  onSetFile?: (file: File) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (file?: File) => {
    if (!file) return;
    if (onSetFile) {
      onSetFile(file);
      onUpdate(URL.createObjectURL(file));
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          onUpdate(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-surface-container-low border-outline-variant/30 group relative rounded-xl border p-3">
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {url ? (
        <div className="border-outline-variant/20 relative h-36 overflow-hidden rounded-lg border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt={`Galeri ${index + 1}`}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="text-on-surface rounded-full bg-white p-1.5 text-xs hover:bg-gray-100"
              title="Ganti Foto"
            >
              <Icon name="edit" className="text-sm" />
            </button>
            <button
              type="button"
              onClick={() => {
                if (onSetFile) onSetFile(null as any);
                onRemove();
              }}
              className="bg-error rounded-full p-1.5 text-xs text-white hover:bg-red-700"
              title="Hapus Foto"
            >
              <Icon name="delete" className="text-sm" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => fileRef.current?.click()}
          className="border-outline-variant/50 hover:border-primary flex h-36 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-3 text-center transition-colors"
        >
          <Icon
            name="collections"
            className="text-on-surface-variant/50 mb-1 text-2xl"
          />
          <span className="text-primary text-xs font-bold">
            Unggah Foto #{index + 1}
          </span>
        </div>
      )}

      {url && (
        <button
          type="button"
          onClick={onRemove}
          className="bg-error absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full text-xs text-white shadow-md transition-all hover:scale-110"
          title="Hapus Foto"
        >
          ✕
        </button>
      )}
    </div>
  );
}

// Sub-component: Individual Product Item Upload
function ProductItemUpload({
  index,
  product,
  onChange,
  onRemove,
  onSetFile,
}: {
  index: number;
  product: any;
  onChange: (field: string, value: any) => void;
  onRemove: () => void;
  onSetFile?: (file: File) => void;
}) {
  const prodFileRef = useRef<HTMLInputElement>(null);

  const handleFile = (file?: File) => {
    if (!file) return;
    if (onSetFile) {
      onSetFile(file);
      onChange("imageUrl", URL.createObjectURL(file));
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          onChange("imageUrl", e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-surface-container-low border-outline-variant/30 group relative space-y-3 rounded-xl border p-4">
      <div className="flex items-center justify-between">
        <span className="font-label-sm text-primary text-xs font-bold">
          Produk Unggulan #{index + 1}
        </span>
        <button
          type="button"
          onClick={onRemove}
          className="text-error hover:bg-error/10 flex items-center gap-1 rounded-full p-1 text-xs transition-colors"
          title="Hapus Produk"
        >
          <Icon name="delete" className="text-base" />
          <span className="text-xs font-medium">Hapus</span>
        </button>
      </div>

      <input
        ref={prodFileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      <div className="grid grid-cols-1 items-start gap-3 md:grid-cols-4">
        {/* Product Photo Upload Box */}
        <div className="md:col-span-1">
          <label className="font-label-sm text-on-surface-variant mb-1 block text-xs">
            Foto Produk
          </label>
          {product.imageUrl ? (
            <div className="border-outline-variant/30 group/img relative h-28 overflow-hidden rounded-lg border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={product.imageUrl}
                alt={product.name}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center gap-1 bg-black/40 opacity-0 transition-opacity group-hover/img:opacity-100">
                <button
                  type="button"
                  onClick={() => prodFileRef.current?.click()}
                  className="text-on-surface rounded bg-white p-1 text-xs"
                >
                  <Icon name="edit" className="text-xs" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (onSetFile) onSetFile(null as any);
                    onChange("imageUrl", "");
                  }}
                  className="bg-error rounded p-1 text-xs text-white"
                >
                  <Icon name="delete" className="text-xs" />
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => prodFileRef.current?.click()}
              className="border-outline-variant/50 hover:border-primary flex h-28 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed bg-white p-2 text-center transition-colors"
            >
              <Icon
                name="add_a_photo"
                className="text-on-surface-variant/50 mb-1 text-xl"
              />
              <span className="text-primary text-[11px] font-bold">
                Unggah Foto
              </span>
            </div>
          )}
        </div>

        {/* Product Name, Price, Description */}
        <div className="space-y-2 md:col-span-3">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div>
              <label className="font-label-sm text-on-surface-variant text-xs">
                Nama Produk *
              </label>
              <input
                type="text"
                value={product.name}
                onChange={(e) => onChange("name", e.target.value)}
                placeholder="Contoh: Kopi Robusta 250g"
                className="text-on-surface mt-1 w-full rounded-lg border-none bg-white p-2 text-sm"
              />
            </div>
            <div>
              <label className="font-label-sm text-on-surface-variant text-xs">
                Harga (Rp)
              </label>
              <input
                type="number"
                value={product.price || ""}
                onChange={(e) =>
                  onChange(
                    "price",
                    e.target.value ? Number(e.target.value) : null,
                  )
                }
                placeholder="45000"
                className="text-on-surface mt-1 w-full rounded-lg border-none bg-white p-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="font-label-sm text-on-surface-variant text-xs">
              Deskripsi Produk *
            </label>
            <input
              type="text"
              value={product.description}
              onChange={(e) => onChange("description", e.target.value)}
              placeholder="Penjelasan singkat keunggulan produk ini..."
              className="text-on-surface mt-1 w-full rounded-lg border-none bg-white p-2 text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
