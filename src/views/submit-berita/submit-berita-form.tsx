"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useRef, useState, useEffect } from "react";
import { Icon } from "@/shared/ui/icon";
import type { NewsCategoryDto } from "@/entities/berita/model/types";
import type { RegisterNewsDTO } from "@/entities/berita/model/register-news.schema";

import { PendingStatusCard } from "@/features/submission-tracker/ui/pending-status-card";

interface SubmitBeritaFormProps {
  formData: Partial<RegisterNewsDTO>;
  categories: NewsCategoryDto[];
  errors: Record<string, string>;
  onChange: (field: keyof RegisterNewsDTO, value: any) => void;
  onAddBlock: () => void;
  onRemoveBlock: (index: number) => void;
  onBlockChange: (index: number, field: string, value: any) => void;
  onAddGalleryImage: () => void;
  onRemoveGalleryImage: (index: number) => void;
  onGalleryImageChange: (index: number, field: string, value: any) => void;
  onClearDraft: () => void;
  onSubmitStep: (e: React.FormEvent) => void;
  hideSidebar?: boolean;
  onSetCoverFile?: (file: File | null) => void;
  onSetBlockFile?: (index: number, file: File | null) => void;
  onSetGalleryFile?: (index: number, file: File | null) => void;
  /** See `SubmitUmkmForm`'s `draftBanner` prop — same override behavior. */
  draftBanner?: React.ReactNode | null;
  /** See `SubmitUmkmForm`'s `submitButton` prop — same override behavior. */
  submitButton?: React.ReactNode;
}

export function SubmitBeritaForm({
  formData,
  categories,
  errors,
  onChange,
  onAddBlock,
  onRemoveBlock,
  onBlockChange,
  onAddGalleryImage,
  onRemoveGalleryImage,
  onGalleryImageChange,
  onClearDraft,
  onSubmitStep,
  hideSidebar = false,
  onSetCoverFile,
  onSetBlockFile,
  onSetGalleryFile,
  draftBanner,
  submitButton,
}: SubmitBeritaFormProps) {
  const coverFileInputRef = useRef<HTMLInputElement>(null);

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  // Helper to scroll and focus field
  const scrollToField = (fieldId: string) => {
    const el = document.getElementById(`field-${fieldId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      if (typeof el.focus === "function") el.focus();
    }
  };

  // Helper to read file to Data URL
  const handleFileChange = (
    file: File | undefined,
    onSuccess: (dataUrl: string) => void,
  ) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        onSuccess(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const hasErrors = Object.keys(errors).length > 0;
  const isStandard = formData.newsTypeId === "STANDARD" || !formData.newsTypeId;

  return (
    <div
      className={
        hideSidebar
          ? "w-full"
          : "grid grid-cols-1 items-start gap-8 lg:grid-cols-12"
      }
    >
      {/* LEFT COLUMN: FORM EDITOR */}
      <div
        className={`bg-surface-container-lowest border-outline-variant/20 rounded-xl border p-6 shadow-sm md:p-8 ${hideSidebar ? "w-full" : "lg:col-span-7"}`}
      >
        {/* ERROR SUMMARY BANNER */}
        {hasErrors && (
          <div className="animate-in fade-in slide-in-from-top-2 mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-900 shadow-sm">
            <Icon
              name="error"
              className="mt-0.5 shrink-0 text-xl text-red-600"
            />
            <div className="flex-1">
              <h4 className="text-sm font-bold text-red-800">
                Beberapa Kolom Wajib Belum Diisi dengan Benar:
              </h4>
              <p className="mt-0.5 text-xs text-red-700">
                Klik pada nama kolom di bawah ini untuk langsung menuju lokasi
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

        {/* DRAFT BANNER (overridable — see `draftBanner` prop) */}
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

        <form onSubmit={onSubmitStep} className="space-y-6" noValidate>
          {/* TEMPLATE BERITA SELECTOR */}
          <div className="space-y-1.5">
            <label className="font-label-sm text-label-sm text-on-surface block">
              Template Berita <span className="text-error">*</span>
            </label>
            <select
              id="field-newsTypeId"
              value={formData.newsTypeId || "STANDARD"}
              onChange={(e) =>
                onChange("newsTypeId", e.target.value as "STANDARD" | "GALLERY")
              }
              className="text-body-base text-primary focus:ring-primary/20 w-full rounded-lg border-none bg-[#F1F5F9] p-3 font-bold focus:ring-2"
            >
              <option value="STANDARD">
                Berita Standard / Artikel Teks (Default)
              </option>
              <option value="GALLERY">
                Berita Gallery / Galeri Foto Komunitas
              </option>
            </select>
            <p className="text-on-surface-variant text-[12px]">
              {isStandard
                ? "Template Standard cocok untuk berita narasi, laporan kegiatan, atau pengumuman dengan paragraf."
                : "Template Gallery cocok untuk dokumentasi foto kegiatan desa, lomba, atau album acara."}
            </p>
          </div>

          {/* JUDUL BERITA */}
          <div className="space-y-1.5">
            <label className="font-label-sm text-label-sm text-on-surface block">
              Judul Berita <span className="text-error">*</span>
            </label>
            <input
              id="field-title"
              type="text"
              value={formData.title || ""}
              onChange={(e) => onChange("title", e.target.value)}
              placeholder="Contoh: Kerja Bakti Pembersihan Saluran Air Dusun Krajan"
              className={`text-body-base text-on-surface w-full rounded-lg bg-[#F1F5F9] p-3 transition-all ${
                errors.title
                  ? "border-error ring-error/20 border-2 bg-red-50/30 ring-2"
                  : "focus:ring-primary/20 border-none focus:ring-2"
              }`}
            />
            {errors.title && (
              <p className="text-error mt-1 text-xs font-medium">
                ⚠️ {errors.title}
              </p>
            )}
          </div>

          {/* KATEGORI, PENULIS, WHATSAPP */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* Kategori */}
            <div className="space-y-1.5">
              <label className="font-label-sm text-label-sm text-on-surface block">
                Kategori <span className="text-error">*</span>
              </label>
              <select
                id="field-newsCategoryId"
                value={formData.newsCategoryId || ""}
                onChange={(e) => onChange("newsCategoryId", e.target.value)}
                className={`text-body-base text-on-surface w-full rounded-lg bg-[#F1F5F9] p-3 transition-all ${
                  errors.newsCategoryId
                    ? "border-error ring-error/20 border-2 bg-red-50/30 ring-2"
                    : "focus:ring-primary/20 border-none focus:ring-2"
                }`}
              >
                <option value="">-- Pilih Kategori --</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
                <option value="other">Lainnya (Kategori Baru)</option>
              </select>
              {errors.newsCategoryId && (
                <p className="text-error mt-1 text-xs font-medium">
                  ⚠️ {errors.newsCategoryId}
                </p>
              )}
            </div>

            {/* Nama Penulis */}
            <div className="space-y-1.5">
              <label className="font-label-sm text-label-sm text-on-surface block">
                Nama Penulis <span className="text-error">*</span>
              </label>
              <input
                id="field-authorName"
                type="text"
                value={formData.authorName || ""}
                onChange={(e) => onChange("authorName", e.target.value)}
                placeholder="Nama Lengkap Penulis"
                className={`text-body-base text-on-surface w-full rounded-lg bg-[#F1F5F9] p-3 transition-all ${
                  errors.authorName
                    ? "border-error ring-error/20 border-2 bg-red-50/30 ring-2"
                    : "focus:ring-primary/20 border-none focus:ring-2"
                }`}
              />
              {errors.authorName && (
                <p className="text-error mt-1 text-xs font-medium">
                  ⚠️ {errors.authorName}
                </p>
              )}
            </div>

            {/* WhatsApp */}
            <div className="space-y-1.5">
              <label className="font-label-sm text-label-sm text-on-surface block">
                Nomor WhatsApp <span className="text-error">*</span>
              </label>
              <input
                id="field-phone"
                type="tel"
                value={formData.phone || ""}
                onChange={(e) => onChange("phone", e.target.value)}
                placeholder="081234567890"
                className={`text-body-base text-on-surface w-full rounded-lg bg-[#F1F5F9] p-3 transition-all ${
                  errors.phone
                    ? "border-error ring-error/20 border-2 bg-red-50/30 ring-2"
                    : "focus:ring-primary/20 border-none focus:ring-2"
                }`}
              />
              {errors.phone && (
                <p className="text-error mt-1 text-xs font-medium">
                  ⚠️ {errors.phone}
                </p>
              )}
            </div>
          </div>

          {/* Kategori Baru (jika "other") */}
          {formData.newsCategoryId === "other" && (
            <div className="space-y-1.5">
              <label className="font-label-sm text-label-sm text-on-surface block">
                Nama Kategori Baru <span className="text-error">*</span>
              </label>
              <input
                id="field-newCategoryName"
                type="text"
                value={formData.newCategoryName || ""}
                onChange={(e) => onChange("newCategoryName", e.target.value)}
                placeholder="Contoh: Pemuda & Olahraga"
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

          {/* MEDIA & FOTO UTAMA UPLOAD BOX */}
          <div
            id="field-coverUrl"
            className="bg-surface-container-low border-outline-variant/20 space-y-3 rounded-xl border p-6"
          >
            <h3 className="font-headline-md text-label-sm text-primary font-bold tracking-wider uppercase">
              Media & Foto Utama <span className="text-error">*</span>
            </h3>

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
                    handleFileChange(file, (url) => onChange("coverUrl", url));
                  }
                }
              }}
            />

            {isMounted && formData.coverUrl ? (
              <div className="border-outline-variant/30 bg-surface-container-low group relative h-56 max-w-full overflow-hidden rounded-xl border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={formData.coverUrl}
                  alt="Foto Cover Utama"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => coverFileInputRef.current?.click()}
                    className="text-on-surface flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-bold shadow-md hover:bg-gray-100"
                  >
                    <Icon name="edit" className="text-sm" /> Ganti Cover
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
                className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-all ${
                  errors.coverUrl
                    ? "border-error ring-error/20 bg-red-50/40 ring-2"
                    : "border-outline-variant hover:border-primary bg-surface-container-lowest hover:bg-surface-container-low"
                }`}
              >
                <Icon name="upload" className="text-outline mb-2 text-[48px]" />
                <p className="text-on-surface font-label-sm text-label-sm font-bold">
                  Klik untuk unggah foto cover utama
                </p>
                <p className="text-on-surface-variant mt-1 text-[12px]">
                  Format: JPG, PNG, WEBP (Maks 5MB)
                </p>
              </div>
            )}
            {errors.coverUrl && (
              <p className="text-error mt-1 text-xs font-medium">
                ⚠️ {errors.coverUrl}
              </p>
            )}

            <div>
              <label className="font-label-sm text-on-surface-variant mb-1 block text-xs">
                Keterangan Foto Utama (Caption)
              </label>
              <input
                type="text"
                value={formData.coverCaption || ""}
                onChange={(e) => onChange("coverCaption", e.target.value)}
                placeholder="Contoh: Suasana warga bekerja bakti di Dusun Krajan (Foto: Dokumentasi Warga)"
                className="bg-surface-container-lowest text-on-surface w-full rounded-lg border-none p-2.5 text-sm"
              />
            </div>
          </div>

          {/* TEMPLATE DYNAMIC CONTENT: STANDARD (PARAGRAPH BLOCKS) vs GALLERY */}
          {isStandard ? (
            <div
              id="field-blocks"
              className="border-outline-variant/20 space-y-4 border-t pt-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-headline-md text-label-sm text-primary font-bold tracking-wider uppercase">
                  Isi Berita (Paragraf & Sub-bab){" "}
                  <span className="text-error">*</span>
                </h3>
                <button
                  type="button"
                  onClick={onAddBlock}
                  className="text-secondary font-label-sm bg-secondary/10 flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold hover:underline"
                >
                  <Icon name="add_circle" className="text-base" /> Tambah
                  Sub-bab
                </button>
              </div>

              {errors.blocks && (
                <p className="text-error text-xs font-medium">
                  ⚠️ {errors.blocks}
                </p>
              )}

              {!formData.blocks || formData.blocks.length === 0 ? (
                <div className="bg-surface-container-low border-outline-variant/40 rounded-lg border border-dashed p-6 text-center">
                  <p className="text-on-surface-variant text-sm">
                    Belum ada paragraf berita.
                  </p>
                  <button
                    type="button"
                    onClick={onAddBlock}
                    className="text-primary mt-2 inline-flex items-center gap-1 text-xs font-bold hover:underline"
                  >
                    + Tambah Sub-bab Paragraf Pertama
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {isMounted &&
                    formData.blocks?.map((block, idx) => (
                      <ArticleBlockItemUpload
                        key={idx}
                        index={idx}
                        block={block}
                        onChange={(field, value) =>
                          onBlockChange(idx, field, value)
                        }
                        onRemove={() => onRemoveBlock(idx)}
                        onSetFile={(file) => onSetBlockFile?.(idx, file)}
                      />
                    ))}
                </div>
              )}
            </div>
          ) : (
            <div
              id="field-blocks"
              className="border-outline-variant/20 space-y-4 border-t pt-4"
            >
              <div className="flex items-center justify-between">
                <span className="font-title-sm text-on-surface text-sm font-bold">
                  Galeri Foto Berita
                </span>
                {formData.galleryImages &&
                  formData.galleryImages.length > 0 && (
                    <button
                      type="button"
                      onClick={onAddGalleryImage}
                      className="text-primary hover:bg-primary/10 flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold transition-colors"
                    >
                      <Icon name="add" className="text-sm" /> Tambah Foto
                    </button>
                  )}
              </div>

              {!formData.galleryImages ||
              formData.galleryImages.length === 0 ? (
                <div className="border-outline-variant/20 bg-surface-container-lowest rounded-xl border p-4 text-center">
                  <p className="text-on-surface-variant text-xs">
                    Belum ada foto galeri.
                  </p>
                  <button
                    type="button"
                    onClick={onAddGalleryImage}
                    className="text-primary mt-2 inline-flex items-center gap-1 text-xs font-bold hover:underline"
                  >
                    + Unggah Foto Galeri Pertama
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {isMounted &&
                    formData.galleryImages?.map((img, idx) => (
                      <GalleryImageItemUpload
                        key={idx}
                        index={idx}
                        item={img}
                        onChange={(field, value) =>
                          onGalleryImageChange(idx, field, value)
                        }
                        onRemove={() => onRemoveGalleryImage(idx)}
                        onSetFile={(file) => onSetGalleryFile?.(idx, file)}
                      />
                    ))}
                </div>
              )}
            </div>
          )}

          {/* ACTION BUTTON — sticky to the bottom of the viewport while
              scrolling the form (see submit-umkm-form.tsx for the same
              #211 fix). */}
          <div className="bg-surface-container-lowest/95 border-outline-variant/20 sticky bottom-0 z-10 -mx-6 flex justify-end border-t px-6 py-4 backdrop-blur-sm md:-mx-8 md:px-8">
            {submitButton ?? (
              <button
                type="submit"
                className="bg-primary text-on-primary flex w-full items-center justify-center gap-2 rounded-full px-8 py-3 font-bold shadow-lg transition-all hover:opacity-90 active:scale-95 sm:w-auto"
              >
                <Icon name="visibility" className="text-lg" />
                <span>Pratinjau Berita</span>
              </button>
            )}
          </div>
        </form>
      </div>

      {/* RIGHT COLUMN: SIDEBAR GUIDELINES & STATUS */}
      {!hideSidebar && (
        <div className="space-y-6 lg:sticky lg:top-24 lg:col-span-5">
          {/* Panduan Penulisan */}
          <div className="bg-primary-container text-on-primary-container rounded-xl p-6 shadow-sm">
            <h4 className="font-headline-md text-label-sm mb-4 flex items-center gap-2 font-bold tracking-wider uppercase">
              <Icon name="gavel" className="text-lg" /> Panduan Penulisan Berita
            </h4>
            <ul className="font-body-base space-y-3 text-xs leading-relaxed">
              <li className="flex gap-2.5">
                <Icon
                  name="check_circle"
                  className="text-on-primary-container/80 shrink-0 text-base"
                />
                <span>
                  Gunakan Bahasa Indonesia yang santun, jelas, dan sesuai fakta.
                </span>
              </li>
              <li className="flex gap-2.5">
                <Icon
                  name="check_circle"
                  className="text-on-primary-container/80 shrink-0 text-base"
                />
                <span>
                  Pastikan kebenaran lokasi, tanggal, dan nama warga yang
                  diliput.
                </span>
              </li>
              <li className="flex gap-2.5">
                <Icon
                  name="check_circle"
                  className="text-on-primary-container/80 shrink-0 text-base"
                />
                <span>
                  Unggah foto dengan pencahayaan terang dan sudut gambar yang
                  sopan.
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
          <PendingStatusCard type="NEWS" />
        </div>
      )}
    </div>
  );
}

// Sub-component: Article Block Upload Item
function ArticleBlockItemUpload({
  index,
  block,
  onChange,
  onRemove,
  onSetFile,
}: {
  index: number;
  block: {
    subHeading?: string | null;
    content?: string;
    imageUrl?: string | null;
  };
  onChange: (field: string, value: any) => void;
  onRemove: () => void;
  onSetFile?: (file: File) => void;
}) {
  const blockFileRef = useRef<HTMLInputElement>(null);

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
    <div className="border-outline-variant/20 bg-surface-container-lowest group relative space-y-3 rounded-xl border p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-primary text-xs font-bold">
          Sub-bab #{index + 1}
        </span>
        <button
          type="button"
          onClick={onRemove}
          className="text-error hover:bg-error/10 flex items-center gap-1 rounded-full p-1 text-xs transition-colors"
        >
          <Icon name="delete" className="text-sm" /> Hapus
        </button>
      </div>

      <div>
        <label className="font-label-sm text-on-surface-variant mb-1 block text-xs">
          Sub-judul (Opsional)
        </label>
        <input
          type="text"
          value={block.subHeading || ""}
          onChange={(e) => onChange("subHeading", e.target.value)}
          placeholder="Sub-judul bagian ini..."
          className="text-on-surface w-full rounded-lg border-none bg-[#F1F5F9] p-2.5 text-sm"
        />
      </div>

      <div>
        <label className="font-label-sm text-on-surface-variant mb-1 block text-xs">
          Isi Paragraf *
        </label>
        <textarea
          rows={3}
          value={block.content || ""}
          onChange={(e) => onChange("content", e.target.value)}
          placeholder="Tuliskan paragraf penjelasan berita di sini..."
          className="text-on-surface w-full rounded-lg border-none bg-[#F1F5F9] p-2.5 text-sm leading-relaxed"
        />
      </div>

      {/* Block Image (Opsional) */}
      <div>
        <label className="font-label-sm text-on-surface-variant mb-1 block text-xs">
          Foto Pendukung Paragraf (Opsional)
        </label>
        <input
          ref={blockFileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        {block.imageUrl ? (
          <div className="border-outline-variant/30 group/img relative h-28 max-w-xs overflow-hidden rounded-lg border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={block.imageUrl}
              alt="Foto Paragraf"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center gap-1 bg-black/40 opacity-0 transition-opacity group-hover/img:opacity-100">
              <button
                type="button"
                onClick={() => blockFileRef.current?.click()}
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
          <button
            type="button"
            onClick={() => blockFileRef.current?.click()}
            className="text-secondary inline-flex items-center gap-1 text-xs font-bold hover:underline"
          >
            + Sisipkan Foto pada Paragraf Ini
          </button>
        )}
      </div>
    </div>
  );
}

// Sub-component: Gallery Image Item Upload
function GalleryImageItemUpload({
  index,
  item,
  onChange,
  onRemove,
  onSetFile,
}: {
  index: number;
  item: { imageUrl?: string; imageDescription?: string | null };
  onChange: (field: string, value: any) => void;
  onRemove: () => void;
  onSetFile?: (file: File) => void;
}) {
  const galFileRef = useRef<HTMLInputElement>(null);

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
    <div className="border-outline-variant/20 bg-surface-container-lowest group relative space-y-2 rounded-xl border p-3 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-primary text-xs font-bold">
          Foto Galeri #{index + 1}
        </span>
        <button
          type="button"
          onClick={onRemove}
          className="text-error hover:bg-error/10 rounded-full p-1 text-xs transition-colors"
        >
          <Icon name="delete" className="text-sm" />
        </button>
      </div>

      <input
        ref={galFileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {item.imageUrl ? (
        <div className="border-outline-variant/20 relative h-32 overflow-hidden rounded-lg border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.imageUrl}
            alt={`Foto Galeri ${index + 1}`}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              type="button"
              onClick={() => galFileRef.current?.click()}
              className="text-on-surface rounded-full bg-white p-1.5 text-xs"
            >
              <Icon name="edit" className="text-sm" />
            </button>
            <button
              type="button"
              onClick={onRemove}
              className="bg-error rounded-full p-1.5 text-xs text-white"
            >
              <Icon name="delete" className="text-sm" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => galFileRef.current?.click()}
          className="border-outline-variant/50 hover:border-primary flex h-32 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed bg-[#F1F5F9] p-3 text-center transition-colors"
        >
          <Icon
            name="add_a_photo"
            className="text-on-surface-variant/50 mb-1 text-2xl"
          />
          <span className="text-primary text-xs font-bold">
            Unggah Foto Galeri
          </span>
        </div>
      )}

      <div>
        <label className="font-label-sm text-on-surface-variant mb-0.5 block text-[11px]">
          Deskripsi Foto
        </label>
        <input
          type="text"
          value={item.imageDescription || ""}
          onChange={(e) => onChange("imageDescription", e.target.value)}
          placeholder="Keterangan singkat foto..."
          className="text-on-surface w-full rounded-lg border-none bg-[#F1F5F9] p-2 text-xs"
        />
      </div>
    </div>
  );
}
