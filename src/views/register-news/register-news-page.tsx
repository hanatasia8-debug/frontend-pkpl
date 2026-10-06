"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/shared/ui/icon";
import { BeritaService } from "@/entities/berita/api/berita.service";
import type {
  NewsCategoryDto,
  NewsDetailDto,
} from "@/entities/berita/model/types";
import {
  registerNewsSchema,
  type RegisterNewsDTO,
} from "@/entities/berita/model/register-news.schema";
import { useRegisterNewsDraft } from "@/features/register-news/model/use-register-news-draft";
import { SubmitBeritaForm } from "@/views/submit-berita/submit-berita-form";
import { SubmitBeritaPreview } from "@/views/submit-berita-preview/submit-berita-preview";
import { generateAutoExcerpt } from "@/shared/utils/news-excerpt.helper";
import { useSubmissionTracker } from "@/features/submission-tracker/model/use-submission-tracker";
import { apiClient } from "@/shared/api/axios-instance";
import type { ApiSuccessBody } from "@/shared/api/response";
import { compressImage, type ImagePreset } from "@/shared/utils/image-compression";

interface RegisterNewsPageProps {
  categories: NewsCategoryDto[];
}

export function RegisterNewsPage({ categories }: RegisterNewsPageProps) {
  const router = useRouter();
  const { savePendingSubmission } = useSubmissionTracker("NEWS");
  const {
    formData,
    setFormData,
    coverFile,
    setCoverFile,
    blockFiles,
    setBlockFile,
    galleryFiles,
    setGalleryFile,
    clearDraft,
  } = useRegisterNewsDraft();

  const [activeStep, setActiveStep] = useState<1 | 2>(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const uploadSingleFile = async (
    file: File,
    preset: ImagePreset = "banner",
  ): Promise<string> => {
    const compressedFile = await compressImage(file, preset);
    const formData = new FormData();
    formData.append("file", compressedFile);
    // See admin-berita-editor.tsx for why this goes through apiClient's
    // relative "/api" path instead of `${hostname}:3000`.
    const { data } = await apiClient.post<ApiSuccessBody<{ url: string }>>(
      "/uploads?category=news",
      formData,
      { timeout: 60000 },
    );
    return data.data.url;
  };

  // Field change handler
  const handleChange = (field: keyof RegisterNewsDTO, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  // Article Block dynamic array handlers
  const handleAddBlock = () => {
    const currentBlocks = formData.blocks || [];
    handleChange("blocks", [
      ...currentBlocks,
      {
        subHeading: "",
        content: "",
        imageUrl: "",
        sortOrder: currentBlocks.length,
      },
    ]);
  };

  const handleRemoveBlock = (index: number) => {
    const currentBlocks = formData.blocks || [];
    handleChange(
      "blocks",
      currentBlocks.filter((_, i) => i !== index),
    );
    setBlockFile(index, null);
  };

  const handleBlockChange = (index: number, field: string, value: any) => {
    const currentBlocks = [...(formData.blocks || [])];
    currentBlocks[index] = {
      ...currentBlocks[index],
      [field]: value,
    };
    handleChange("blocks", currentBlocks);
  };

  // Gallery Images dynamic array handlers
  const handleAddGalleryImage = () => {
    const currentGallery = formData.galleryImages || [];
    handleChange("galleryImages", [
      ...currentGallery,
      { imageUrl: "", imageDescription: "", sortOrder: currentGallery.length },
    ]);
  };

  const handleRemoveGalleryImage = (index: number) => {
    const currentGallery = formData.galleryImages || [];
    handleChange(
      "galleryImages",
      currentGallery.filter((_, i) => i !== index),
    );
    setGalleryFile(index, null);
  };

  const handleGalleryImageChange = (
    index: number,
    field: string,
    value: any,
  ) => {
    const currentGallery = [...(formData.galleryImages || [])];
    currentGallery[index] = {
      ...currentGallery[index],
      [field]: value,
    };
    handleChange("galleryImages", currentGallery);
  };

  // Zero Trust Validation
  const validateForm = (): boolean => {
    setErrors({});
    const result = registerNewsSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      let firstErrorPath = "";

      result.error.issues.forEach((issue, idx) => {
        const pathStr = issue.path.join(".");
        fieldErrors[pathStr] = issue.message;
        if (idx === 0) firstErrorPath = pathStr;
      });

      setErrors(fieldErrors);

      // Scroll smoothly to the first missing field and focus it
      if (firstErrorPath) {
        setTimeout(() => {
          const targetEl = document.getElementById(`field-${firstErrorPath}`);
          if (targetEl) {
            targetEl.scrollIntoView({ behavior: "smooth", block: "center" });
            if (typeof targetEl.focus === "function") {
              targetEl.focus();
            }
          } else {
            window.scrollTo({ top: 120, behavior: "smooth" });
          }
        }, 80);
      }

      return false;
    }

    return true;
  };

  // Switch to Preview Step
  const handleGoToPreview = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setActiveStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Final Submit (Only here the actual upload/service call runs)
  const handleFinalSubmit = async () => {
    if (!validateForm()) {
      setActiveStep(1);
      return;
    }

    setIsSubmitting(true);
    try {
      const isStandard =
        formData.newsTypeId === "STANDARD" || !formData.newsTypeId;

      // 1. Upload cover
      let finalCoverUrl = formData.coverUrl;
      if (coverFile) {
        finalCoverUrl = await uploadSingleFile(coverFile, "banner");
        if (formData.coverUrl?.startsWith("blob:")) {
          URL.revokeObjectURL(formData.coverUrl);
        }
      }

      // 2. Upload blocks (only for STANDARD template)
      let finalBlocks: {
        subHeading?: string | null;
        content?: string;
        imageUrl?: string | null;
        sortOrder: number;
      }[] = [];

      if (isStandard) {
        finalBlocks = await Promise.all(
          (formData.blocks || [])
            .filter((block) => Boolean(block.content && block.content.trim()))
            .map(async (block, idx) => {
              let finalBlockImgUrl = block.imageUrl;
              const localBlockFile = blockFiles[idx];
              if (localBlockFile) {
                finalBlockImgUrl = await uploadSingleFile(
                  localBlockFile,
                  "gallery",
                );
                if (block.imageUrl?.startsWith("blob:")) {
                  URL.revokeObjectURL(block.imageUrl);
                }
              }
              return {
                ...block,
                imageUrl:
                  finalBlockImgUrl && !finalBlockImgUrl.startsWith("blob:")
                    ? finalBlockImgUrl
                    : null,
                sortOrder: idx + 1,
              };
            }),
        );
      }

      // 3. Upload gallery images (only for GALLERY template)
      let finalGalleryImages: {
        imageUrl?: string;
        imageDescription?: string | null;
        sortOrder: number;
      }[] = [];

      if (!isStandard) {
        finalGalleryImages = await Promise.all(
          (formData.galleryImages || [])
            .filter(
              (img, idx) =>
                Boolean(galleryFiles[idx]) ||
                Boolean(img.imageUrl && img.imageUrl.trim()),
            )
            .map(async (img, idx) => {
              let finalGalleryImgUrl = img.imageUrl;
              const localGalleryFile = galleryFiles[idx];
              if (localGalleryFile) {
                finalGalleryImgUrl = await uploadSingleFile(
                  localGalleryFile,
                  "gallery",
                );
                if (img.imageUrl?.startsWith("blob:")) {
                  URL.revokeObjectURL(img.imageUrl);
                }
              }
              return {
                ...img,
                imageUrl: finalGalleryImgUrl || "",
                sortOrder: idx + 1,
              };
            }),
        );
      }

      const excerpt =
        formData.excerpt?.trim() ||
        generateAutoExcerpt({
          ...formData,
          blocks: finalBlocks,
        } as any);

      const finalPayload = {
        ...formData,
        status: "PENDING",
        coverUrl: finalCoverUrl,
        blocks: finalBlocks,
        galleryImages: finalGalleryImages,
        excerpt,
      };

      const result = await BeritaService.submit(finalPayload as any);
      if (result?.id) {
        savePendingSubmission(
          result.id,
          result.title || formData.title || "Berita Baru",
        );
      }
      clearDraft();
      setShowSuccessModal(true);
    } catch (err: any) {
      console.error("Pengajuan berita gagal:", err);
      const serverMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Terjadi kesalahan saat memproses pengajuan berita.";
      alert(serverMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Map preview data to NewsDetailDto
  const previewCategoryObj = categories.find(
    (c) =>
      c.id === formData.newsCategoryId || c.slug === formData.newsCategoryId,
  );
  const previewCategoryName =
    formData.newsCategoryId === "other"
      ? formData.newCategoryName || "Kategori Baru"
      : previewCategoryObj?.name || "Pengumuman";
  const previewCategorySlug = previewCategoryObj?.slug || "pengumuman";

  const isStandard = formData.newsTypeId === "STANDARD" || !formData.newsTypeId;

  const previewNewsDto: NewsDetailDto = {
    id: "preview-news-id",
    title: formData.title || "Judul Berita Akan Muncul Di Sini",
    slug: "preview-slug",
    categoryId: formData.newsCategoryId || "cat-1",
    categoryName: previewCategoryName,
    categorySlug: previewCategorySlug,
    summary: generateAutoExcerpt(formData),
    publishedAt: new Date().toISOString(),
    coverImage:
      formData.coverUrl ||
      "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80",
    coverCaption: formData.coverCaption || "",
    authorName: formData.authorName || "Nama Penulis",
    authorRole: "Warga Desa Pringgodani",
    contentSections: isStandard
      ? (formData.blocks || []).map((b) => ({
          sectionTitle: b.subHeading || null,
          paragraph: b.content || "",
          sectionImage: b.imageUrl || null,
        }))
      : (formData.galleryImages || []).map((g) => ({
          sectionTitle: g.imageDescription || "Foto Galeri Komunitas",
          paragraph: "",
          sectionImage: g.imageUrl || null,
        })),
    readingTimeMinutes: 2,
  };

  return (
    <main className="max-w-container-max px-gutter mx-auto pt-24 pb-20">
      {/* Header Section (code.html Design) */}
      <header className="mb-8 max-w-3xl">
        <span className="bg-secondary/10 text-secondary font-badge-xs text-badge-xs mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1 font-bold tracking-wider uppercase">
          <Icon name="edit_note" className="text-base" />
          Layanan Masyarakat
        </span>
        <h1 className="font-headline-lg text-headline-lg text-primary mb-3">
          Ajukan Berita & Kegiatan
        </h1>
        <p className="text-body-lg text-on-surface-variant leading-relaxed">
          Sampaikan berita terbaru, pengumuman penting, atau dokumentasi
          kegiatan di lingkungan Desa Pringgodani untuk dipublikasikan di portal
          resmi.
        </p>
      </header>

      {/* Stepper Indicator */}
      <div className="mb-8 flex items-center justify-center space-x-6">
        <button
          onClick={() => setActiveStep(1)}
          className={`flex items-center gap-2 font-bold transition-all ${
            activeStep === 1
              ? "text-primary scale-105 opacity-100"
              : "text-on-surface-variant opacity-60"
          }`}
        >
          <span
            className={`font-label-sm flex h-9 w-9 items-center justify-center rounded-full shadow-sm ${
              activeStep === 1
                ? "bg-primary ring-primary/20 text-white ring-4"
                : "bg-surface-container-highest text-on-surface"
            }`}
          >
            1
          </span>
          <span className="font-label-sm">Formulir Editor Berita</span>
        </button>

        <div className="bg-outline-variant/40 h-0.5 w-16" />

        <button
          onClick={() => {
            if (validateForm()) setActiveStep(2);
          }}
          className={`flex items-center gap-2 font-bold transition-all ${
            activeStep === 2
              ? "text-primary scale-105 opacity-100"
              : "text-on-surface-variant opacity-60"
          }`}
        >
          <span
            className={`font-label-sm flex h-9 w-9 items-center justify-center rounded-full shadow-sm ${
              activeStep === 2
                ? "bg-primary ring-primary/20 text-white ring-4"
                : "bg-surface-container-highest text-on-surface"
            }`}
          >
            2
          </span>
          <span className="font-label-sm">Pratinjau Live Berita</span>
        </button>
      </div>

      {/* STEP 1: FORMULIR */}
      {activeStep === 1 && (
        <SubmitBeritaForm
          formData={formData}
          categories={categories}
          errors={errors}
          onChange={handleChange}
          onAddBlock={handleAddBlock}
          onRemoveBlock={handleRemoveBlock}
          onBlockChange={handleBlockChange}
          onAddGalleryImage={handleAddGalleryImage}
          onRemoveGalleryImage={handleRemoveGalleryImage}
          onGalleryImageChange={handleGalleryImageChange}
          onClearDraft={clearDraft}
          onSubmitStep={handleGoToPreview}
          onSetCoverFile={setCoverFile}
          onSetBlockFile={setBlockFile}
          onSetGalleryFile={setGalleryFile}
        />
      )}

      {/* STEP 2: PRATINJAU LIVE */}
      {activeStep === 2 && (
        <SubmitBeritaPreview
          previewNewsDto={previewNewsDto}
          isSubmitting={isSubmitting}
          onBackToEdit={() => {
            setActiveStep(1);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          onFinalSubmit={handleFinalSubmit}
        />
      )}

      {/* SUCCESS MODAL */}
      {showSuccessModal && (
        <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-surface-container-lowest border-outline-variant/30 w-full max-w-md space-y-4 rounded-2xl border p-6 text-center shadow-2xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl text-emerald-600">
              <Icon name="check_circle" className="text-4xl" />
            </div>
            <h3 className="font-headline-md text-headline-md text-primary font-bold">
              Pengajuan Berita Berhasil!
            </h3>
            <p className="text-on-surface-variant text-sm leading-relaxed">
              Terima kasih! Berita <strong>{formData.title}</strong> telah
              dikirim dan sedang dalam proses peninjauan oleh perangkat Desa
              Pringgodani.
            </p>
            <div className="bg-surface-container-low text-on-surface-variant rounded-lg p-3 text-left text-xs">
              📍 Tim kami akan meninjau pengajuan ini (Maks. 24 Jam) sebelum
              dipublikasikan ke portal resmi.
            </div>
            <div className="flex justify-center pt-2">
              <button
                onClick={() => router.push("/berita")}
                className="bg-primary text-on-primary w-full rounded-full py-3 font-bold shadow-md transition-all hover:opacity-90"
              >
                Lihat Portal Berita Desa
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
