/**
 * Unit Test — AdminRegisterPage (Fitur 2: Register — RQ-002 / FS-002)
 *
 * Target utama : handleSubmit() pada AdminRegisterPage (src/app/admin/register/page.tsx)
 * Pola         : Arrange – Act – Assert (AAA)
 *
 * Test Double yang dipakai:
 *  1. STUB  → `apiClient.post` diprogram mengembalikan respons kalengan (resolve / reject
 *             dengan berbagai struktur error), serta komponen `next/link` diganti stub `<a>`.
 *  2. MOCK  → `apiClient.post` diverifikasi perilakunya: dipanggil 1x ke "/auth/register"
 *             dengan payload ter-trim saat valid, dan 0x saat validasi klien gagal.
 *  3. SPY   → `vi.spyOn(Event.prototype, "preventDefault")` merekam bahwa form submission
 *             mencegah reload halaman bawaan browser tanpa mengubah perilaku event asli.
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
import AdminRegisterPage from "./page";

const postMock = vi.mocked(apiClient.post);

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  postMock.mockReset();
});

function fillForm({
  fullName = "",
  email = "",
  password = "",
  confirmPassword = "",
}: {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}) {
  fireEvent.change(screen.getByLabelText("Nama Lengkap"), {
    target: { value: fullName },
  });
  fireEvent.change(screen.getByLabelText("Email"), {
    target: { value: email },
  });
  fireEvent.change(screen.getByLabelText("Kata Sandi"), {
    target: { value: password },
  });
  fireEvent.change(screen.getByLabelText("Konfirmasi Kata Sandi"), {
    target: { value: confirmPassword },
  });
}

describe("AdminRegisterPage.handleSubmit() — White-Box Test Cases (Fitur 2)", () => {
  it("TC-01: semua input valid → POST /auth/register, pesan sukses muncul, form ter-reset", async () => {
    // Arrange
    postMock.mockResolvedValueOnce({ data: { success: true } }); // STUB
    const preventSpy = vi.spyOn(Event.prototype, "preventDefault"); // SPY
    render(<AdminRegisterPage />);
    fillForm({
      fullName: "  Budi Santoso Pringgodani  ",
      email: "  admin.baru@pringgodani.desa.id  ",
      password: "Password@123",
      confirmPassword: "Password@123",
    });

    // Act
    const form = screen.getByRole("button", { name: /Daftar sebagai Admin Baru/i }).closest("form")!;
    fireEvent.submit(form);

    // Assert
    await waitFor(() => {
      expect(screen.getByText(/Registrasi terkirim\./i)).toBeInTheDocument();
    });
    expect(preventSpy).toHaveBeenCalled(); // SPY
    expect(postMock).toHaveBeenCalledTimes(1); // MOCK
    expect(postMock).toHaveBeenCalledWith("/auth/register", {
      name: "Budi Santoso Pringgodani",
      email: "admin.baru@pringgodani.desa.id",
      password: "Password@123",
    });
    expect(screen.getByLabelText("Nama Lengkap")).toHaveValue("");
    expect(screen.getByLabelText("Email")).toHaveValue("");
    expect(screen.getByLabelText("Kata Sandi")).toHaveValue("");
    expect(screen.getByLabelText("Konfirmasi Kata Sandi")).toHaveValue("");
  });

  it("TC-02: seluruh field kosong/whitespace → 4 error wajib diisi, API tidak dipanggil", () => {
    // Arrange
    render(<AdminRegisterPage />);
    fillForm({ fullName: "   ", email: "   ", password: "", confirmPassword: "" });

    // Act
    const form = screen.getByRole("button", { name: /Daftar sebagai Admin Baru/i }).closest("form")!;
    fireEvent.submit(form);

    // Assert
    expect(screen.getByText("Nama lengkap wajib diisi.")).toBeInTheDocument();
    expect(screen.getByText("Email wajib diisi.")).toBeInTheDocument();
    expect(screen.getByText("Kata sandi wajib diisi.")).toBeInTheDocument();
    expect(screen.getByText("Konfirmasi kata sandi wajib diisi.")).toBeInTheDocument();
    expect(postMock).not.toHaveBeenCalled(); // MOCK
  });

  it("TC-03: pelanggaran batas bawah & format (nama 9 char, email invalid, password 7 char, konfirmasi beda)", () => {
    // Arrange
    render(<AdminRegisterPage />);
    fillForm({
      fullName: "Budi Sant",
      email: "bukan-email-valid",
      password: "Pass123",
      confirmPassword: "PassDifferent",
    });

    // Act
    const form = screen.getByRole("button", { name: /Daftar sebagai Admin Baru/i }).closest("form")!;
    fireEvent.submit(form);

    // Assert
    expect(screen.getByText("Nama lengkap harus terdiri dari 10–50 karakter.")).toBeInTheDocument();
    expect(screen.getByText("Masukkan email valid (maksimal 50 karakter).")).toBeInTheDocument();
    expect(screen.getByText("Kata sandi minimal 8 karakter.")).toBeInTheDocument();
    expect(screen.getByText("Konfirmasi kata sandi tidak cocok.")).toBeInTheDocument();
    expect(postMock).not.toHaveBeenCalled(); // MOCK
  });

  it("TC-04: pelanggaran batas atas (nama 51 char & email 55 char valid sintaks) → error batas maksimal", () => {
    // Arrange
    render(<AdminRegisterPage />);
    fillForm({
      fullName: "A".repeat(51),
      email: "superadmin.pringgodani@desa.pringgodani.jatim.corporate",
      password: "Password@123",
      confirmPassword: "Password@123",
    });

    // Act
    const form = screen.getByRole("button", { name: /Daftar sebagai Admin Baru/i }).closest("form")!;
    fireEvent.submit(form);

    // Assert
    expect(screen.getByText("Nama lengkap harus terdiri dari 10–50 karakter.")).toBeInTheDocument();
    expect(screen.getByText("Masukkan email valid (maksimal 50 karakter).")).toBeInTheDocument();
    expect(postMock).not.toHaveBeenCalled(); // MOCK
  });

  it("TC-05: API reject dengan response.data.error → tampil alert berisi pesan error backend", async () => {
    // Arrange
    postMock.mockRejectedValueOnce({
      response: { data: { error: "Email sudah terdaftar." } },
    }); // STUB
    render(<AdminRegisterPage />);
    fillForm({
      fullName: "Budi Santoso Pringgodani",
      email: "admin@pringgodani.desa.id",
      password: "Password@123",
      confirmPassword: "Password@123",
    });

    // Act
    const form = screen.getByRole("button", { name: /Daftar sebagai Admin Baru/i }).closest("form")!;
    fireEvent.submit(form);

    // Assert
    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Email sudah terdaftar.");
    });
  });

  it("TC-06: API reject dengan response.data.message (tanpa error) → tampil pesan message", async () => {
    // Arrange
    postMock.mockRejectedValueOnce({
      response: { data: { message: "Kuota pendaftaran admin penuh." } },
    }); // STUB
    render(<AdminRegisterPage />);
    fillForm({
      fullName: "Budi Santoso Pringgodani",
      email: "admin@pringgodani.desa.id",
      password: "Password@123",
      confirmPassword: "Password@123",
    });

    // Act
    const form = screen.getByRole("button", { name: /Daftar sebagai Admin Baru/i }).closest("form")!;
    fireEvent.submit(form);

    // Assert
    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Kuota pendaftaran admin penuh.");
    });
  });

  it("TC-07: API reject tanpa response (network error) → tampil pesan kegagalan default", async () => {
    // Arrange
    postMock.mockRejectedValueOnce(new Error("Network Error")); // STUB
    render(<AdminRegisterPage />);
    fillForm({
      fullName: "Budi Santoso Pringgodani",
      email: "admin@pringgodani.desa.id",
      password: "Password@123",
      confirmPassword: "Password@123",
    });

    // Act
    const form = screen.getByRole("button", { name: /Daftar sebagai Admin Baru/i }).closest("form")!;
    fireEvent.submit(form);

    // Assert
    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Registrasi gagal. Periksa koneksi atau hubungi administrator.",
      );
    });
  });
});

describe("AdminRegisterPage — interaksi live validation, onInvalid, dan state loading", () => {
  it("onChange live validation menampilkan & membersihkan error tiap field secara real-time", () => {
    // Arrange
    render(<AdminRegisterPage />);
    const nameInput = screen.getByLabelText("Nama Lengkap");
    const emailInput = screen.getByLabelText("Email");
    const passInput = screen.getByLabelText("Kata Sandi");
    const confirmInput = screen.getByLabelText("Konfirmasi Kata Sandi");

    // Act — kosongkan setelah diisi untuk memicu cabang empty di onChange
    fireEvent.change(nameInput, { target: { value: "Pendek" } });
    fireEvent.change(nameInput, { target: { value: "" } });
    fireEvent.change(emailInput, { target: { value: "invalid" } });
    fireEvent.change(emailInput, { target: { value: "" } });
    fireEvent.change(passInput, { target: { value: "12345" } });
    fireEvent.change(passInput, { target: { value: "" } });
    fireEvent.change(confirmInput, { target: { value: "12345" } });
    fireEvent.change(confirmInput, { target: { value: "" } });

    // Assert
    expect(screen.getByText("Nama lengkap wajib diisi.")).toBeInTheDocument();
    expect(screen.getByText("Email wajib diisi.")).toBeInTheDocument();
    expect(screen.getByText("Kata sandi wajib diisi.")).toBeInTheDocument();
    expect(screen.getByText("Konfirmasi kata sandi wajib diisi.")).toBeInTheDocument();

    // Act — ubah ke nilai valid
    fireEvent.change(nameInput, { target: { value: "Budi Setyawan" } });
    fireEvent.change(emailInput, { target: { value: "budi@desa.id" } });
    fireEvent.change(passInput, { target: { value: "Rahasia@123" } });
    fireEvent.change(confirmInput, { target: { value: "Rahasia@123" } });

    // Assert
    expect(screen.queryByText("Nama lengkap wajib diisi.")).not.toBeInTheDocument();
    expect(screen.queryByText("Email wajib diisi.")).not.toBeInTheDocument();
    expect(screen.queryByText("Kata sandi wajib diisi.")).not.toBeInTheDocument();
    expect(screen.queryByText("Konfirmasi kata sandi wajib diisi.")).not.toBeInTheDocument();
  });

  it("onInvalid menangkap validationMessage dari HTMLInputElement dan mengabaikan non-input", () => {
    // Arrange
    render(<AdminRegisterPage />);
    const nameInput = screen.getByLabelText("Nama Lengkap") as HTMLInputElement;
    const submitButton = screen.getByRole("button", { name: /Daftar sebagai Admin Baru/i });

    // Act
    fireEvent.invalid(nameInput);
    fireEvent(submitButton, new Event("invalid", { bubbles: true })); // target bukan HTMLInputElement → cabang false

    // Assert
    expect(nameInput.validationMessage).toBeTruthy();
    expect(screen.getByText(nameInput.validationMessage)).toBeInTheDocument();
  });

  it("menampilkan label 'Memproses Registrasi...' selama request API masih pending", async () => {
    // Arrange
    let resolveRequest!: (val: unknown) => void;
    postMock.mockImplementationOnce(
      () => new Promise((resolve) => { resolveRequest = resolve; }),
    ); // STUB deferred
    render(<AdminRegisterPage />);
    fillForm({
      fullName: "Budi Santoso Pringgodani",
      email: "admin@pringgodani.desa.id",
      password: "Password@123",
      confirmPassword: "Password@123",
    });

    // Act
    const form = screen.getByRole("button", { name: /Daftar sebagai Admin Baru/i }).closest("form")!;
    fireEvent.submit(form);

    // Assert (loading)
    expect(screen.getByText("Memproses Registrasi...")).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeDisabled();

    // Cleanup resolve
    resolveRequest({ data: { success: true } });
    await waitFor(() => {
      expect(screen.getByText("Daftar sebagai Admin Baru")).toBeInTheDocument();
    });
  });
});
