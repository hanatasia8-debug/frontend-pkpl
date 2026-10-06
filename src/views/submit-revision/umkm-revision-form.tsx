"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from "react";
import { Icon } from "@/shared/ui/icon";
import { UmkmService } from "@/entities/umkm/api/umkm.service";
import type { UmkmCategoryDto } from "@/entities/umkm/model/types";
import {
  registerUmkmSchema,
  type RegisterUmkmDTO,
} from "@/entities/umkm/model/register-umkm.schema";
import { SubmitUmkmForm } from "@/views/submit-umkm/submit-umkm-form";
import { RevisionService } from "@/entities/pengajuan/api/revision.service";
import { apiClient } from "@/shared/api/axios-instance";
import type { ApiSuccessBody } from "@/shared/api/response";
import { compressImage, type ImagePreset } from "@/shared/utils/image-compression";

interface UmkmRevisionFormProps {
  token: string;
  initialData: Partial<RegisterUmkmDTO>;
  onResubmitted: (name: string) => void;
}

export function UmkmRevisionForm({
  token,
  initialData,
  onResubmitted,
}: UmkmRevisionFormProps) {
  const [categories, setCategories] = useState<UmkmCategoryDto[]>([]);
  const [formData, setFormData] =
    useState<Partial<RegisterUmkmDTO>>(initialData);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [productFiles, setProductFiles] = useState<Record<number, File>>({});
  const [galleryFiles, setGalleryFiles] = useState<Record<number, File>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    UmkmService.getCategories().then((res) => setCategories(res.items));
  }, []);

  const uploadSingleFile = async (
    file: File,
    preset: ImagePreset = "banner",
  ): Promise<string> => {
    const compressed = await compressImage(file, preset);
    const body = new FormData();
    body.append("file", compressed);
    const { data } = await apiClient.post<ApiSuccessBody<{ url: string }>>(
      "/uploads?category=umkm",
      body,
      { timeout: 60000 },
    );
    return data.data.url;
  };

  const handleChange = (field: keyof RegisterUmkmDTO, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleAddProduct = () => {
    const currentProducts = formData.products || [];
    handleChange("products", [
      ...currentProducts,
      { name: "", description: "", price: null, imageUrl: "" },
    ]);
  };

  const handleRemoveProduct = (index: number) => {
    const currentProducts = formData.products || [];
    handleChange(
      "products",
      currentProducts.filter((_, i) => i !== index),
    );
    setProductFiles((prev) => {
      const next = { ...prev };
      delete next[index];
      return next;
    });
  };

  const handleProductChange = (index: number, field: string, value: any) => {
    const currentProducts = [...(formData.products || [])];
    currentProducts[index] = { ...currentProducts[index], [field]: value };
    handleChange("products", currentProducts);
  };

  const validateForm = (): boolean => {
    setErrors({});
    const result = registerUmkmSchema.safeParse(formData);
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

      const finalProducts = await Promise.all(
        (formData.products || []).map(async (prod, idx) => {
          let finalImg = prod.imageUrl;
          const localFile = productFiles[idx];
          if (localFile) {
            finalImg = await uploadSingleFile(localFile);
            if (prod.imageUrl?.startsWith("blob:")) {
              URL.revokeObjectURL(prod.imageUrl);
            }
          }
          return { ...prod, imageUrl: finalImg };
        }),
      );

      const finalGalleries = await Promise.all(
        (formData.galleries || []).map(async (url, idx) => {
          let finalUrl = url;
          const localFile = galleryFiles[idx];
          if (localFile) {
            finalUrl = await uploadSingleFile(localFile);
            if (url.startsWith("blob:")) URL.revokeObjectURL(url);
          }
          return finalUrl;
        }),
      );

      const payload = {
        ...formData,
        coverUrl: finalCoverUrl,
        products: finalProducts,
        galleries: finalGalleries,
      };

      const { success } = await RevisionService.resubmitUmkm(
        token,
        payload as Partial<RegisterUmkmDTO>,
      );

      if (success) {
        onResubmitted(formData.name || "UMKM Anda");
      } else {
        alert(
          "Gagal mengirim revisi. Periksa koneksi internet Anda dan coba lagi.",
        );
      }
    } catch (err: any) {
      console.error("Gagal mengirim revisi UMKM:", err);
      alert(err.message || "Terjadi kesalahan saat mengirim revisi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SubmitUmkmForm
      formData={formData}
      categories={categories}
      errors={errors}
      onChange={handleChange}
      onAddProduct={handleAddProduct}
      onRemoveProduct={handleRemoveProduct}
      onProductChange={handleProductChange}
      onClearDraft={() => setFormData(initialData)}
      onSubmitStep={handleSubmit}
      onSetCoverFile={setCoverFile}
      onSetProductFile={(idx, file) =>
        setProductFiles((prev) => {
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
          className="bg-primary text-on-primary flex items-center gap-2 rounded-full px-8 py-3 font-bold shadow-lg transition-all hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
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
