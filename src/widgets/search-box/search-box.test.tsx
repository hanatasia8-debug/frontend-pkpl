/**
 * Unit Test — SearchBox (Fitur 7: Pencarian dan Filter Katalog — RQ-007 / FS-007)
 *
 * Target utama : SearchBox (src/widgets/search-box/search-box.tsx)
 *                Digunakan oleh UmkmSearchInput (`/umkm?cari=<dusun>&kategori=<slug>`)
 * Pola         : Arrange – Act – Assert (AAA)
 *
 * Test Double yang dipakai:
 *  1. STUB  → `usePathname` & `useSearchParams` dari `next/navigation` distub agar
 *             mengembalikan pathname "/umkm" dan `URLSearchParams` terkontrol.
 *  2. MOCK  → `router.replace` diverifikasi pemanggilan URL query string-nya (mempertahankan
 *             filter kategori, mengatur `?cari=`, dan mereset `halaman` ke 1 / null).
 *  3. FAKE  → `vi.useFakeTimers()` menggantikan clock/timer sistem untuk menguji debounce
 *             400ms secara deterministik dan instan.
 *  4. SPY   → `vi.spyOn(globalThis, "clearTimeout")` memverifikasi pembatalan timer debounce
 *             lama ketika pengguna mengetik beruntun.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";

const replaceMock = vi.fn();
let mockPathname = "/umkm";
let mockSearchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock }),
  usePathname: () => mockPathname,
  useSearchParams: () => mockSearchParams,
}));

import { SearchBox } from "./search-box";

beforeEach(() => {
  mockPathname = "/umkm";
  mockSearchParams = new URLSearchParams();
  replaceMock.mockReset();
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  cleanup();
});

describe("SearchBox — White-Box Test Cases (Fitur 7: Pencarian & Filter Katalog)", () => {
  it("TC-01: mengetik kata kunci dusun dengan filter kategori & halaman aktif → debounce 400ms, pertahankan kategori, reset halaman", () => {
    // Arrange
    vi.useFakeTimers(); // FAKE timer
    mockSearchParams = new URLSearchParams("kategori=kuliner&halaman=3"); // STUB URL params
    render(
      <SearchBox
        id="cari-umkm"
        label="Cari UMKM"
        placeholder="Cari nama usaha atau dusun..."
      />,
    );
    const input = screen.getByLabelText("Cari UMKM");

    // Act — ketik "Krajan", cek belum dipanggil sebelum 400ms
    fireEvent.change(input, { target: { value: "  Krajan  " } });
    act(() => {
      vi.advanceTimersByTime(399);
    });
    expect(replaceMock).not.toHaveBeenCalled();

    // Act — genapkan 400ms
    act(() => {
      vi.advanceTimersByTime(1);
    });

    // Assert
    expect(replaceMock).toHaveBeenCalledTimes(1); // MOCK
    expect(replaceMock).toHaveBeenCalledWith(
      "/umkm?kategori=kuliner&cari=Krajan",
      { scroll: false },
    );
  });

  it("TC-02: mengetik beruntun membatalkan timer debounce sebelumnya via clearTimeout (cleanup)", () => {
    // Arrange
    vi.useFakeTimers(); // FAKE
    const clearSpy = vi.spyOn(globalThis, "clearTimeout"); // SPY
    render(
      <SearchBox id="cari-umkm" label="Cari UMKM" placeholder="Cari UMKM..." />,
    );
    const input = screen.getByLabelText("Cari UMKM");

    // Act
    fireEvent.change(input, { target: { value: "Kr" } });
    act(() => {
      vi.advanceTimersByTime(200);
    });
    fireEvent.change(input, { target: { value: "Krajan" } });
    act(() => {
      vi.advanceTimersByTime(400);
    });

    // Assert
    expect(clearSpy).toHaveBeenCalled(); // SPY
    expect(replaceMock).toHaveBeenCalledTimes(1); // MOCK: hanya 1 navigasi terakhir
    expect(replaceMock).toHaveBeenCalledWith("/umkm?cari=Krajan", { scroll: false });
  });

  it("TC-03: mengetik hanya spasi kosong → menghapus parameter cari dari URL (value.trim() || null)", () => {
    // Arrange
    vi.useFakeTimers(); // FAKE
    mockSearchParams = new URLSearchParams("cari=Krajan&kategori=kuliner"); // STUB
    render(
      <SearchBox id="cari-umkm" label="Cari UMKM" placeholder="Cari UMKM..." />,
    );
    const input = screen.getByLabelText("Cari UMKM");

    // Act
    fireEvent.change(input, { target: { value: "   " } });
    act(() => {
      vi.advanceTimersByTime(400);
    });

    // Assert
    expect(replaceMock).toHaveBeenCalledWith("/umkm?kategori=kuliner", {
      scroll: false,
    }); // MOCK
  });

  it("TC-04: tombol clear muncul saat input terisi dan langsung mereset URL tanpa menunggu debounce", () => {
    // Arrange
    vi.useFakeTimers(); // FAKE
    mockSearchParams = new URLSearchParams("cari=Krajan&kategori=kuliner&halaman=2"); // STUB
    render(
      <SearchBox id="cari-umkm" label="Cari UMKM" placeholder="Cari UMKM..." />,
    );

    // Act
    const clearBtn = screen.getByRole("button", {
      name: "Hapus kata kunci pencarian",
    });
    fireEvent.click(clearBtn);

    // Assert — langsung dipanggil (bypass debounce 400ms)
    expect(replaceMock).toHaveBeenCalledTimes(1); // MOCK
    expect(replaceMock).toHaveBeenCalledWith("/umkm?kategori=kuliner", {
      scroll: false,
    });
    expect(screen.getByLabelText("Cari UMKM")).toHaveValue("");
    expect(
      screen.queryByRole("button", { name: "Hapus kata kunci pencarian" }),
    ).not.toBeInTheDocument();
  });

  it("TC-05: sinkronisasi balik saat URL berubah dari luar (tombol back browser / reset chip)", () => {
    // Arrange
    mockSearchParams = new URLSearchParams("cari=Krajan"); // STUB
    const { rerender } = render(
      <SearchBox id="cari-umkm" label="Cari UMKM" placeholder="Cari UMKM..." />,
    );
    expect(screen.getByLabelText("Cari UMKM")).toHaveValue("Krajan");

    // Act — URL berubah dari luar menjadi "Bantur"
    mockSearchParams = new URLSearchParams("cari=Bantur");
    rerender(
      <SearchBox id="cari-umkm" label="Cari UMKM" placeholder="Cari UMKM..." />,
    );

    // Assert
    expect(screen.getByLabelText("Cari UMKM")).toHaveValue("Bantur");
    expect(replaceMock).not.toHaveBeenCalled(); // MOCK: tidak memicu navigasi ulang
  });

  it("TC-06: input awal kosong → tombol clear tidak dirender dan tidak memicu router.replace", () => {
    // Arrange
    vi.useFakeTimers(); // FAKE
    render(
      <SearchBox id="cari-umkm" label="Cari UMKM" placeholder="Cari UMKM..." />,
    );

    // Act
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // Assert
    expect(screen.getByLabelText("Cari UMKM")).toHaveValue("");
    expect(
      screen.queryByRole("button", { name: "Hapus kata kunci pencarian" }),
    ).not.toBeInTheDocument();
    expect(replaceMock).not.toHaveBeenCalled(); // MOCK
  });
});
