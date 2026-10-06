"use client";

import { Icon } from "@/shared/ui/icon";
import { formatFileSize, type CompressionDetails } from "@/shared/utils/image-compression";

interface UploadConfirmationModalProps {
  isOpen: boolean;
  title?: string;
  details: CompressionDetails | null;
  isUploading: boolean;
  onConfirm: () => Promise<void> | void;
  onCancel: () => void;
}

export function UploadConfirmationModal({
  isOpen,
  title = "Konfirmasi Unggah Berkas",
  details,
  isUploading,
  onConfirm,
  onCancel,
}: UploadConfirmationModalProps) {
  if (!isOpen || !details) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={!isUploading ? onCancel : undefined}
      />

      {/* Modal Card */}
      <div className="bg-surface-container-lowest border-outline-variant/30 animate-in fade-in zoom-in-95 relative z-10 w-full max-w-lg overflow-hidden rounded-3xl border p-6 shadow-2xl duration-200 sm:p-7">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-2.5">
            <div className="bg-primary/10 text-primary flex h-9 w-9 items-center justify-center rounded-xl">
              <Icon name="compress" className="text-xl" />
            </div>
            <div>
              <h3 className="font-headline-md text-primary text-base font-bold sm:text-lg">
                {title}
              </h3>
              <p className="text-on-surface-variant text-xs">
                Gambar telah berhasil dioptimasi di browser Anda.
              </p>
            </div>
          </div>
          {!isUploading && (
            <button
              type="button"
              onClick={onCancel}
              className="text-on-surface-variant hover:bg-surface-container rounded-full p-1.5 transition"
              aria-label="Tutup"
            >
              <Icon name="close" className="text-xl" />
            </button>
          )}
        </div>

        {/* Body Content */}
        <div className="mt-5 space-y-5">
          {/* Image Preview */}
          <div className="bg-surface-container border-outline-variant/30 relative flex max-h-56 w-full items-center justify-center overflow-hidden rounded-2xl border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={details.previewUrl}
              alt="Pratinjau Hasil Kompresi"
              className="max-h-56 w-full object-contain p-2"
            />
            {details.savedPercentage > 0 && (
              <span className="bg-primary text-on-primary absolute top-3 right-3 rounded-full px-2.5 py-1 text-[11px] font-bold shadow-md">
                Hemat {details.savedPercentage}%
              </span>
            )}
          </div>

          {/* Compression Stats Grid */}
          <div className="bg-surface-container-low border-outline-variant/20 grid grid-cols-2 gap-3 rounded-2xl border p-4 text-xs">
            <div>
              <span className="text-on-surface-variant/80 block text-[11px] font-semibold uppercase">
                Ukuran Asli
              </span>
              <p className="text-on-surface mt-0.5 font-mono text-sm font-bold line-through opacity-70">
                {formatFileSize(details.originalSize)}
              </p>
              <span className="text-on-surface-variant text-[10px] truncate block">
                {details.originalName}
              </span>
            </div>

            <div>
              <span className="text-primary block text-[11px] font-bold uppercase">
                Ukuran Setelah Kompresi
              </span>
              <p className="text-primary mt-0.5 font-mono text-sm font-bold">
                {formatFileSize(details.compressedSize)}
              </p>
              <span className="text-primary/80 text-[10px] font-semibold block">
                Format WebP Tajam
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            disabled={isUploading}
            onClick={onCancel}
            className="border-outline-variant hover:bg-surface-container text-on-surface disabled:opacity-50 flex items-center justify-center gap-1.5 rounded-2xl border px-5 py-3 text-xs font-bold transition"
          >
            <Icon name="close" className="text-base" />
            <span>Batal / Ganti Berkas</span>
          </button>

          <button
            type="button"
            disabled={isUploading}
            onClick={onConfirm}
            className="bg-primary text-on-primary hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2 rounded-2xl px-6 py-3 text-xs font-bold shadow-md transition"
          >
            {isUploading ? (
              <>
                <Icon name="sync" className="animate-spin text-base" />
                <span>Mengunggah ke Storage...</span>
              </>
            ) : (
              <>
                <Icon name="cloud_upload" className="text-base" />
                <span>Ya, Unggah ke Storage</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
