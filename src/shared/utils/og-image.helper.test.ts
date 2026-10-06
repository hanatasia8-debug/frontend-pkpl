import { describe, expect, it } from "vitest";
import {
  SITE_URL,
  buildOpenGraphImage,
  toAbsoluteUrl,
} from "./og-image.helper";

describe("og-image.helper", () => {
  describe("toAbsoluteUrl", () => {
    it("converts relative paths with leading slash to absolute URL", () => {
      expect(toAbsoluteUrl("/images/placeholder-umkm.jpg")).toBe(
        `${SITE_URL}/images/placeholder-umkm.jpg`,
      );
    });

    it("converts relative paths without leading slash to absolute URL", () => {
      expect(toAbsoluteUrl("uploads/foto.png")).toBe(
        `${SITE_URL}/uploads/foto.png`,
      );
    });

    it("preserves already absolute HTTP/HTTPS URLs (e.g. Supabase Storage)", () => {
      const supabaseUrl =
        "https://xyz.supabase.co/storage/v1/object/public/images/cover.jpg";
      expect(toAbsoluteUrl(supabaseUrl)).toBe(supabaseUrl);
    });

    it("falls back to default og-image when path is empty, null, or undefined", () => {
      expect(toAbsoluteUrl("")).toBe(`${SITE_URL}/images/og-image.png`);
      expect(toAbsoluteUrl(null)).toBe(`${SITE_URL}/images/og-image.png`);
      expect(toAbsoluteUrl(undefined)).toBe(`${SITE_URL}/images/og-image.png`);
      expect(toAbsoluteUrl("   ")).toBe(`${SITE_URL}/images/og-image.png`);
    });

    it("supports custom fallback path", () => {
      expect(toAbsoluteUrl("", "/custom-fallback.jpg")).toBe(
        `${SITE_URL}/custom-fallback.jpg`,
      );
    });
  });

  describe("buildOpenGraphImage", () => {
    it("builds complete OpenGraph descriptor with 1200x630 dimensions", () => {
      const result = buildOpenGraphImage(
        "https://example.com/cover.jpg",
        "Judul Berita",
      );
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        url: "https://example.com/cover.jpg",
        secureUrl: "https://example.com/cover.jpg",
        width: 1200,
        height: 630,
        alt: "Judul Berita",
        type: "image/jpeg",
      });
    });

    it("detects PNG mime type properly", () => {
      const result = buildOpenGraphImage("/logo.png", "Logo Toko");
      expect(result[0].type).toBe("image/png");
      expect(result[0].url).toBe(`${SITE_URL}/logo.png`);
    });

    it("detects WebP mime type properly", () => {
      const result = buildOpenGraphImage("/photo.webp", "Foto Produk");
      expect(result[0].type).toBe("image/webp");
      expect(result[0].url).toBe(`${SITE_URL}/photo.webp`);
    });

    it("handles query params in image URLs when detecting extension", () => {
      const result = buildOpenGraphImage(
        "https://example.com/image.png?width=800",
        "Foto",
      );
      expect(result[0].type).toBe("image/png");
    });
  });
});
