"use client";

import { useEffect, useState, useCallback } from "react";
import type { RegisterUmkmDTO } from "@/entities/umkm/model/register-umkm.schema";
import {
  saveDraftImage,
  getDraftImage,
  deleteDraftImage,
  clearDraftImages,
  syncArrayDraftImages,
} from "@/shared/lib/db/draft-image-db";
import { compressImage } from "@/shared/utils/image-compression";

const DRAFT_KEY = "register_umkm_draft_v1";
const PREFIX = "umkm_draft_";
const DRAFT_IMAGE_MARKER = "[HAS_DRAFT_IMAGE]";

export const DEFAULT_UMKM_FORM_DATA: Partial<RegisterUmkmDTO> = {
  name: "",
  ownerName: "",
  umkmCategoryId: "",
  newCategoryName: "",
  description: "",
  phone: "",
  email: "",
  coverUrl: "",
  address: "",
  latitude: -8.2811,
  longitude: 112.5664,
  mapsUrl: "",
  since: new Date().getFullYear(),
  openDay: "Senin - Sabtu",
  startTime: "08:00",
  endTime: "17:00",
  galleries: [],
  products: [],
};

export function useRegisterUmkmDraft() {
  const [formData, setFormData] = useState<Partial<RegisterUmkmDTO>>(
    DEFAULT_UMKM_FORM_DATA,
  );
  const [isHydrated, setIsHydrated] = useState(false);

  const [coverFile, setCoverFileState] = useState<File | null>(null);
  const [productFiles, setProductFilesState] = useState<Record<number, File>>(
    {},
  );
  const [galleryFiles, setGalleryFilesState] = useState<Record<number, File>>(
    {},
  );

  // Restore text draft AND IndexedDB image files post-mount
  useEffect(() => {
    async function restoreDraft() {
      let baseData = DEFAULT_UMKM_FORM_DATA;
      try {
        const saved = localStorage.getItem(DRAFT_KEY);
        if (saved) {
          baseData = { ...DEFAULT_UMKM_FORM_DATA, ...JSON.parse(saved) };
        }
      } catch (e) {
        console.error("Gagal membaca draf UMKM dari localStorage:", e);
      }

      // Restore Cover Image
      let restoredCoverUrl = "";
      let restoredCoverFile: File | null = null;
      if (
        baseData.coverUrl === DRAFT_IMAGE_MARKER ||
        baseData.coverUrl?.startsWith("blob:")
      ) {
        const blob = await getDraftImage(`${PREFIX}cover`);
        if (blob) {
          restoredCoverFile =
            blob instanceof File
              ? blob
              : new File([blob], "cover.jpg", { type: blob.type });
          restoredCoverUrl = URL.createObjectURL(restoredCoverFile);
        }
      } else {
        await deleteDraftImage(`${PREFIX}cover`);
      }

      // Restore Product Images
      const restoredProdFiles: Record<number, File> = {};
      const updatedProducts = (baseData.products || []).map((p) => ({ ...p }));

      for (let i = 0; i < (baseData.products || []).length; i++) {
        const p = updatedProducts[i];
        if (
          p.imageUrl === DRAFT_IMAGE_MARKER ||
          p.imageUrl?.startsWith("blob:")
        ) {
          const blob = await getDraftImage(`${PREFIX}product_${i}`);
          if (blob) {
            const file =
              blob instanceof File
                ? blob
                : new File([blob], `product_${i}.jpg`, { type: blob.type });
            restoredProdFiles[i] = file;
            updatedProducts[i].imageUrl = URL.createObjectURL(file);
          } else {
            updatedProducts[i].imageUrl = "";
          }
        } else {
          updatedProducts[i].imageUrl = "";
          await deleteDraftImage(`${PREFIX}product_${i}`);
        }
      }

      // Restore Gallery Images
      const restoredGalFiles: Record<number, File> = {};
      const updatedGalleries = [...(baseData.galleries || [])];

      for (let i = 0; i < (baseData.galleries || []).length; i++) {
        const g = updatedGalleries[i];
        if (g === DRAFT_IMAGE_MARKER || g?.startsWith("blob:")) {
          const blob = await getDraftImage(`${PREFIX}gallery_${i}`);
          if (blob) {
            const file =
              blob instanceof File
                ? blob
                : new File([blob], `gallery_${i}.jpg`, { type: blob.type });
            restoredGalFiles[i] = file;
            updatedGalleries[i] = URL.createObjectURL(file);
          } else {
            updatedGalleries[i] = "";
          }
        } else {
          updatedGalleries[i] = "";
          await deleteDraftImage(`${PREFIX}gallery_${i}`);
        }
      }

      setFormData({
        ...baseData,
        coverUrl: restoredCoverUrl,
        products: updatedProducts,
        galleries: updatedGalleries,
      });

      if (restoredCoverFile) setCoverFileState(restoredCoverFile);
      if (Object.keys(restoredProdFiles).length > 0)
        setProductFilesState(restoredProdFiles);
      if (Object.keys(restoredGalFiles).length > 0)
        setGalleryFilesState(restoredGalFiles);

      setIsHydrated(true);
    }

    restoreDraft();
  }, []);

  // Save text draft to localStorage using DRAFT_IMAGE_MARKER for local images
  useEffect(() => {
    if (!isHydrated || typeof window === "undefined") return;
    try {
      const sanitizedData = {
        ...formData,
        coverUrl: coverFile || formData.coverUrl ? DRAFT_IMAGE_MARKER : "",
        galleries: formData.galleries?.map((g, idx) =>
          galleryFiles[idx] || (g && g !== "") ? DRAFT_IMAGE_MARKER : "",
        ),
        products: formData.products?.map((p, idx) => ({
          ...p,
          imageUrl:
            productFiles[idx] || (p.imageUrl && p.imageUrl !== "")
              ? DRAFT_IMAGE_MARKER
              : "",
        })),
      };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(sanitizedData));
    } catch (e) {
      console.warn("Gagal menyimpan draf UMKM ke localStorage:", e);
    }
  }, [formData, coverFile, productFiles, galleryFiles, isHydrated]);

  // Setters with clean sync and client-side compression
  const setCoverFile = useCallback(async (rawFile: File | null) => {
    const file = rawFile ? await compressImage(rawFile, "banner") : null;
    setCoverFileState(file);
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setFormData((prev) => ({ ...prev, coverUrl: previewUrl }));
      await saveDraftImage(`${PREFIX}cover`, file);
    } else {
      setFormData((prev) => ({ ...prev, coverUrl: "" }));
      await deleteDraftImage(`${PREFIX}cover`);
    }
  }, []);

  const setProductFile = useCallback(
    async (index: number, rawFile: File | null) => {
      const file = rawFile ? await compressImage(rawFile, "product") : null;
      setProductFilesState((prev) => {
        const next = { ...prev };
        if (file) next[index] = file;
        else delete next[index];

        const filesArray = Object.keys(next)
          .map(Number)
          .sort((a, b) => a - b)
          .map((k) => next[k]);
        syncArrayDraftImages(`${PREFIX}product_`, filesArray);

        return next;
      });

      if (file) {
        const previewUrl = URL.createObjectURL(file);
        setFormData((prev) => {
          const products = [...(prev.products || [])];
          if (products[index])
            products[index] = { ...products[index], imageUrl: previewUrl };
          return { ...prev, products };
        });
      } else {
        setFormData((prev) => {
          const products = [...(prev.products || [])];
          if (products[index])
            products[index] = { ...products[index], imageUrl: "" };
          return { ...prev, products };
        });
        await deleteDraftImage(`${PREFIX}product_${index}`);
      }
    },
    [],
  );

  const setGalleryFile = useCallback(
    async (index: number, rawFile: File | null) => {
      const file = rawFile ? await compressImage(rawFile, "gallery") : null;
      setGalleryFilesState((prev) => {
        const next = { ...prev };
        if (file) next[index] = file;
        else delete next[index];

        const filesArray = Object.keys(next)
          .map(Number)
          .sort((a, b) => a - b)
          .map((k) => next[k]);
        syncArrayDraftImages(`${PREFIX}gallery_`, filesArray);

        return next;
      });

      if (file) {
        const previewUrl = URL.createObjectURL(file);
        setFormData((prev) => {
          const galleries = [...(prev.galleries || [])];
          galleries[index] = previewUrl;
          return { ...prev, galleries };
        });
      } else {
        setFormData((prev) => {
          const galleries = [...(prev.galleries || [])];
          galleries[index] = "";
          return { ...prev, galleries };
        });
        await deleteDraftImage(`${PREFIX}gallery_${index}`);
      }
    },
    [],
  );

  const clearDraft = useCallback(async () => {
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem(DRAFT_KEY);
      }
      await clearDraftImages(PREFIX);
    } catch (e) {
      console.error("Gagal menghapus draf UMKM:", e);
    }
    setFormData(DEFAULT_UMKM_FORM_DATA);
    setCoverFileState(null);
    setProductFilesState({});
    setGalleryFilesState({});
  }, []);

  return {
    formData,
    setFormData,
    coverFile,
    setCoverFile,
    productFiles,
    setProductFile,
    galleryFiles,
    setGalleryFile,
    clearDraft,
  };
}
