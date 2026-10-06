"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Icon } from "@/shared/ui/icon";
import { FallbackImage } from "@/shared/ui/fallback-image";
import { AdminNewsService } from "@/entities/admin/api/admin-news.service";
import type { NewsStatus } from "@/entities/admin/model/admin.types";
import { generateAutoExcerpt } from "@/shared/utils/news-excerpt.helper";
import type { ApiSuccessBody } from "@/shared/api/response";
import { apiClient } from "@/shared/api/axios-instance";
import { compressImage, type ImagePreset } from "@/shared/utils/image-compression";

interface ContentBlockInput {
  subHeading: string;
  content: string;
  imageUrl: string;
}

interface NewsCategoryLocal {
  id: string | number;
  name: string;
  slug: string;
}

interface AdminNewsDetail {
  title?: string;
  categoryName?: string;
  excerpt?: string;
  summary?: string;
  coverUrl?: string;
  coverImage?: string;
  status?: NewsStatus;
  contentSections?: Array<{
    sectionTitle?: string | null;
    paragraph?: string;
    sectionImage?: string | null;
  }>;
  contentBlocks?: Array<{
    subHeading?: string;
    content: string;
    imageUrl?: string;
  }>;
}

export function AdminBeritaEditor({
  isNew = true,
  newsId,
}: {
  isNew?: boolean;
  newsId?: string;
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [categories, setCategories] = useState<NewsCategoryLocal[]>([]);
  const [newsCategoryId, setNewsCategoryId] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [status, setStatus] = useState<NewsStatus>("PUBLISHED");
  const [blocks, setBlocks] = useState<ContentBlockInput[]>([
    { subHeading: "", content: "", imageUrl: "" },
  ]);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [blockFiles, setBlockFiles] = useState<Record<number, File>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const uploadSingleFile = async (
    file: File,
    preset: ImagePreset = "banner",
  ): Promise<string> => {
    const compressed = await compressImage(file, preset);
    const formData = new FormData();
    formData.append("file", compressed);

    // Go through apiClient (relative "/api", routed by next.config.ts
    // rewrites) instead of manually building
    // `${window.location.hostname}:3000/api/...` — that hardcoded the
    // backend port onto whatever host the browser happened to be on,
    // breaking in Docker/production where the backend isn't reachable at
    // "<frontend-host>:3000". Same underlying issue as the next.config.ts
    // rewrite bug fixed earlier, just reintroduced here in app code.
    const { data } = await apiClient.post<ApiSuccessBody<{ url: string }>>(
      "/uploads?category=news",
      formData,
      { timeout: 60000 },
    );
    if (!data?.data?.url) {
      throw new Error("Gagal mengunggah gambar");
    }
    return data.data.url;
  };

  const DRAFT_KEY = "admin_news_draft_v1";

  const clearDraft = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(DRAFT_KEY);
    }
  };

  useEffect(() => {
    AdminNewsService.getCategories()
      .then((items) => {
        if (items && items.length > 0) {
          setCategories(items);
          if (!newsId && !newsCategoryId) {
            setNewsCategoryId(String(items[0].id));
          }
        }
      })
      .catch((err) => console.error("Gagal memuat kategori berita:", err));
  }, [newsId, newsCategoryId]);

  useEffect(() => {
    if (newsId) {
      AdminNewsService.getNewsById(newsId).then((data) => {
        if (data) {
          const detail = data as unknown as AdminNewsDetail;
          setTitle(detail.title || "");
          setCoverUrl(detail.coverUrl || detail.coverImage || "");
          setStatus(detail.status || "PUBLISHED");
          if ((detail as Record<string, unknown>).newsCategoryId) {
            setNewsCategoryId(
              String((detail as Record<string, unknown>).newsCategoryId),
            );
          }

          if (detail.contentSections && detail.contentSections.length > 0) {
            setBlocks(
              detail.contentSections.map((sec) => ({
                subHeading: sec.sectionTitle || "",
                content: sec.paragraph || "",
                imageUrl: sec.sectionImage || "",
              })),
            );
          } else if (detail.contentBlocks && detail.contentBlocks.length > 0) {
            setBlocks(
              detail.contentBlocks.map((b) => ({
                subHeading: b.subHeading || "",
                content: b.content || "",
                imageUrl: b.imageUrl || "",
              })),
            );
          }
        }
      });
    } else if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(DRAFT_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          setTimeout(() => {
            if (parsed.title) setTitle(parsed.title);
            if (parsed.newsCategoryId) setNewsCategoryId(parsed.newsCategoryId);
            if (parsed.newCategoryName) setNewCategoryName(parsed.newCategoryName);
            if (parsed.coverUrl) setCoverUrl(parsed.coverUrl);
            if (parsed.status) setStatus(parsed.status);
            if (parsed.blocks) setBlocks(parsed.blocks);
          }, 0);
        }
      } catch (e) {
        console.error("Gagal memulihkan draf berita admin:", e);
      }
    }
  }, [newsId]);

  useEffect(() => {
    if (typeof window !== "undefined" && !newsId) {
      try {
        const draft = { title, newsCategoryId, newCategoryName, coverUrl, status, blocks };
        localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      } catch (e) {
        console.error("Gagal menyimpan draf berita admin:", e);
      }
    }
  }, [title, newsCategoryId, newCategoryName, coverUrl, status, blocks, newsId]);

  const addBlock = () => {
    setBlocks([...blocks, { subHeading: "", content: "", imageUrl: "" }]);
  };

  const updateBlock = (
    index: number,
    key: keyof ContentBlockInput,
    value: string,
  ) => {
    const next = [...blocks];
    next[index][key] = value;
    setBlocks(next);
  };

  const removeBlock = (index: number) => {
    setBlocks(blocks.filter((_, i) => i !== index));
    setBlockFiles((prev) => {
      const next = { ...prev };
      delete next[index];
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. Upload cover photo if new file selected
      let finalCoverUrl = coverUrl;
      if (coverFile) {
        finalCoverUrl = await uploadSingleFile(coverFile, "banner");
        if (coverUrl.startsWith("blob:")) {
          URL.revokeObjectURL(coverUrl);
        }
      }

      // 2. Upload block photos if new files selected
      const finalBlocks = await Promise.all(
        blocks.map(async (block, idx) => {
          let finalBlockImgUrl = block.imageUrl;
          const localBlockFile = blockFiles[idx];
          if (localBlockFile) {
            finalBlockImgUrl = await uploadSingleFile(
              localBlockFile,
              "gallery",
            );
            if (block.imageUrl.startsWith("blob:")) {
              URL.revokeObjectURL(block.imageUrl);
            }
          }
          return {
            subHeading: block.subHeading,
            content: block.content,
            imageUrl: finalBlockImgUrl,
          };
        }),
      );

      const autoExcerpt = generateAutoExcerpt({
        newsTypeId: "STANDARD",
        title,
        blocks: finalBlocks.map((b) => ({
          content: b.content,
          subHeading: b.subHeading,
        })),
      });

      if (newsCategoryId === "other" && !newCategoryName.trim()) {
        alert("Harap masukkan nama kategori berita baru.");
        setIsSubmitting(false);
        return;
      }

      const payload = {
        title,
        newsCategoryId: String(newsCategoryId),
        newCategoryName:
          newsCategoryId === "other" ? newCategoryName.trim() : undefined,
        newsTypeId: "STANDARD",
        excerpt: autoExcerpt,
        coverUrl: finalCoverUrl,
        status,
        blocks: finalBlocks,
      };

      if (isNew) {
        await AdminNewsService.createNews(
          payload as unknown as Parameters<
            typeof AdminNewsService.createNews
          >[0],
        );
      } else if (newsId) {
        const { success } = await AdminNewsService.updateNews(
          newsId,
          payload as unknown as Parameters<
            typeof AdminNewsService.updateNews
          >[1],
        );
        if (!success) {
          throw new Error("Gagal menyimpan perubahan berita ke server.");
        }
      }
      clearDraft();
      router.push("/admin/berita");
    } catch (err) {
      console.error("Gagal menyimpan berita:", err);
      alert(
        "Gagal menyimpan berita. Harap pastikan format berupa gambar dan ukuran di bawah 10MB.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/admin/berita"
            onClick={clearDraft}
            className="text-primary font-label-sm mb-2 inline-flex items-center gap-1.5 text-xs font-bold hover:underline"
          >
            <Icon name="arrow_back" className="text-base" /> Kembali ke Daftar
            Berita
          </Link>
          <h2 className="font-headline-lg text-primary text-3xl font-bold">
            {isNew
              ? "Tulis & Edit Berita Baru (Live Split-View)"
              : "Sunting Berita"}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/berita"
            onClick={clearDraft}
            className="bg-surface border-outline-variant text-on-surface hover:bg-surface-container-high rounded-2xl border px-5 py-3 text-xs font-bold transition"
          >
            Batal
          </Link>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-primary text-on-primary hover:bg-primary/90 flex items-center gap-2 rounded-2xl px-6 py-3 text-xs font-bold shadow-md transition"
          >
            {isSubmitting ? (
              <>
                <svg
                  className="h-4 w-4 animate-spin text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <Icon name="save" className="text-base" />
                <span>Simpan Berita</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Split-View Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left Side: Editor Form */}
        <div className="bg-surface-container-lowest border-outline-variant/30 space-y-6 rounded-2xl border p-6 shadow-sm">
          <div>
            <label className="font-label-sm text-on-surface-variant mb-2 block text-xs font-bold uppercase">
              Judul Berita Utama
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-surface border-outline-variant text-on-surface focus:border-primary w-full rounded-2xl border p-3.5 text-sm font-bold outline-none"
              placeholder="Masukkan judul berita utama..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-label-sm text-on-surface-variant mb-2 block text-xs font-bold uppercase">
                Kategori Berita
              </label>
              <select
                value={newsCategoryId}
                onChange={(e) => setNewsCategoryId(e.target.value)}
                className="bg-surface border-outline-variant text-on-surface focus:border-primary w-full rounded-2xl border p-3.5 text-sm font-semibold outline-none"
              >
                {categories.length === 0 && (
                  <option value="">Memuat kategori...</option>
                )}
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
                <option value="other">+ Tambah Kategori Baru</option>
              </select>

              {newsCategoryId === "other" && (
                <div className="mt-2.5 space-y-1">
                  <input
                    type="text"
                    required
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Ketik nama kategori baru..."
                    className="bg-surface border-primary text-on-surface focus:ring-primary/20 w-full rounded-xl border p-3 text-xs font-bold outline-none focus:ring-2"
                  />
                  <p className="text-on-surface-variant text-[11px]">
                    * Kategori baru akan otomatis ditambahkan ke sistem
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="font-label-sm text-on-surface-variant mb-2 block text-xs font-bold uppercase">
                Status Publikasi
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as NewsStatus)}
                className="bg-surface border-outline-variant text-on-surface focus:border-primary w-full rounded-2xl border p-3.5 text-sm font-semibold outline-none"
              >
                <option value="PUBLISHED">PUBLISHED (Langsung Terbit)</option>
                <option value="PENDING">PENDING (Menunggu Review)</option>
                <option value="DRAFT">DRAFT (Konsep Simpan)</option>
                <option value="REJECTED">REJECTED (Ditolak)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-label-sm text-on-surface-variant mb-2 block text-xs font-bold uppercase">
              Foto Sampul Utama (Cover Image)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="url"
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                className="bg-surface border-outline-variant text-on-surface focus:border-primary flex-1 rounded-2xl border p-3.5 text-xs outline-none"
                placeholder="https://..."
              />
              <label className="bg-primary text-on-primary hover:bg-primary/90 flex h-12 cursor-pointer items-center justify-center gap-1.5 rounded-2xl px-4 text-xs font-bold whitespace-nowrap shadow-sm transition">
                <Icon name="image" className="text-base" />
                Pilih Foto
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setCoverFile(file);
                      const localUrl = URL.createObjectURL(file);
                      setCoverUrl(localUrl);
                    }
                  }}
                />
              </label>
            </div>
          </div>

          {/* Dinamis Paragraf Blocks */}
          <div className="space-y-4 border-t pt-6">
            <div className="flex items-center justify-between">
              <h4 className="text-primary text-sm font-bold tracking-wider uppercase">
                Blok Paragraf & Sub-Heading Artikels
              </h4>
              <button
                type="button"
                onClick={addBlock}
                className="bg-primary/10 text-primary hover:bg-primary hover:text-on-primary flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-bold transition"
              >
                <Icon name="add" className="text-sm" /> Tambah Blok
              </button>
            </div>

            {blocks.map((block, idx) => (
              <div
                key={idx}
                className="bg-surface border-outline-variant/30 relative space-y-3 rounded-2xl border p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-primary text-xs font-bold">
                    Blok #{idx + 1}
                  </span>
                  {blocks.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeBlock(idx)}
                      className="text-error text-xs font-bold hover:underline"
                    >
                      Hapus Blok
                    </button>
                  )}
                </div>

                <input
                  type="text"
                  value={block.subHeading}
                  onChange={(e) =>
                    updateBlock(idx, "subHeading", e.target.value)
                  }
                  placeholder="Sub-Heading (Opsional)..."
                  className="bg-surface-container-lowest border-outline-variant text-on-surface w-full rounded-xl border p-2.5 text-xs font-bold outline-none"
                />

                <textarea
                  rows={3}
                  value={block.content}
                  onChange={(e) => updateBlock(idx, "content", e.target.value)}
                  placeholder="Isi uraian paragraf berita..."
                  className="bg-surface-container-lowest border-outline-variant text-on-surface w-full rounded-xl border p-2.5 text-xs leading-relaxed outline-none"
                />

                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={block.imageUrl}
                    onChange={(e) =>
                      updateBlock(idx, "imageUrl", e.target.value)
                    }
                    placeholder="URL Foto Sisipan (Opsional)..."
                    className="bg-surface-container-lowest border-outline-variant text-on-surface flex-1 rounded-xl border p-2.5 text-xs outline-none"
                  />
                  <label className="bg-secondary-container text-on-secondary-container hover:bg-secondary-container/85 flex h-10 cursor-pointer items-center justify-center gap-1.5 rounded-xl px-3 text-xs font-bold whitespace-nowrap transition">
                    <Icon name="image" className="text-sm" />
                    Pilih Foto
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setBlockFiles((prev) => ({ ...prev, [idx]: file }));
                          const localUrl = URL.createObjectURL(file);
                          updateBlock(idx, "imageUrl", localUrl);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Kolom Kanan: Live Real-Time Public Article Preview */}
        <div className="sticky top-24 space-y-4">
          <div className="bg-surface-container-lowest border-outline-variant/30 space-y-6 rounded-3xl border p-8 shadow-xl">
            <div className="flex items-center justify-between border-b pb-4">
              <span className="bg-primary/10 text-primary font-label-sm inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-bold">
                <Icon name="visibility" className="text-sm" /> Live Pratinjau
                Tampilan Publik
              </span>
              <span className="text-on-surface-variant text-xs font-medium">
                Real-time Layout
              </span>
            </div>

            {/* Layout Pratinjau Artikel */}
            <div className="space-y-6">
              <div className="bg-surface-container relative aspect-[16/9] overflow-hidden rounded-2xl">
                <FallbackImage
                  src={coverUrl}
                  alt={title}
                  className="h-full w-full object-cover"
                />
              </div>

              <div>
                <span className="bg-secondary-container text-on-secondary-container rounded-full px-3 py-1 text-xs font-bold">
                  {newsCategoryId === "other"
                    ? newCategoryName || "Kategori Baru"
                    : categories.find((c) => String(c.id) === newsCategoryId)
                        ?.name || "Kategori Berita"}
                </span>
                <h1 className="font-headline-lg text-primary mt-3 text-2xl leading-tight font-bold">
                  {title || "Judul Berita Belum Diisi"}
                </h1>
                <p className="text-on-surface-variant mt-2 text-xs">
                  Diterbitkan oleh{" "}
                  <span className="text-primary font-semibold">
                    Pemerintah Desa Pringgodani
                  </span>{" "}
                  •{" "}
                  {new Date().toLocaleDateString("id-ID", {
                    dateStyle: "full",
                  })}
                </p>
              </div>

              <div className="text-on-surface-variant border-t border-b py-4 text-sm leading-relaxed italic">
                &quot;
                {generateAutoExcerpt({
                  newsTypeId: "STANDARD",
                  title,
                  blocks: blocks.map((b) => ({
                    content: b.content,
                    subHeading: b.subHeading,
                  })),
                })}
                &quot;
              </div>

              <div className="space-y-6">
                {blocks.map((block, idx) => (
                  <div key={idx} className="space-y-3">
                    {block.subHeading && (
                      <h3 className="font-headline-md text-primary text-lg font-bold">
                        {block.subHeading}
                      </h3>
                    )}
                    <p className="text-on-surface-variant text-sm leading-relaxed whitespace-pre-line">
                      {block.content || "Isi paragraf..."}
                    </p>
                    {block.imageUrl && (
                      <div className="bg-surface-container aspect-[16/9] overflow-hidden rounded-2xl">
                        <FallbackImage
                          src={block.imageUrl}
                          alt={block.subHeading}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
