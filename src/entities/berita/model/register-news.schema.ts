import { z } from "zod";

export const registerNewsSchema = z
  .object({
    title: z.string().min(1, "Judul berita wajib diisi"),
    newsCategoryId: z.preprocess(
      (val) => String(val ?? ""),
      z.string().min(1, "Kategori berita wajib dipilih"),
    ),
    newCategoryName: z.string().optional().nullable(),
    newsTypeId: z.enum(["STANDARD", "GALLERY"], {
      message: "Tipe template berita wajib dipilih",
    }),
    authorName: z.string().min(1, "Nama penulis / pengirim wajib diisi"),
    phone: z.string().min(1, "Nomor WhatsApp pengirim wajib diisi"),
    villagePotentialId: z.preprocess(
      (val) => (val ? String(val) : null),
      z.string().nullable().optional(),
    ),
    excerpt: z.string().optional().nullable(),
    coverUrl: z.string().min(1, "Foto cover utama wajib diunggah"),
    coverCaption: z.string().nullable().optional(),
    blocks: z
      .array(
        z.object({
          subHeading: z.string().nullable().optional(),
          content: z.string().optional(),
          imageUrl: z.string().nullable().optional(),
          sortOrder: z.preprocess(
            (val) => (val === undefined || val === null ? 0 : Number(val)),
            z.number().int(),
          ),
        }),
      )
      .optional(),
    galleryImages: z
      .array(
        z.object({
          imageUrl: z.string().optional(),
          imageDescription: z.string().nullable().optional(),
          sortOrder: z.preprocess(
            (val) => (val === undefined || val === null ? 0 : Number(val)),
            z.number().int(),
          ),
        }),
      )
      .optional(),
  })
  .superRefine((data, ctx) => {
    // 1. Validasi Kategori "Lainnya"
    if (
      data.newsCategoryId === "other" &&
      (!data.newCategoryName || !data.newCategoryName.trim())
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Nama kategori baru wajib diisi jika memilih 'Lainnya'",
        path: ["newCategoryName"],
      });
    }

    // 2. Validasi Tipe STANDARD (HANYA validasi blocks, ABAIKAN galleryImages)
    if (data.newsTypeId === "STANDARD") {
      if (!data.blocks || data.blocks.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Berita tipe Standard wajib memiliki minimal 1 sub-bab paragraf",
          path: ["blocks"],
        });
      } else {
        data.blocks.forEach((block, idx) => {
          if (!block.content || !block.content.trim()) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: `Isi paragraf sub-bab #${idx + 1} wajib diisi`,
              path: ["blocks", idx, "content"],
            });
          }
        });
      }
    }

    // 3. Validasi Tipe GALLERY (HANYA validasi galleryImages, ABAIKAN blocks)
    if (data.newsTypeId === "GALLERY") {
      if (!data.galleryImages || data.galleryImages.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Berita tipe Galeri wajib memiliki minimal 1 foto galeri",
          path: ["galleryImages"],
        });
      } else {
        data.galleryImages.forEach((img, idx) => {
          if (!img.imageUrl || !img.imageUrl.trim()) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: `Foto galeri #${idx + 1} wajib diunggah`,
              path: ["galleryImages", idx, "imageUrl"],
            });
          }
        });
      }
    }
  });

export type RegisterNewsDTO = z.infer<typeof registerNewsSchema>;
