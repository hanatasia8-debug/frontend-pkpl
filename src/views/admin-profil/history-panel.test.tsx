import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { PROFILE_HISTORY_STORAGE_KEY } from "@/shared/utils/profile-history-storage";
import { HistoryAdminPanel } from "./history-panel";

describe("HistoryAdminPanel", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("renders the history management panel", () => {
    render(<HistoryAdminPanel />);

    expect(screen.getByText("Panel Sejarah Desa")).toBeInTheDocument();
    expect(
      screen.getByText(
        /Kelola ringkasan sejarah desa yang tampil di halaman publik/i,
      ),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Konten sejarah desa")).toBeInTheDocument();
  });

  it("saves edited history to localStorage", () => {
    render(<HistoryAdminPanel />);

    const textarea = screen.getByLabelText("Konten sejarah desa");
    fireEvent.change(textarea, {
      target: { value: "Sejarah desa yang diperbarui dari panel admin." },
    });

    fireEvent.click(screen.getByRole("button", { name: /simpan perubahan/i }));

    expect(window.localStorage.getItem(PROFILE_HISTORY_STORAGE_KEY)).toContain(
      "Sejarah desa yang diperbarui dari panel admin.",
    );
  });
});
