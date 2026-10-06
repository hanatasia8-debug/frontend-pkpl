"use client";

import { useEffect, useState, useCallback } from "react";
import type { RegisterNewsDTO } from "@/entities/berita/model/register-news.schema";
import {
  saveDraftImage,
  getDraftImage,
  deleteDraftImage,
  clearDraftImages,
  syncArrayDraftImages,
} from "@/shared/lib/db/draft-image-db";
import { compressImage } from "@/shared/utils/image-compression";

const DRAFT_KEY = "register_news_draft_v1";
const PREFIX = "news_draft_";
const DRAFT_IMAGE_MARKER = "[HAS_DRAFT_IMAGE]";

export const DEFAULT_NEWS_FORM_DATA: Partial<RegisterNewsDTO> = {
  title: "",
  newsCategoryId: "",
  newCategoryName: "",
  newsTypeId: "STANDARD",
  authorName: "",
  phone: "",
  villagePotentialId: "",
  excerpt: "",
  coverUrl: "",
  coverCaption: "",
  blocks: [{ subHeading: "", content: "", imageUrl: "", sortOrder: 0 }],
  galleryImages: [{ imageUrl: "", imageDescription: "", sortOrder: 0 }],
};

export function useRegisterNewsDraft() {
  const [formData, setFormData] = useState<Partial<RegisterNewsDTO>>(
    DEFAULT_NEWS_FORM_DATA,
  );
  const [isHydrated, setIsHydrated] = useState(false);

  const [coverFile, setCoverFileState] = useState<File | null>(null);
  const [blockFiles, setBlockFilesState] = useState<Record<number, File>>({});
  const [galleryFiles, setGalleryFilesState] = useState<Record<number, File>>(
    {},
  );

  // Restore text draft AND IndexedDB image files post-mount
  useEffect(() => {
    async function restoreDraft() {
      let baseData = DEFAULT_NEWS_FORM_DATA;
      try {
        const saved = localStorage.getItem(DRAFT_KEY);
        if (saved) {
          baseData = { ...DEFAULT_NEWS_FORM_DATA, ...JSON.parse(saved) };
        }
      } catch (e) {
        console.error("Gagal membaca draf berita dari localStorage:", e);
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
              : new File([blob], "news_cover.jpg", { type: blob.type });
          restoredCoverUrl = URL.createObjectURL(restoredCoverFile);
        }
      } else {
        await deleteDraftImage(`${PREFIX}cover`);
      }

      // Restore Block Images
      const restoredBlockFiles: Record<number, File> = {};
      const updatedBlocks = (baseData.blocks || []).map((b) => ({ ...b }));

      for (let i = 0; i < (baseData.blocks || []).length; i++) {
        const b = updatedBlocks[i];
        if (
          b.imageUrl === DRAFT_IMAGE_MARKER ||
          b.imageUrl?.startsWith("blob:")
        ) {
          const blob = await getDraftImage(`${PREFIX}block_${i}`);
          if (blob) {
            const file =
              blob instanceof File
                ? blob
                : new File([blob], `news_block_${i}.jpg`, { type: blob.type });
            restoredBlockFiles[i] = file;
            updatedBlocks[i].imageUrl = URL.createObjectURL(file);
          } else {
            updatedBlocks[i].imageUrl = "";
          }
        } else {
          updatedBlocks[i].imageUrl = "";
          await deleteDraftImage(`${PREFIX}block_${i}`);
        }
      }

      // Restore Gallery Images
      const restoredGalFiles: Record<number, File> = {};
      const updatedGalleries = (baseData.galleryImages || []).map((g) => ({
        ...g,
      }));

      for (let i = 0; i < (baseData.galleryImages || []).length; i++) {
        const g = updatedGalleries[i];
        if (
          g.imageUrl === DRAFT_IMAGE_MARKER ||
          g.imageUrl?.startsWith("blob:")
        ) {
          const blob = await getDraftImage(`${PREFIX}gallery_${i}`);
          if (blob) {
            const file =
              blob instanceof File
                ? blob
                : new File([blob], `news_gallery_${i}.jpg`, {
                    type: blob.type,
                  });
            restoredGalFiles[i] = file;
            updatedGalleries[i].imageUrl = URL.createObjectURL(file);
          } else {
            updatedGalleries[i].imageUrl = "";
          }
        } else {
          updatedGalleries[i].imageUrl = "";
          await deleteDraftImage(`${PREFIX}gallery_${i}`);
        }
      }

      setFormData({
        ...baseData,
        coverUrl: restoredCoverUrl,
        blocks: updatedBlocks,
        galleryImages: updatedGalleries,
      });

      if (restoredCoverFile) setCoverFileState(restoredCoverFile);
      if (Object.keys(restoredBlockFiles).length > 0)
        setBlockFilesState(restoredBlockFiles);
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
        blocks: formData.blocks?.map((b, idx) => ({
          ...b,
          imageUrl:
            blockFiles[idx] || (b.imageUrl && b.imageUrl !== "")
              ? DRAFT_IMAGE_MARKER
              : "",
        })),
        galleryImages: formData.galleryImages?.map((g, idx) => ({
          ...g,
          imageUrl:
            galleryFiles[idx] || (g.imageUrl && g.imageUrl !== "")
              ? DRAFT_IMAGE_MARKER
              : "",
        })),
      };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(sanitizedData));
    } catch (e) {
      console.warn("Gagal menyimpan draf berita ke localStorage:", e);
    }
  }, [formData, coverFile, blockFiles, galleryFiles, isHydrated]);

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

  const setBlockFile = useCallback(async (index: number, rawFile: File | null) => {
    const file = rawFile ? await compressImage(rawFile, "gallery") : null;
    setBlockFilesState((prev) => {
      const next = { ...prev };
      if (file) next[index] = file;
      else delete next[index];

      const filesArray = Object.keys(next)
        .map(Number)
        .sort((a, b) => a - b)
        .map((k) => next[k]);
      syncArrayDraftImages(`${PREFIX}block_`, filesArray);

      return next;
    });

    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setFormData((prev) => {
        const blocks = [...(prev.blocks || [])];
        if (blocks[index])
          blocks[index] = { ...blocks[index], imageUrl: previewUrl };
        return { ...prev, blocks };
      });
    } else {
      setFormData((prev) => {
        const blocks = [...(prev.blocks || [])];
        if (blocks[index]) blocks[index] = { ...blocks[index], imageUrl: "" };
        return { ...prev, blocks };
      });
      await deleteDraftImage(`${PREFIX}block_${index}`);
    }
  }, []);

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
          const galleryImages = [...(prev.galleryImages || [])];
          if (galleryImages[index])
            galleryImages[index] = {
              ...galleryImages[index],
              imageUrl: previewUrl,
            };
          return { ...prev, galleryImages };
        });
      } else {
        setFormData((prev) => {
          const galleryImages = [...(prev.galleryImages || [])];
          if (galleryImages[index])
            galleryImages[index] = { ...galleryImages[index], imageUrl: "" };
          return { ...prev, galleryImages };
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
      console.error("Gagal menghapus draf berita:", e);
    }
    setFormData(DEFAULT_NEWS_FORM_DATA);
    setCoverFileState(null);
    setBlockFilesState({});
    setGalleryFilesState({});
  }, []);

  return {
    formData,
    setFormData,
    coverFile,
    setCoverFile,
    blockFiles,
    setBlockFile,
    galleryFiles,
    setGalleryFile,
    clearDraft,
  };
}
