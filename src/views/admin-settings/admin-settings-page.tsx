"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/shared/ui/icon";
import { AdminSettingsService } from "@/entities/admin/api/admin-settings.service";
import type { AdminSettingsPayload } from "@/entities/admin/model/admin.types";
import { FileUploadWithPreview } from "@/shared/ui/file-upload-with-preview";
import {
  getCustomBanner,
  setCustomBanner,
  removeCustomBanner,
} from "@/shared/utils/custom-banner-storage";

export function AdminSettingsPage() {
  const [formData, setFormData] = useState<AdminSettingsPayload>({
    website_name: "Lokal Pringgodani",
    logo_url: "/images/logo.png",
    favicon_url: "/images/favicon.png",
    contact_email: "info@pringgodani.desa.id",
    contact_phone: "081234567890",
    address: "Jl. Raya Desa Pringgodani No. 1, Kec. Bantur, Kabupaten Malang",
    // Empty, not guessed, until getSettings() below resolves with the
    // real values — never fabricate the village's official accounts.
    social_facebook: "",
    social_instagram: "",
    social_youtube: "",
    social_tiktok: "",
    jumlah_dusun: 4,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastVariant, setToastVariant] = useState<"success" | "error">(
    "success",
  );
  const [customBannerUrl, setCustomBannerUrl] = useState("");

  useEffect(() => {
    AdminSettingsService.getSettings()
      .then((data) => setFormData(data))
      .finally(() => setIsLoading(false));

    getCustomBanner()
      .then((url) => {
        setCustomBannerUrl(url || "");
      })
      .catch((e) => {
        console.warn("Gagal membaca custom banner dari IndexedDB:", e);
      });
  }, []);

  const handleChange = (
    key: keyof AdminSettingsPayload,
    value: string | number,
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const res = await AdminSettingsService.updateSettings(formData);
      try {
        if (customBannerUrl) {
          await setCustomBanner(customBannerUrl);
        } else {
          await removeCustomBanner();
        }
      } catch (e) {
        console.error("Gagal menyimpan custom banner ke IndexedDB:", e);
      }
      setToastVariant("success");
      setToastMessage(res.message || "Pengaturan berhasil disimpan.");
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      console.error("Gagal menyimpan pengaturan:", err);
      setToastVariant("error");
      setToastMessage("Gagal menyimpan pengaturan. Silakan coba lagi.");
      setTimeout(() => setToastMessage(null), 4000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {toastMessage && (
        <div
          className={`animate-fade-in fixed right-6 bottom-6 z-50 flex items-center gap-3 rounded-2xl px-6 py-4 text-sm font-semibold shadow-2xl ${
            toastVariant === "success"
              ? "bg-primary text-on-primary"
              : "bg-error text-on-error"
          }`}
        >
          <Icon
            name={toastVariant === "success" ? "check_circle" : "error"}
            className="text-xl"
          />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Halaman */}
      <div className="flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="text-on-surface-variant font-label-sm text-xs font-bold tracking-wider uppercase">
            Konfigurasi Portal Utama
          </span>
          <h2 className="font-headline-lg text-primary mt-1 text-3xl font-bold">
            Pengaturan Website & Identitas Desa
          </h2>
          <p className="text-on-surface-variant mt-1 text-sm">
            Unggah logo desa, favicon browser, kontak balai desa, alamat
            kependudukan, dan sosial media resmi.
          </p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={isSaving || isLoading}
          className="bg-primary text-on-primary hover:bg-primary/90 flex items-center gap-2 self-start rounded-2xl px-6 py-3.5 text-xs font-bold shadow-md transition sm:self-auto"
        >
          {isSaving ? (
            <>
              <Icon name="sync" className="animate-spin text-xl" /> Menyimpan...
            </>
          ) : (
            <>
              <Icon name="save" className="text-xl" /> Simpan Pengaturan Website
            </>
          )}
        </button>
      </div>

      {/* Form Utama Pengaturan */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Seksi 1: Profil & Identitas Website dengan File Uploader Direct */}
        <div className="border-outline-variant/30 bg-surface-container-lowest space-y-6 rounded-3xl border p-8 shadow-sm">
          <div className="border-b pb-4">
            <h3 className="font-headline-md text-primary flex items-center gap-2 text-lg font-bold">
              <Icon name="language" className="text-xl" /> Identitas Utama
              Portal & Unggah Logo
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="font-label-sm text-on-surface-variant mb-2 block text-xs font-bold uppercase">
                Nama Website Desa
              </label>
              <input
                type="text"
                required
                value={formData.website_name || ""}
                onChange={(e) => handleChange("website_name", e.target.value)}
                className="bg-surface border-outline-variant text-on-surface focus:border-primary w-full rounded-2xl border p-3.5 text-sm font-bold outline-none"
              />
            </div>

            <div>
              <label className="font-label-sm text-on-surface-variant mb-2 block text-xs font-bold uppercase">
                Jumlah Dusun Wilayah
              </label>
              <input
                type="number"
                value={formData.jumlah_dusun || 4}
                onChange={(e) =>
                  handleChange("jumlah_dusun", Number(e.target.value))
                }
                className="bg-surface border-outline-variant text-on-surface focus:border-primary w-full rounded-2xl border p-3.5 font-mono text-sm font-bold outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 border-t pt-6 md:grid-cols-2">
            <FileUploadWithPreview
              label="Unggah Logo Resmi Desa"
              value={formData.logo_url || ""}
              onChange={(url) => handleChange("logo_url", url)}
              helperText="Format PNG / WEBP / JPG transparan (disarankan 512x512 px)."
              aspectRatio="square"
            />

            <FileUploadWithPreview
              label="Unggah Favicon Browser (.ico / .png)"
              value={formData.favicon_url || ""}
              onChange={(url) => handleChange("favicon_url", url)}
              helperText="Ikon tab browser web desa (disarankan 64x64 px)."
              aspectRatio="square"
            />
          </div>

          <div className="border-t pt-6">
            <FileUploadWithPreview
              label="Unggah Gambar Banner Utama Beranda (Opsional)"
              value={customBannerUrl}
              onChange={(url) => setCustomBannerUrl(url)}
              helperText="Jika diunggah, gambar ini akan menggantikan banner otomatis berita di beranda publik depan."
              aspectRatio="banner"
              category="village"
            />
          </div>
        </div>

        {/* Seksi 2: Alamat & Kontak Pelayanan Publik */}
        <div className="border-outline-variant/30 bg-surface-container-lowest space-y-6 rounded-3xl border p-8 shadow-sm">
          <div className="border-b pb-4">
            <h3 className="font-headline-md text-primary flex items-center gap-2 text-lg font-bold">
              <Icon name="contact_mail" className="text-xl" /> Kontak & Alamat
              Kantor Balai Desa
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="font-label-sm text-on-surface-variant mb-2 block text-xs font-bold uppercase">
                Email Pelayanan Resmi
              </label>
              <input
                type="email"
                required
                value={formData.contact_email || ""}
                onChange={(e) => handleChange("contact_email", e.target.value)}
                className="bg-surface border-outline-variant text-on-surface focus:border-primary w-full rounded-2xl border p-3.5 text-sm font-semibold outline-none"
              />
            </div>

            <div>
              <label className="font-label-sm text-on-surface-variant mb-2 block text-xs font-bold uppercase">
                Nomor Telepon / WhatsApp Kantor
              </label>
              <input
                type="text"
                required
                value={formData.contact_phone || ""}
                onChange={(e) => handleChange("contact_phone", e.target.value)}
                className="bg-surface border-outline-variant text-on-surface focus:border-primary w-full rounded-2xl border p-3.5 font-mono text-sm font-bold outline-none"
              />
            </div>
          </div>

          <div>
            <label className="font-label-sm text-on-surface-variant mb-2 block text-xs font-bold uppercase">
              Alamat Lengkap Balai Desa
            </label>
            <textarea
              rows={2}
              required
              value={formData.address || ""}
              onChange={(e) => handleChange("address", e.target.value)}
              className="bg-surface border-outline-variant text-on-surface focus:border-primary w-full rounded-2xl border p-3.5 text-sm leading-relaxed outline-none"
            />
          </div>
        </div>

        {/* Seksi 3: Media Sosial Resmi Desa */}
        <div className="border-outline-variant/30 bg-surface-container-lowest space-y-6 rounded-3xl border p-8 shadow-sm">
          <div className="border-b pb-4">
            <h3 className="font-headline-md text-primary flex items-center gap-2 text-lg font-bold">
              <Icon name="share" className="text-xl" /> Tautan Media Sosial
              Resmi
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="font-label-sm text-on-surface-variant mb-2 block text-xs font-bold uppercase">
                Link Facebook
              </label>
              <input
                type="url"
                value={formData.social_facebook || ""}
                onChange={(e) =>
                  handleChange("social_facebook", e.target.value)
                }
                placeholder="https://facebook.com/..."
                className="bg-surface border-outline-variant text-on-surface focus:border-primary w-full rounded-2xl border p-3.5 text-xs outline-none"
              />
            </div>

            <div>
              <label className="font-label-sm text-on-surface-variant mb-2 block text-xs font-bold uppercase">
                Link Instagram
              </label>
              <input
                type="url"
                value={formData.social_instagram || ""}
                onChange={(e) =>
                  handleChange("social_instagram", e.target.value)
                }
                placeholder="https://instagram.com/..."
                className="bg-surface border-outline-variant text-on-surface focus:border-primary w-full rounded-2xl border p-3.5 text-xs outline-none"
              />
            </div>

            <div>
              <label className="font-label-sm text-on-surface-variant mb-2 block text-xs font-bold uppercase">
                Link YouTube Channel
              </label>
              <input
                type="url"
                value={formData.social_youtube || ""}
                onChange={(e) => handleChange("social_youtube", e.target.value)}
                placeholder="https://youtube.com/..."
                className="bg-surface border-outline-variant text-on-surface focus:border-primary w-full rounded-2xl border p-3.5 text-xs outline-none"
              />
            </div>

            <div>
              <label className="font-label-sm text-on-surface-variant mb-2 block text-xs font-bold uppercase">
                Link TikTok
              </label>
              <input
                type="url"
                value={formData.social_tiktok || ""}
                onChange={(e) => handleChange("social_tiktok", e.target.value)}
                placeholder="https://tiktok.com/..."
                className="bg-surface border-outline-variant text-on-surface focus:border-primary w-full rounded-2xl border p-3.5 text-xs outline-none"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
