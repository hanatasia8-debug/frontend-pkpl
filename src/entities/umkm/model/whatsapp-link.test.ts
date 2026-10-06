import { describe, expect, it } from "vitest";
import {
  buildWhatsappLink,
  createWhatsappUrl,
  formatWhatsappNumber,
  normalizeWhatsappNumber,
} from "./whatsapp-link";

describe("WhatsApp Link & Formatter Utilities", () => {
  describe("normalizeWhatsappNumber", () => {
    it("normalizes local '08...' prefix into '628...'", () => {
      expect(normalizeWhatsappNumber("081234567890")).toBe("6281234567890");
      expect(normalizeWhatsappNumber("085712345678")).toBe("6285712345678");
    });

    it("handles '+62...' international format with symbols, spaces, and dashes", () => {
      expect(normalizeWhatsappNumber("+6281234567890")).toBe("6281234567890");
      expect(normalizeWhatsappNumber("+62 812-3456-7890")).toBe("6281234567890");
      expect(normalizeWhatsappNumber("62 812 3456 7890")).toBe("6281234567890");
      expect(normalizeWhatsappNumber("(+62) 812-3456-7890")).toBe("6281234567890");
    });

    it("handles accidental '6208...' double prefix", () => {
      expect(normalizeWhatsappNumber("+62 081234567890")).toBe("6281234567890");
      expect(normalizeWhatsappNumber("62081234567890")).toBe("6281234567890");
    });

    it("handles missing prefix '81234567890'", () => {
      expect(normalizeWhatsappNumber("81234567890")).toBe("6281234567890");
    });

    it("returns empty string for invalid, empty, or too short inputs", () => {
      expect(normalizeWhatsappNumber("")).toBe("");
      expect(normalizeWhatsappNumber(null)).toBe("");
      expect(normalizeWhatsappNumber(undefined)).toBe("");
      expect(normalizeWhatsappNumber("abc")).toBe("");
      expect(normalizeWhatsappNumber("12345")).toBe(""); // Too short (< 9 digits)
      expect(normalizeWhatsappNumber("-")).toBe("");
    });
  });

  describe("createWhatsappUrl", () => {
    it("generates correct https://wa.me URL with clean number and prefilled text", () => {
      const url = createWhatsappUrl(
        "081234567890",
        "Halo, saya ingin pesan produk.",
      );
      expect(url).toBe(
        "https://wa.me/6281234567890?text=Halo%2C%20saya%20ingin%20pesan%20produk.",
      );
    });

    it("generates url without text query param if message is omitted", () => {
      const url = createWhatsappUrl("081234567890");
      expect(url).toBe("https://wa.me/6281234567890");
    });

    it("returns empty string when phone number is invalid or missing", () => {
      expect(createWhatsappUrl("")).toBe("");
      expect(createWhatsappUrl(null)).toBe("");
      expect(createWhatsappUrl(undefined)).toBe("");
      expect(createWhatsappUrl("invalid-phone")).toBe("");
    });
  });

  describe("buildWhatsappLink", () => {
    it("builds the standard UMKM inquiry link with properly encoded message", () => {
      const url = buildWhatsappLink("081234567890", "Warung Berkah");
      expect(url).toBe(
        "https://wa.me/6281234567890?text=Halo%2C%20saya%20tertarik%20dengan%20produk%20dari%20Warung%20Berkah%20yang%20saya%20lihat%20di%20katalog%20Lokal%20Pringgodani.",
      );
    });

    it("handles already normalized '628...' number", () => {
      const url = buildWhatsappLink("6281234567890", "Batik Maju");
      expect(url).toContain("https://wa.me/6281234567890");
      expect(url).toContain("Batik%20Maju");
    });

    it("returns empty string if phone is missing", () => {
      expect(buildWhatsappLink("", "Warung Berkah")).toBe("");
      expect(buildWhatsappLink(null, "Warung Berkah")).toBe("");
    });
  });

  describe("formatWhatsappNumber", () => {
    it("formats '081234567890' to '+62 812-3456-7890'", () => {
      expect(formatWhatsappNumber("081234567890")).toBe("+62 812-3456-7890");
    });

    it("formats '6281234567890' to '+62 812-3456-7890'", () => {
      expect(formatWhatsappNumber("6281234567890")).toBe("+62 812-3456-7890");
    });

    it("formats messy raw inputs to nice readable strings", () => {
      expect(formatWhatsappNumber("+62 812 3456 7890")).toBe(
        "+62 812-3456-7890",
      );
      expect(formatWhatsappNumber("81234567890")).toBe("+62 812-3456-7890");
    });

    it("handles empty or invalid gracefully", () => {
      expect(formatWhatsappNumber("")).toBe("-");
      expect(formatWhatsappNumber(null)).toBe("-");
      expect(formatWhatsappNumber(undefined)).toBe("-");
    });
  });
});
