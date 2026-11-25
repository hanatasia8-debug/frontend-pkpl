/**
 * Unit Test — ForgotPasswordPage (Fitur 3: Forgot Password — RQ-003 / FS-003)
 *
 * Target utama : handleSubmit() pada ForgotPasswordPage (src/app/admin/forgot-password/page.tsx)
 * Pola         : Arrange – Act – Assert (AAA)
 *
 * Test Double yang dipakai:
 *  1. STUB  → `apiClient.post` diprogram mengembalikan respons pesan kustom, respons kosong,
 *             error backend (error/message), dan network error; `next/link` diganti stub `<a>`.
 *  2. MOCK  → `apiClient.post` diverifikasi pemanggilannya: 1x ke "/auth/forgot-password"
 *             dengan email ter-trim saat format valid, dan 0x saat regex email gagal.
 *  3. SPY   → `vi.spyOn(Event.prototype, "preventDefault")` memverifikasi bahwa submit event
 *             mencegah full-page reload browser tanpa mengubah perilaku event asli.
 */
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";

vi.mock("@/shared/api/axios-instance", () => ({
  apiClient: { post: vi.fn() },
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...rest
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

import { apiClient } from "@/shared/api/axios-instance";
import ForgotPasswordPage from "./page";

const postMock = vi.mocked(apiClient.post);

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  postMock.mockReset();
});

describe("ForgotPasswordPage.handleSubmit() — White-Box Test Cases (Fitur 3)", () => {
  it("TC-01: email valid & API mengembalikan pesan kustom → tampil pesan backend (D1=F, D2=F, D3=F, D4=T, D5=T)", async () => {
    // Arrange
    postMock.mockResolvedValueOnce({
      data: { data: { message: "Tautan pemulihan terkirim ke inbox admin." } },
    }); // STUB
    const preventSpy = vi.spyOn(Event.prototype, "preventDefault"); // SPY
    render(<ForgotPasswordPage />);
    const emailInput = screen.getByLabelText("Email Admin");
    fireEvent.change(emailInput, { target: { value: "admin@pringgodani.desa.id" } });

    // Act
    fireEvent.submit(emailInput.closest("form")!);

    // Assert
    await waitFor(() => {
      expect(
        screen.getByText("Tautan pemulihan terkirim ke inbox admin."),
      ).toBeInTheDocument();
    });
    expect(preventSpy).toHaveBeenCalled(); // SPY
    expect(postMock).toHaveBeenCalledTimes(1); // MOCK
    expect(postMock).toHaveBeenCalledWith("/auth/forgot-password", {
      email: "admin@pringgodani.desa.id",
    });
  });

  it("TC-02: email valid & API tanpa pesan kustom → tampil pesan fallback default (D5=F)", async () => {
    // Arrange
    postMock.mockResolvedValueOnce({ data: {} }); // STUB
    render(<ForgotPasswordPage />);
    const emailInput = screen.getByLabelText("Email Admin");
    fireEvent.change(emailInput, { target: { value: "sekdes@pringgodani.desa.id" } });

    // Act
    fireEvent.submit(emailInput.closest("form")!);

    // Assert
    await waitFor(() => {
      expect(
        screen.getByText("Jika email terdaftar, instruksi pemulihan akan dikirim."),
      ).toBeInTheDocument();
    });
    expect(postMock).toHaveBeenCalledTimes(1); // MOCK
  });

  it("TC-03: email kosong / spasi → error 'Email wajib diisi.' & API tidak dipanggil (D1=T, D3=T)", () => {
    // Arrange
    render(<ForgotPasswordPage />);
    const emailInput = screen.getByLabelText("Email Admin");
    fireEvent.change(emailInput, { target: { value: "   " } });

    // Act
    fireEvent.submit(emailInput.closest("form")!);

    // Assert
    expect(screen.getByText("Email wajib diisi.")).toBeInTheDocument();
    expect(postMock).not.toHaveBeenCalled(); // MOCK
  });

  it("TC-04: email melanggar regex (tanpa domain/TLD) → error format valid & API tidak dipanggil (D1=F, D2=T, D3=T)", () => {
    // Arrange
    render(<ForgotPasswordPage />);
    const emailInput = screen.getByLabelText("Email Admin");
    fireEvent.change(emailInput, { target: { value: "admin@pringgodani" } });

    // Act
    fireEvent.submit(emailInput.closest("form")!);

    // Assert
    expect(
      screen.getByText("Masukkan email dengan format yang valid."),
    ).toBeInTheDocument();
    expect(postMock).not.toHaveBeenCalled(); // MOCK
  });

  it("TC-05: API reject dengan response.data.error → tampil alert error backend (D4=F, D6a=T)", async () => {
    // Arrange
    postMock.mockRejectedValueOnce({
      response: { data: { error: "Layanan SMTP sedang gangguan." } },
    }); // STUB
    render(<ForgotPasswordPage />);
    const emailInput = screen.getByLabelText("Email Admin");
    fireEvent.change(emailInput, { target: { value: "admin@pringgodani.desa.id" } });

    // Act
    fireEvent.submit(emailInput.closest("form")!);

    // Assert
    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Layanan SMTP sedang gangguan.",
      );
    });
  });

  it("TC-06: API reject dengan response.data.message → tampil alert message backend (D4=F, D6b=T)", async () => {
    // Arrange
    postMock.mockRejectedValueOnce({
      response: { data: { message: "Terlalu banyak permintaan reset." } },
    }); // STUB
    render(<ForgotPasswordPage />);
    const emailInput = screen.getByLabelText("Email Admin");
    fireEvent.change(emailInput, { target: { value: "admin@pringgodani.desa.id" } });

    // Act
    fireEvent.submit(emailInput.closest("form")!);

    // Assert
    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Terlalu banyak permintaan reset.",
      );
    });
  });

  it("TC-07: API reject network error tanpa response → tampil pesan fallback default (D4=F, D6=F)", async () => {
    // Arrange
    postMock.mockRejectedValueOnce(new Error("Network Error")); // STUB
    render(<ForgotPasswordPage />);
    const emailInput = screen.getByLabelText("Email Admin");
    fireEvent.change(emailInput, { target: { value: "admin@pringgodani.desa.id" } });

    // Act
    fireEvent.submit(emailInput.closest("form")!);

    // Assert
    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Permintaan reset gagal. Periksa konfigurasi email backend.",
      );
    });
  });
});

describe("ForgotPasswordPage — live onChange, onInvalid, dan state isSending", () => {
  it("onChange membersihkan error saat email valid dan menampilkan error saat dikosongkan", () => {
    // Arrange
    render(<ForgotPasswordPage />);
    const emailInput = screen.getByLabelText("Email Admin");

    // Act
    fireEvent.change(emailInput, { target: { value: "salah" } });
    expect(screen.getByText("Masukkan email dengan format yang valid.")).toBeInTheDocument();

    fireEvent.change(emailInput, { target: { value: "" } });
    expect(screen.getByText("Email wajib diisi.")).toBeInTheDocument();

    fireEvent.change(emailInput, { target: { value: "admin@pringgodani.desa.id" } });

    // Assert
    expect(screen.queryByText("Email wajib diisi.")).not.toBeInTheDocument();
    expect(screen.queryByText("Masukkan email dengan format yang valid.")).not.toBeInTheDocument();
  });

  it("onInvalid menangkap validationMessage HTMLInputElement dan mengabaikan non-input", () => {
    // Arrange
    render(<ForgotPasswordPage />);
    const emailInput = screen.getByLabelText("Email Admin") as HTMLInputElement;
    const submitButton = screen.getByRole("button", { name: /Kirim Link Pemulihan/i });

    // Act
    fireEvent.invalid(emailInput);
    fireEvent(submitButton, new Event("invalid", { bubbles: true })); // target bukan HTMLInputElement → cabang false

    // Assert
    expect(emailInput.validationMessage).toBeTruthy();
    expect(screen.getByText(emailInput.validationMessage)).toBeInTheDocument();
  });

  it("menampilkan 'Mengirim Link Pemulihan...' selama request sedang diproses", async () => {
    // Arrange
    let resolveReq!: (val: unknown) => void;
    postMock.mockImplementationOnce(
      () => new Promise((resolve) => { resolveReq = resolve; }),
    ); // STUB deferred
    render(<ForgotPasswordPage />);
    const emailInput = screen.getByLabelText("Email Admin");
    fireEvent.change(emailInput, { target: { value: "admin@pringgodani.desa.id" } });

    // Act
    fireEvent.submit(emailInput.closest("form")!);

    // Assert
    expect(screen.getByText("Mengirim Link Pemulihan...")).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeDisabled();

    resolveReq({ data: {} });
    await waitFor(() => {
      expect(screen.getByText("Kirim Link Pemulihan")).toBeInTheDocument();
    });
  });
});
