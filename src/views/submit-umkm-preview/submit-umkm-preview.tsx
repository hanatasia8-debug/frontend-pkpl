"use client";

import React from "react";
import { Icon } from "@/shared/ui/icon";
import type { UmkmDetailDto } from "@/entities/umkm/model/types";
import { UmkmHero } from "@/views/umkm-detail/sections/umkm-hero";
import { UmkmInfoSidebar } from "@/views/umkm-detail/sections/umkm-info-sidebar";
import { UmkmProductsSection } from "@/views/umkm-detail/sections/umkm-products-section";
import { UmkmGallerySection } from "@/views/umkm-detail/sections/umkm-gallery-section";
import { UmkmCard } from "@/entities/umkm/ui/umkm-card";

interface SubmitUmkmPreviewProps {
  previewDetailDto: UmkmDetailDto;
  isSubmitting?: boolean;
  submittingText?: string;
  onBackToEdit?: () => void;
  onFinalSubmit?: () => void;
  /**
   * When true, hides the "Ubah Isian"/"Kirim Pendaftaran UMKM" submit-flow
   * controls. Used when reused as a read-only preview outside the submit
   * flow (e.g. the admin Pengajuan review modal).
   */
  readOnly?: boolean;
}

export function SubmitUmkmPreview({
  previewDetailDto,
  isSubmitting = false,
  submittingText,
  onBackToEdit,
  onFinalSubmit,
  readOnly = false,
}: SubmitUmkmPreviewProps) {
  return (
    <section className="animate-in fade-in space-y-6 duration-300">
      {/* Top Banner Notice */}
      <div className="bg-surface-container-low border-outline-variant/30 flex items-center justify-between rounded-xl border p-4">
        <div className="text-primary flex items-center gap-2 text-sm font-bold">
          <Icon name="visibility" className="text-primary text-lg" />
          <span>Mode Pratinjau: Tampilan Profil Halaman Detail UMKM Anda</span>
        </div>
        {!readOnly && (
          <button
            onClick={onBackToEdit}
            className="text-primary flex items-center gap-1 text-xs font-bold hover:underline"
          >
            <Icon name="edit" className="text-sm" /> Ubah Isian
          </button>
        )}
      </div>

      {/* EXACT RENDER OF UmkmDetailPage UI COMPONENTS */}
      <div className="bg-surface-container-lowest border-outline-variant/20 overflow-hidden rounded-2xl border shadow-sm">
        <UmkmHero umkm={previewDetailDto} />

        <div
          className={`grid gap-8 p-6 md:p-8 ${readOnly ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-12 lg:gap-10"}`}
        >
          <div className={`space-y-10 ${readOnly ? "w-full" : "lg:col-span-8"}`}>
            <section>
              <div className="border-outline-variant/30 mb-4 flex items-center gap-2.5 border-b pb-3">
                <div className="bg-primary/10 text-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-xl">
                  <Icon name="storefront" className="text-base" />
                </div>
                <h2 className="font-headline-md text-primary text-lg font-bold sm:text-xl">
                  Tentang Usaha
                </h2>
              </div>
              <p className="font-body-base text-on-surface-variant leading-relaxed">
                {previewDetailDto.description}
              </p>
            </section>

            <UmkmProductsSection
              products={previewDetailDto.products}
              umkmName={previewDetailDto.name}
              phone={previewDetailDto.whatsappNumber || previewDetailDto.phone || ""}
            />
          </div>

          <div className={readOnly ? "w-full" : "lg:col-span-4"}>
            <UmkmInfoSidebar umkm={previewDetailDto} />
          </div>
        </div>
      </div>

      <UmkmGallerySection
        images={previewDetailDto.gallery}
        umkmName={previewDetailDto.name}
      />

      {/* PREVIEW DIRECTORY CARD */}
      <div className="bg-surface-container-lowest border-outline-variant/30 mt-8 space-y-4 rounded-xl border p-6">
        <h3 className="font-headline-md text-headline-md text-primary">
          Pratinjau Kartu di Direktori UMKM
        </h3>
        <div className="max-w-sm">
          <UmkmCard umkm={previewDetailDto} />
        </div>
      </div>

      {/* STEP 2 BOTTOM ACTIONS */}
      {!readOnly && (
        <div className="border-outline-variant/30 flex justify-between gap-4 border-t pt-6">
          <button
            type="button"
            onClick={onBackToEdit}
            className="border-outline-variant text-on-surface-variant hover:bg-surface-container flex items-center gap-2 rounded-full border px-8 py-3 font-bold transition-all"
          >
            <Icon name="arrow_back" className="text-lg" />
            <span>Kembali Edit</span>
          </button>

          <button
            type="button"
            onClick={onFinalSubmit}
            disabled={isSubmitting}
            className="bg-primary text-on-primary flex items-center gap-2 rounded-full px-10 py-3 font-bold shadow-lg transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>{submittingText || "Mengirim Pengajuan..."}</span>
              </>
            ) : (
              <>
                <Icon name="send" className="text-lg" />
                <span>Kirim Pendaftaran UMKM</span>
              </>
            )}
          </button>
        </div>
      )}
    </section>
  );
}
