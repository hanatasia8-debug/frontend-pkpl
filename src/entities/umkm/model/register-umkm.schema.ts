import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(1, "Nama produk wajib diisi"),
  description: z.string().min(1, "Deskripsi produk wajib diisi"),
  price: z.preprocess(
    (val) =>
      val === "" || val === undefined || val === null ? null : Number(val),
    z.number().nullable().optional(),
  ),
  imageUrl: z.string().nullable().optional(),
});

export const registerUmkmSchema = z
  .object({
    name: z.string().min(1, "Nama UMKM wajib diisi"),
    ownerName: z.string().min(1, "Nama pemilik wajib diisi"),
    umkmCategoryId: z.preprocess(
      (val) => String(val ?? ""),
      z.string().min(1, "Kategori UMKM wajib dipilih"),
    ),
    newCategoryName: z.string().optional().nullable(),
    description: z.string().min(1, "Deskripsi usaha wajib diisi"),
    phone: z.string().min(1, "Nomor WhatsApp wajib diisi"),
    email: z.preprocess(
      (val) => (val === "" ? null : val),
      z.string().email("Format email tidak valid").nullable().optional(),
    ),
    coverUrl: z.preprocess(
      (val) => (val === "" ? null : val),
      z.string().nullable().optional(),
    ),
    address: z.string().min(1, "Alamat fisik wajib diisi"),
    latitude: z.preprocess(
      (val) =>
        val === "" || val === undefined || val === null ? -8.2811 : Number(val),
      z.number({ message: "Koordinat Latitude wajib diisi" }),
    ),
    longitude: z.preprocess(
      (val) =>
        val === "" || val === undefined || val === null
          ? 112.5664
          : Number(val),
      z.number({ message: "Koordinat Longitude wajib diisi" }),
    ),
    mapsUrl: z.string().nullable().optional(),
    since: z.preprocess(
      (val) =>
        val === "" || val === undefined || val === null ? null : Number(val),
      z.number().int("Tahun berdiri harus angka bulat").nullable().optional(),
    ),
    openDay: z.string().nullable().optional(),
    startTime: z.preprocess(
      (val) => (val === "" ? null : val),
      z
        .string()
        .regex(
          /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
          "Format jam buka tidak valid (HH:MM)",
        )
        .nullable()
        .optional(),
    ),
    endTime: z.preprocess(
      (val) => (val === "" ? null : val),
      z
        .string()
        .regex(
          /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
          "Format jam tutup tidak valid (HH:MM)",
        )
        .nullable()
        .optional(),
    ),
    galleries: z.array(z.string()).optional(),
    products: z.array(productSchema).optional(),
  })
  .refine(
    (data) => {
      if (data.umkmCategoryId === "other") {
        return Boolean(
          data.newCategoryName && data.newCategoryName.trim().length > 0,
        );
      }
      return true;
    },
    {
      message: "Nama kategori baru wajib diisi jika memilih 'Lainnya'",
      path: ["newCategoryName"],
    },
  );

export type RegisterUmkmDTO = z.infer<typeof registerUmkmSchema>;
