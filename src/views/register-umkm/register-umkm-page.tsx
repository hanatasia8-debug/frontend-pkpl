"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/shared/ui/icon";
import { UmkmService } from "@/entities/umkm/api/umkm.service";
import type {
  UmkmCategoryDto,
  UmkmDetailDto,
} from "@/entities/umkm/model/types";
import {
  registerUmkmSchema,
  type RegisterUmkmDTO,
} from "@/entities/umkm/model/register-umkm.schema";
import { useRegisterUmkmDraft } from "@/features/register-umkm/model/use-register-umkm-draft";
import { SubmitUmkmForm } from "@/views/submit-umkm/submit-umkm-form";
import { SubmitUmkmPreview } from "@/views/submit-umkm-preview/submit-umkm-preview";
import { apiClient } from "@/shared/api/axios-instance";
import type { ApiSuccessBody } from "@/shared/api/response";
import { compressImage, type ImagePreset } from "@/shared/utils/image-compression";

import { useSubmissionTracker } from "@/features/submission-tracker/model/use-submission-tracker";

interface RegisterUmkmPageProps {
  categories: UmkmCategoryDto[];
}

export function RegisterUmkmPage({ categories }: RegisterUmkmPageProps) {
  const router = useRouter();
  const { savePendingSubmission } = useSubmissionTracker("UMKM");
  const {
    formData,
    setFormData,
    coverFile,
    setCoverFile,
    productFiles,
    setProductFile,
    galleryFiles,
    setGalleryFile,
    clearDraft,
  } = useRegisterUmkmDraft();

  const [activeStep, setActiveStep] = useState<1 | 2>(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const uploadSingleFile = async (
    file: File,
    preset: ImagePreset = "default",
  ): Promise<string> => {
    // Compress image client-side based on context
    const compressedFile = await compressImage(file, preset);

    const formData = new FormData();
    formData.append("file", compressedFile);
    formData.append("category", "umkm");

    // Do not pass manual Content-Type header so Axios/browser sets boundary automatically
    const { data } = await apiClient.post<ApiSuccessBody<{ url: string }>>(
      "/uploads?category=umkm",
      formData,
      {
        timeout: 60000,
      },
    );
    if (!data?.data?.url) {
      throw new Error("Gagal mengunggah berkas gambar");
    }
    return data.data.url;
  };

  // Field change handler
  const handleChange = (field: keyof RegisterUmkmDTO, value: any) => {
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

  // Product dynamic array handlers
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
    setProductFile(index, null);
  };

  const handleProductChange = (index: number, field: string, value: any) => {
    const currentProducts = [...(formData.products || [])];
    currentProducts[index] = {
      ...currentProducts[index],
      [field]: value,
    };
    handleChange("products", currentProducts);
  };

  // Zero Trust Validation
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

      // Scroll smoothly to the first missing field and focus it immediately
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

  // Final Submit
  const handleFinalSubmit = async () => {
    if (!validateForm()) {
      setActiveStep(1);
      return;
    }

    setIsSubmitting(true);
    setUploadProgressText("Mempersiapkan berkas...");
    try {
      // 1. Upload cover
      let finalCoverUrl = formData.coverUrl;
      if (coverFile) {
        setUploadProgressText("Mengunggah foto sampul utama...");
        finalCoverUrl = await uploadSingleFile(coverFile, "banner");
        if (formData.coverUrl?.startsWith("blob:")) {
          URL.revokeObjectURL(formData.coverUrl);
        }
      }

      // 2. Upload products sequentially
      const finalProducts = [];
      const currentProds = formData.products || [];
      for (let idx = 0; idx < currentProds.length; idx++) {
        const prod = currentProds[idx];
        let finalProdImgUrl = prod.imageUrl;
        const localProdFile = productFiles[idx];
        if (localProdFile) {
          setUploadProgressText(
            `Mengunggah foto produk ${idx + 1} dari ${currentProds.length}...`,
          );
          try {
            finalProdImgUrl = await uploadSingleFile(localProdFile, "product");
            if (prod.imageUrl?.startsWith("blob:")) {
              URL.revokeObjectURL(prod.imageUrl);
            }
          } catch (e) {
            console.warn(
              `Upload foto produk ${idx + 1} gagal, tetap dilanjutkan:`,
              e,
            );
          }
        }
        finalProducts.push({ ...prod, imageUrl: finalProdImgUrl });
      }

      // 3. Upload galleries sequentially
      const finalGalleries = [];
      const currentGals = formData.galleries || [];
      for (let idx = 0; idx < currentGals.length; idx++) {
        const url = currentGals[idx];
        let finalGalImgUrl = url;
        const localGalFile = galleryFiles[idx];
        if (localGalFile) {
          setUploadProgressText(
            `Mengunggah foto galeri ${idx + 1} dari ${currentGals.length}...`,
          );
          try {
            finalGalImgUrl = await uploadSingleFile(localGalFile, "gallery");
            if (url.startsWith("blob:")) {
              URL.revokeObjectURL(url);
            }
          } catch (e) {
            console.warn(
              `Upload foto galeri ${idx + 1} gagal, tetap dilanjutkan:`,
              e,
            );
          }
        }
        if (finalGalImgUrl && !finalGalImgUrl.startsWith("blob:")) {
          finalGalleries.push(finalGalImgUrl);
        }
      }

      setUploadProgressText("Menyimpan data pendaftaran UMKM...");
      const finalPayload = {
        ...formData,
        coverUrl: finalCoverUrl,
        products: finalProducts,
        galleries: finalGalleries,
        mapsUrl: formData.mapsUrl?.trim() || null,
      };

      const result = await UmkmService.register(finalPayload as any);
      if (result?.id) {
        savePendingSubmission(
          result.id,
          result.name || formData.name || "UMKM Baru",
        );
      }
      clearDraft();
      setShowSuccessModal(true);
    } catch (err: any) {
      console.error("Pendaftaran gagal:", err);
      alert(err.message || "Terjadi kesalahan saat memproses pendaftaran.");
    } finally {
      setIsSubmitting(false);
      setUploadProgressText("");
    }
  };

  // Map preview data to UmkmDetailDto
  const previewCategoryLabel =
    formData.umkmCategoryId === "other"
      ? formData.newCategoryName || "Kategori Baru"
      : categories.find(
          (c) =>
            c.value === formData.umkmCategoryId ||
            c.slug === formData.umkmCategoryId,
        )?.label ||
        formData.umkmCategoryId ||
        "Kuliner";

  const validGalleries = (formData.galleries || []).filter((g) =>
    Boolean(g && g.trim()),
  );

  const previewMapsUrl = formData.mapsUrl?.trim() || null;

  const previewDetailDto: UmkmDetailDto = {
    id: "preview-umkm-id",
    name: formData.name || "Nama Usaha Anda",
    slug: "preview-slug",
    category: previewCategoryLabel.toUpperCase().replace(/\s+/g, "_"),
    description: formData.description || "Deskripsi usaha akan muncul di sini.",
    logo: formData.coverUrl || "",
    coverUrl: formData.coverUrl || "",
    whatsappNumber: formData.phone || "628123456789",
    address: formData.address || "Dusun Krajan, Desa Pringgodani",
    mapsUrl: previewMapsUrl,
    since: formData.since ? Number(formData.since) : null,
    openDay: formData.openDay || null,
    startTime: formData.startTime || null,
    endTime: formData.endTime || null,
    ownerName: formData.ownerName || "Nama Pemilik",
    publishedAt: new Date().toISOString(),
    latitude: Number(formData.latitude) || -8.2811,
    longitude: Number(formData.longitude) || 112.5664,
    gallery: validGalleries,
    products: (formData.products || []).map((p, idx) => ({
      id: `preview-p-${idx}`,
      name: p.name || "Nama Produk",
      productName: p.name || "Nama Produk",
      price: p.price ? Number(p.price) : null,
      imageUrl: p.imageUrl || null,
      productPhoto: p.imageUrl || null,
    })),
    potential: null,
  };

  return (
    <div className="max-w-container-max px-gutter mx-auto mt-24 pb-20">
      {/* Header */}
      <header className="mb-8 text-center">
        <span className="bg-primary/10 text-primary mb-2 inline-block rounded-full px-3 py-1 text-xs font-bold tracking-wider uppercase">
          Pemberdayaan Ekonomi Desa
        </span>
        <h1 className="font-headline-lg text-headline-lg text-primary mb-2">
          Daftarkan UMKM Anda
        </h1>
        <p className="text-on-surface-variant mx-auto max-w-2xl text-sm leading-relaxed">
          Bergabunglah dengan ekosistem digital Desa Pringgodani untuk
          memperluas jangkauan pasar dan meningkatkan ekonomi lokal.
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
          <span className="font-label-sm">Formulir Pendaftaran</span>
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
          <span className="font-label-sm">Pratinjau Tampilan</span>
        </button>
      </div>

      {/* STEP 1: FORMULIR */}
      {activeStep === 1 && (
        <SubmitUmkmForm
          formData={formData}
          categories={categories}
          errors={errors}
          onChange={handleChange}
          onAddProduct={handleAddProduct}
          onRemoveProduct={handleRemoveProduct}
          onProductChange={handleProductChange}
          onClearDraft={clearDraft}
          onSubmitStep={handleGoToPreview}
          onSetCoverFile={setCoverFile}
          onSetProductFile={setProductFile}
          onSetGalleryFile={setGalleryFile}
        />
      )}

      {/* STEP 2: PRATINJAU REAL-TIME */}
      {activeStep === 2 && (
        <SubmitUmkmPreview
          previewDetailDto={previewDetailDto}
          isSubmitting={isSubmitting}
          submittingText={uploadProgressText}
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
              Pengajuan Berhasil Dikirim!
            </h3>
            <p className="text-on-surface-variant text-sm leading-relaxed">
              Terima kasih! Pendaftaran UMKM <strong>{formData.name}</strong>{" "}
              telah diterima dan sedang dalam tahap verifikasi oleh perangkat
              Desa Pringgodani.
            </p>
            <div className="bg-surface-container-low text-on-surface-variant rounded-lg p-3 text-left text-xs">
              📍 Tim kami akan menghubungi Anda melalui nomor WhatsApp{" "}
              <strong>{formData.phone}</strong> setelah data terverifikasi.
            </div>
            <div className="flex justify-center pt-2">
              <button
                onClick={() => router.push("/umkm")}
                className="bg-primary text-on-primary w-full rounded-full py-3 font-bold shadow-md transition-all hover:opacity-90"
              >
                Lihat Direktori UMKM
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
