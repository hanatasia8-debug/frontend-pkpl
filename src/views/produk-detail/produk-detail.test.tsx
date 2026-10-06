import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProductOrderBox } from "./sections/product-order-box";
import { ProductBreadcrumb } from "./sections/product-breadcrumb";
import { ProductTrustBadges } from "./sections/product-trust-badges";
import type { ProductDetailDto } from "@/entities/produk/model/types";

const mockProduct: ProductDetailDto = {
  id: "prod-1",
  name: "Keripik Tempe Renyah",
  description: "Keripik tempe khas Desa Pringgodani dengan bumbu rempah alami pilihan.",
  price: 15000,
  imageUrl: "https://example.com/keripik.jpg",
  umkmId: "umkm-1",
  umkm: {
    id: "umkm-1",
    name: "Camilan Berkah",
    slug: "camilan-berkah",
    phone: "081234567890",
    address: "Dusun Krajan, RT 01 / RW 02",
    category: {
      id: "cat-1",
      name: "Kuliner",
      slug: "kuliner",
    },
  },
};

describe("Product Detail Components", () => {
  describe("ProductBreadcrumb", () => {
    it("renders breadcrumbs with home, produk, category, and product name", () => {
      render(
        <ProductBreadcrumb
          productName="Keripik Tempe Renyah"
          categoryName="Kuliner"
          categorySlug="kuliner"
        />,
      );

      expect(screen.getByText("Beranda")).toBeInTheDocument();
      expect(screen.getByText("Produk")).toBeInTheDocument();
      expect(screen.getByText("Kuliner")).toBeInTheDocument();
      expect(screen.getByText("Keripik Tempe Renyah")).toBeInTheDocument();
      expect(screen.getByText("Katalog")).toBeInTheDocument();
    });
  });

  describe("ProductTrustBadges", () => {
    it("renders authentic village trust badges", () => {
      render(<ProductTrustBadges />);

      expect(screen.getByText("100% Asli Pringgodani")).toBeInTheDocument();
      expect(screen.getByText("Pesan Langsung via WA")).toBeInTheDocument();
      expect(screen.getByText("Tanpa Biaya Admin")).toBeInTheDocument();
      expect(screen.getByText("Bisa COD / Ambil di Lokasi")).toBeInTheDocument();
    });
  });

  describe("ProductOrderBox", () => {
    it("renders product name, price, initial quantity of 1, and estimated total", () => {
      render(<ProductOrderBox product={mockProduct} />);

      expect(screen.getByText("Keripik Tempe Renyah")).toBeInTheDocument();
      // "Rp 15.000" appears in both unit price and initial subtotal
      expect(screen.getAllByText("Rp 15.000")).toHaveLength(2);
      expect(screen.getByText("1")).toBeInTheDocument();
      expect(screen.getByText("Pesan Sekarang via WhatsApp (1 item)")).toBeInTheDocument();
    });

    it("increments quantity and updates subtotal calculation", () => {
      render(<ProductOrderBox product={mockProduct} />);

      const plusBtn = screen.getByLabelText("Tambah kuantitas");
      fireEvent.click(plusBtn);

      expect(screen.getByText("2")).toBeInTheDocument();
      // Unit price remains Rp 15.000, subtotal becomes Rp 30.000
      expect(screen.getByText("Rp 15.000")).toBeInTheDocument();
      expect(screen.getByText("Rp 30.000")).toBeInTheDocument();
      expect(screen.getByText("Pesan Sekarang via WhatsApp (2 item)")).toBeInTheDocument();
    });

    it("decrements quantity but prevents falling below 1", () => {
      render(<ProductOrderBox product={mockProduct} />);

      const plusBtn = screen.getByLabelText("Tambah kuantitas");
      const minusBtn = screen.getByLabelText("Kurangi kuantitas");

      // Increment to 2
      fireEvent.click(plusBtn);
      expect(screen.getByText("2")).toBeInTheDocument();
      expect(screen.getByText("Rp 30.000")).toBeInTheDocument();

      // Decrement back to 1
      fireEvent.click(minusBtn);
      expect(screen.getByText("1")).toBeInTheDocument();
      expect(screen.getAllByText("Rp 15.000")).toHaveLength(2);

      // Click minus again - should remain 1 because disabled
      fireEvent.click(minusBtn);
      expect(screen.getByText("1")).toBeInTheDocument();
    });
  });
});
