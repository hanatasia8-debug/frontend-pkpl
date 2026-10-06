"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from "react";
import { Icon } from "@/shared/ui/icon";
import { BeritaService } from "@/entities/berita/api/berita.service";
import type { NewsCategoryDto } from "@/entities/berita/model/types";
import {
  registerNewsSchema,
  type RegisterNewsDTO,
} from "@/entities/berita/model/register-news.schema";
import { SubmitBeritaForm } from "@/views/submit-berita/submit-berita-form";
import { RevisionService } from "@/entities/pengajuan/api/revision.service";
import { generateAutoExcerpt } from "@/shared/utils/news-excerpt.helper";
import { apiClient } from "@/shared/api/axios-instance";
import type { ApiSuccessBody } from "@/shared/api/response";
import { compressImage, type ImagePreset } from "@/shared/utils/image-compression";

interface NewsRevisionFormProps {
  token: string;
  initialData: Partial<RegisterNewsDTO>;
  onResubmitted: (title: string) => void;
}

export function NewsRevisionForm({
  token,
  initialData,
  onResubmitted,
}: NewsRevisionFormProps) {
  const [categories, setCategories] = useState<NewsCategoryDto[]>([]);
  const [formData, setFormData] =
    useState<Partial<RegisterNewsDTO>>(initialData);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [blockFiles, setBlockFiles] = useState<Record<number, File>>({});
  const [galleryFiles, setGalleryFiles] = useState<Record<number, File>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    BeritaService.getCategories().then((res) => setCategories(res.items));
  }, []);

  const uploadSingleFile = async (
    file: File,
    preset: ImagePreset = "banner",
  ): Promise<string> => {
    const compressed = await compressImage(file, preset);
    const body = new FormData();
    body.append("file", compressed);
    const { data } = await apiClient.post<ApiSuccessBody<{ url: string }>>(
      "/uploads?category=news",
      body,
      { timeout: 60000 },
    );
    return data.data.url;
  };

  const handleChange = (field: keyof RegisterNewsDTO, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

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
    setBlockFiles((prev) => {
      const next = { ...prev };
      delete next[index];
      return next;
    });
  };

  const handleBlockChange = (index: number, field: string, value: any) => {
    const currentBlocks = [...(formData.blocks || [])];
    currentBlocks[index] = { ...currentBlocks[index], [field]: value };
    handleChange("blocks", currentBlocks);
  };

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
    setGalleryFiles((prev) => {
      const next = { ...prev };
      delete next[index];
      return next;
    });
  };

  const handleGalleryImageChange = (
    index: number,
    field: string,
    value: any,
  ) => {
    const currentGallery = [...(formData.galleryImages || [])];
    currentGallery[index] = { ...currentGallery[index], [field]: value };
    handleChange("galleryImages", currentGallery);
  };

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
      if (firstErrorPath) {
        setTimeout(() => {
          const el = document.getElementById(`field-${firstErrorPath}`);
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
            if (typeof el.focus === "function") el.focus();
          } else {
            window.scrollTo({ top: 120, behavior: "smooth" });
          }
        }, 80);
      }
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      let finalCoverUrl = formData.coverUrl;
      if (coverFile) {
        finalCoverUrl = await uploadSingleFile(coverFile);
        if (formData.coverUrl?.startsWith("blob:")) {
          URL.revokeObjectURL(formData.coverUrl);
        }
      }

      const isStandard =
        formData.newsTypeId === "STANDARD" || !formData.newsTypeId;

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
              let finalImg = block.imageUrl;
              const localFile = blockFiles[idx];
              if (localFile) {
                finalImg = await uploadSingleFile(localFile, "gallery");
                if (block.imageUrl?.startsWith("blob:")) {
                  URL.revokeObjectURL(block.imageUrl);
                }
              }
              return {
                ...block,
                imageUrl:
                  finalImg && !finalImg.startsWith("blob:") ? finalImg : null,
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
              let finalImg = img.imageUrl;
              const localFile = galleryFiles[idx];
              if (localFile) {
                finalImg = await uploadSingleFile(localFile, "gallery");
                if (img.imageUrl?.startsWith("blob:")) {
                  URL.revokeObjectURL(img.imageUrl);
                }
              }
              return {
                ...img,
                imageUrl: finalImg || "",
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

      const payload = {
        ...formData,
        coverUrl: finalCoverUrl,
        blocks: finalBlocks,
        galleryImages: finalGalleryImages,
        excerpt,
      };

      const { success } = await RevisionService.resubmitNews(
        token,
        payload as Partial<RegisterNewsDTO>,
      );

      if (success) {
        onResubmitted(formData.title || "Berita Anda");
      } else {
        alert(
          "Gagal mengirim revisi. Periksa koneksi internet Anda dan coba lagi.",
        );
      }
    } catch (err: any) {
      console.error("Gagal mengirim revisi berita:", err);
      const serverMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Terjadi kesalahan saat mengirim revisi.";
      alert(serverMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
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
      onClearDraft={() => setFormData(initialData)}
      onSubmitStep={handleSubmit}
      onSetCoverFile={setCoverFile}
      onSetBlockFile={(idx, file) =>
        setBlockFiles((prev) => {
          const next = { ...prev };
          if (file) next[idx] = file;
          else delete next[idx];
          return next;
        })
      }
      onSetGalleryFile={(idx, file) =>
        setGalleryFiles((prev) => {
          const next = { ...prev };
          if (file) next[idx] = file;
          else delete next[idx];
          return next;
        })
      }
      draftBanner={
        <div className="bg-secondary/10 border-secondary/20 mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border px-4 py-3">
          <div className="text-secondary flex items-center gap-2 text-xs font-semibold">
            <Icon name="edit_note" className="text-sm" />
            <span>Mode Revisi — data awal pengajuan Anda dimuat di bawah</span>
          </div>
          <button
            type="button"
            onClick={() => setFormData(initialData)}
            className="text-secondary flex items-center gap-1 text-xs font-medium hover:underline"
          >
            <Icon name="refresh" className="text-sm" /> Kembalikan ke Data Awal
          </button>
        </div>
      }
      submitButton={
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-primary text-on-primary flex w-full items-center justify-center gap-2 rounded-full px-8 py-3 font-bold shadow-lg transition-all hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {isSubmitting ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              <span>Mengirim Revisi...</span>
            </>
          ) : (
            <>
              <Icon name="send" className="text-lg" />
              <span>Kirim Ulang untuk Ditinjau</span>
            </>
          )}
        </button>
      }
    />
  );
}
