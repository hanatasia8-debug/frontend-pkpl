"use client";

import { useState, useSyncExternalStore } from "react";

import { Button } from "@/shared/ui/button";
import { Icon } from "@/shared/ui/icon";
import {
  getProfileHistorySnapshot,
  getProfileHistoryServerSnapshot,
  saveProfileHistory,
  subscribeToProfileHistory,
} from "@/shared/utils/profile-history-storage";

export function HistoryAdminPanel() {
  const storedHistory = useSyncExternalStore(
    subscribeToProfileHistory,
    getProfileHistorySnapshot,
    getProfileHistoryServerSnapshot,
  );
  const [draftHistory, setDraftHistory] = useState<string | null>(null);
  const historyText = draftHistory ?? storedHistory;

  const handleSave = () => {
    saveProfileHistory(historyText);
    setDraftHistory(null);
  };

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-white/10 bg-slate-900/90 p-8 shadow-2xl shadow-slate-950/40">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <p className="text-sm tracking-[0.24em] text-slate-400 uppercase">
              Profil Desa
            </p>
            <h2 className="text-3xl font-semibold text-white">
              Panel Sejarah Desa
            </h2>
            <p className="max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
              Kelola ringkasan sejarah desa yang tampil di halaman publik dan
              halaman profil.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              className="border-white/10 bg-slate-950/80 text-slate-100 hover:bg-slate-800"
            >
              <Icon name="visibility" className="text-base" />
              Pratinjau
            </Button>
            <Button
              className="bg-emerald-500 text-slate-950 hover:bg-emerald-400"
              onClick={handleSave}
            >
              <Icon name="save" className="text-base" />
              Simpan Perubahan
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[2rem] border border-white/10 bg-slate-900/90 p-8 shadow-2xl shadow-slate-950/40">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-500/15 p-3 text-emerald-400">
              <Icon name="history_edu" className="text-xl" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">
                Konten Sejarah
              </h3>
              <p className="text-sm text-slate-400">
                Edit teks sejarah desa yang ditampilkan ke publik.
              </p>
            </div>
          </div>

          <label
            className="mb-2 block text-sm font-medium text-slate-200"
            htmlFor="history-text"
          >
            Konten sejarah desa
          </label>
          <textarea
            id="history-text"
            rows={12}
            value={historyText}
            onChange={(event) => setDraftHistory(event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm leading-7 text-slate-100 ring-0 outline-none placeholder:text-slate-500"
          />

          <div className="mt-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-300">
            <p className="font-medium">Tips</p>
            <p className="mt-1 leading-6">
              Tulis sejarah secara singkat, informatif, dan mudah dibaca agar
              menarik untuk pengunjung maupun warga desa.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[2rem] border border-white/10 bg-slate-900/90 p-8 shadow-2xl shadow-slate-950/40">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-2xl bg-sky-500/15 p-3 text-sky-400">
                <Icon name="info" className="text-xl" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">
                  Status Panel
                </h3>
                <p className="text-sm text-slate-400">
                  Informasi singkat terkait konten yang aktif.
                </p>
              </div>
            </div>

            <div className="space-y-4 text-sm text-slate-300">
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3">
                <span>Status konten</span>
                <span className="font-semibold text-emerald-400">Aktif</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3">
                <span>Terakhir diperbarui</span>
                <span className="font-semibold text-white">Hari ini</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3">
                <span>Ditampilkan di</span>
                <span className="font-semibold text-white">Home & Profil</span>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-slate-900/90 p-8 shadow-2xl shadow-slate-950/40">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-2xl bg-amber-500/15 p-3 text-amber-400">
                <Icon name="campaign" className="text-xl" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">Catatan</h3>
                <p className="text-sm text-slate-400">
                  Panduan singkat untuk mengisi konten.
                </p>
              </div>
            </div>

            <ul className="space-y-3 text-sm leading-6 text-slate-300">
              <li className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3">
                Gunakan bahasa yang formal dan mudah dipahami.
              </li>
              <li className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3">
                Sertakan informasi penting tentang asal-usul desa.
              </li>
              <li className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3">
                Perbarui secara berkala agar konten tetap relevan.
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
