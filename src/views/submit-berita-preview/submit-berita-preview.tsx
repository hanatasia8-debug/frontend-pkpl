"use client";

import React from "react";
import { Icon } from "@/shared/ui/icon";
import type { NewsDetailDto } from "@/entities/berita/model/types";
import { ReadingProgressBar } from "@/views/berita-detail/sections/reading-progress-bar";
import { ArticleHeader } from "@/views/berita-detail/sections/article-header";
import { ArticleBody } from "@/views/berita-detail/sections/article-body";
import { ShareBar } from "@/views/berita-detail/sections/share-bar";
import { NewsCard } from "@/entities/berita/ui/news-card";

interface SubmitBeritaPreviewProps {
  previewNewsDto: NewsDetailDto;
  isSubmitting?: boolean;
  onBackToEdit?: () => void;
  onFinalSubmit?: () => void;
  /**
   * When true, hides the sticky "Kembali Edit"/"Konfirmasi & Ajukan" control
   * bar. Used when this component is reused as a read-only live preview
   * outside the submit flow itself (e.g. the admin Pengajuan review modal —
   * an admin reviewing someone else's submission has approve/reject
   * controls elsewhere in that UI, not "back to edit"/"submit").
   */
  readOnly?: boolean;
}

export function SubmitBeritaPreview({
  previewNewsDto,
  isSubmitting = false,
  onBackToEdit,
  onFinalSubmit,
  readOnly = false,
}: SubmitBeritaPreviewProps) {
  return (
    <section className="animate-in fade-in space-y-8 duration-300">
      {/* Floating / Sticky Control Bar */}
      {!readOnly && (
        <div className="bg-surface/90 border-outline-variant/30 sticky top-20 z-40 mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-4 rounded-2xl border p-4 shadow-lg backdrop-blur-md">
          <div className="text-primary flex items-center gap-2 text-sm font-bold">
            <Icon name="visibility" className="text-primary text-xl" />
            <span>
              Pratinjau Live: Halaman Detail Berita Presisi (/berita/
              {previewNewsDto.slug})
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBackToEdit}
              className="border-outline-variant text-on-surface-variant hover:bg-surface-container flex items-center gap-1.5 rounded-full border px-5 py-2 text-xs font-bold transition-all"
            >
              <Icon name="arrow_back" className="text-sm" />
              <span>Kembali Edit</span>
            </button>

            <button
              type="button"
              onClick={onFinalSubmit}
              disabled={isSubmitting}
              className="bg-primary text-on-primary flex items-center gap-1.5 rounded-full px-6 py-2 text-xs font-bold shadow-md transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Mengirim...</span>
                </>
              ) : (
                <>
                  <Icon name="send" className="text-sm" />
                  <span>Konfirmasi & Ajukan</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* EXACT RENDER OF BeritaDetailPage UI (pb-section-padding pt-6) */}
      <div className="pt-4 pb-12">
        <ReadingProgressBar />

        <article className="px-gutter bg-surface-container-lowest border-outline-variant/20 mx-auto max-w-4xl rounded-3xl border p-6 shadow-sm sm:p-12">
          <ArticleHeader news={previewNewsDto} />
          <ArticleBody news={previewNewsDto} />
          <ShareBar
            title={previewNewsDto.title}
            summary={previewNewsDto.summary}
          />
        </article>

        {/* Directory Card Preview */}
        <div className="border-outline-variant/20 px-gutter mx-auto mt-12 max-w-4xl border-t pt-8">
          <h3 className="font-headline-md text-headline-md text-primary mb-4">
            Tampilan Kartu Direktori (/berita)
          </h3>
          <div className="max-w-sm">
            <NewsCard news={previewNewsDto} variant="listing" />
          </div>
        </div>
      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="border-outline-variant/30 mx-auto flex max-w-4xl justify-between gap-4 border-t pt-6">
        <button
          type="button"
          onClick={onBackToEdit}
          className="border-outline-variant text-on-surface-variant hover:bg-surface-container flex items-center gap-2 rounded-full border px-8 py-3 font-bold transition-all"
        >
          <Icon name="arrow_back" className="text-lg" />
          <span>Kembali ke Editor</span>
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
              <span>Mengirim Berita...</span>
            </>
          ) : (
            <>
              <Icon name="send" className="text-lg" />
              <span>Konfirmasi & Ajukan Berita</span>
            </>
          )}
        </button>
      </div>
    </section>
  );
}
