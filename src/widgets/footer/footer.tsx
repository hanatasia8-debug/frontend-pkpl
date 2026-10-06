"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Icon } from "@/shared/ui/icon";
import { SettingsService } from "@/entities/settings/api/settings.service";
import {
  getStoredAdminSettings,
  subscribeStoredAdminSettings,
} from "@/entities/admin/api/admin-settings.service";
import { cn } from "@/shared/utils/cn";
import { sanitizeExternalUrl } from "@/shared/utils/sanitize-url";

interface FooterSettings {
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  socialFacebook: string;
  socialInstagram: string;
  socialYoutube: string;
  socialTiktok: string;
}

const DEFAULT_SETTINGS: FooterSettings = {
  contactEmail: "info@pringgodani.desa.id",
  contactPhone: "0812-3456-7890",
  contactAddress: "Jl. Raya Desa Pringgodani No. 1, Kec. Bantur, Kab. Malang",
  socialFacebook: "https://facebook.com/desapringgodani",
  socialInstagram: "https://instagram.com/desapringgodani",
  socialYoutube: "https://youtube.com/@desapringgodani",
  socialTiktok: "https://tiktok.com/@desapringgodani",
};

export function Footer() {
  const pathname = usePathname();
  const isMapPage = pathname === "/peta";
  const [settings, setSettings] = useState<FooterSettings>(DEFAULT_SETTINGS);

  const applySettings = (s?: any) => {
    if (!s) return;
    setSettings({
      contactEmail:
        s.contact_email ||
        s.contactEmail ||
        s.email ||
        DEFAULT_SETTINGS.contactEmail,
      contactPhone:
        s.contact_phone ||
        s.contactPhone ||
        s.phone ||
        DEFAULT_SETTINGS.contactPhone,
      contactAddress:
        s.address || s.contactAddress || DEFAULT_SETTINGS.contactAddress,
      socialFacebook:
        s.social_facebook ||
        s.socialFacebook ||
        s.facebook ||
        DEFAULT_SETTINGS.socialFacebook,
      socialInstagram:
        s.social_instagram ||
        s.socialInstagram ||
        s.instagram ||
        DEFAULT_SETTINGS.socialInstagram,
      socialYoutube:
        s.social_youtube ||
        s.socialYoutube ||
        s.youtube ||
        DEFAULT_SETTINGS.socialYoutube,
      socialTiktok:
        s.social_tiktok ||
        s.socialTiktok ||
        s.tiktok ||
        DEFAULT_SETTINGS.socialTiktok,
    });
  };

  useEffect(() => {
    // 1. Initial read from local cache
    const stored = getStoredAdminSettings();
    applySettings(stored);

    // 2. Fetch public settings
    SettingsService.getAll()
      .then((res) => {
        if (res?.settings) {
          applySettings(res.settings);
        }
      })
      .catch((err) => {
        console.warn("Gagal memperbarui settings di background:", err);
      });

    // 3. Subscribe to reactive changes
    const unsubscribe = subscribeStoredAdminSettings(() => {
      const latest = getStoredAdminSettings();
      applySettings(latest);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <footer
      className={cn(
        "bg-surface-container-highest border-outline-variant mt-stack-lg border-t",
        isMapPage && "hidden md:block",
      )}
    >
      <div className="max-w-container-max gap-8 px-gutter py-section-padding mx-auto grid grid-cols-1 md:grid-cols-3">
        {/* Kolom 1: Kontak Kami */}
        <div>
          <h4 className="font-headline-md text-headline-md text-primary mb-6">
            Kontak Kami
          </h4>
          <ul className="font-body-base text-on-surface-variant space-y-4">
            <li className="flex items-center gap-3">
              <Icon name="location_on" className="text-primary text-xl shrink-0" />
              <span>{settings.contactAddress}</span>
            </li>
            <li className="flex items-center gap-3">
              <Icon name="call" className="text-primary text-xl shrink-0" />
              <span>{settings.contactPhone}</span>
            </li>
            <li className="flex items-center gap-3">
              <Icon name="mail" className="text-primary text-xl shrink-0" />
              <span>{settings.contactEmail}</span>
            </li>
          </ul>
        </div>

        {/* Kolom 2: Portal Resmi Pemerintah Desa (SEO Backlink & Crawl Gateway) */}
        <div>
          <h4 className="font-headline-md text-headline-md text-primary mb-4">
            Pemerintah Desa Pringgodani
          </h4>
          <p className="text-on-surface-variant font-body-base mb-4 text-sm leading-relaxed">
            Website resmi Pemerintah Desa Pringgodani, Kecamatan Bantur, Kabupaten Malang. Melayani administrasi kependudukan, permohonan surat keterangan, transparansi anggaran APBDes, dan regulasi desa.
          </p>
          <a
            href="https://pringgodani-malangkab.desa.id"
            target="_blank"
            rel="noopener"
            className="group inline-flex items-center gap-2 rounded-xl bg-primary/10 border border-primary/20 px-4 py-2.5 text-xs font-bold text-primary transition-all hover:bg-primary hover:text-on-primary shadow-xs"
            title="Website Resmi Pemerintah Desa Pringgodani"
          >
            <Icon name="account_balance" className="text-base" />
            <span>Kunjungi Website Resmi Desa</span>
            <Icon name="arrow_outward" className="text-sm transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </div>

        {/* Kolom 3: Media Sosial Kami */}
        <div className="flex flex-col justify-start md:items-end">
          <h4 className="font-headline-md text-headline-md text-primary mb-4 md:text-right">
            Media Sosial Kami
          </h4>
          <p className="text-on-surface-variant font-body-base mb-6 max-w-sm text-sm md:text-right">
            Ikuti kanal resmi media sosial Lokal Pringgodani untuk kabar produk,
            UMKM, dan hasil bumi terupdate.
          </p>
          <div className="flex gap-4">
            {/* Facebook */}
            <a
              href={sanitizeExternalUrl(settings.socialFacebook) || "https://facebook.com"}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-primary/10 text-primary hover:bg-primary hover:text-on-primary flex h-11 w-11 transform items-center justify-center rounded-full shadow-sm transition-all duration-300 hover:scale-110"
              title="Facebook Resmi Desa"
            >
              <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                <path d="M9 8H7v3h2v9h4v-9h3.6l.4-3H13V6c0-1 .5-2 2-2h1V.2C15.8.1 14.3 0 12.8 0 9.7 0 7.8 1.9 7.8 5.3V8H9z" />
              </svg>
            </a>
            {/* Instagram */}
            <a
              href={sanitizeExternalUrl(settings.socialInstagram) || "https://instagram.com"}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-primary/10 text-primary hover:bg-primary hover:text-on-primary flex h-11 w-11 transform items-center justify-center rounded-full shadow-sm transition-all duration-300 hover:scale-110"
              title="Instagram Resmi Desa"
            >
              <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
            </a>
            {/* Youtube */}
            <a
              href={sanitizeExternalUrl(settings.socialYoutube) || "https://youtube.com"}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-primary/10 text-primary hover:bg-primary hover:text-on-primary flex h-11 w-11 transform items-center justify-center rounded-full shadow-sm transition-all duration-300 hover:scale-110"
              title="YouTube Resmi Desa"
            >
              <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                <path d="M23.498 6.163a3.003 3.003 0 00-2.11-2.107C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.388.511a3.002 3.002 0 00-2.11 2.107C0 8.053 0 12 0 12s0 3.947-.502 5.837a3.003 3.003 0 002.11 2.107c1.883.511 9.388.511 9.388.511s7.505 0 9.388-.511a3.002 3.002 0 002.11-2.107C24 15.947 24 12 24 12s0-3.947-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </a>
            {/* TikTok */}
            <a
              href={sanitizeExternalUrl(settings.socialTiktok) || "https://tiktok.com"}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-primary/10 text-primary hover:bg-primary hover:text-on-primary flex h-11 w-11 transform items-center justify-center rounded-full shadow-sm transition-all duration-300 hover:scale-110"
              title="TikTok Resmi Desa"
            >
              <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.02 1.63 4.14.99 1.11 2.36 1.8 3.84 1.98v3.91a8.91 8.91 0 01-5.3-1.74v7.71a6.97 6.97 0 01-11.9 4.9 6.98 6.98 0 014.9-11.9c.47.01.93.07 1.39.18V13.1c-.44-.1-.9-.15-1.36-.15a3.06 3.06 0 00-3.06 3.06 3.07 3.07 0 005.12 2.27c.65-.6.98-1.46.94-2.33V.02z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
      <div className="border-outline-variant/30 border-t py-8">
        <div className="max-w-container-max px-gutter mx-auto flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="font-label-sm text-on-surface-variant text-center md:text-left">
            © {new Date().getFullYear()} Pemerintah Desa Pringgodani. Seluruh
            Hak Cipta Dilindungi.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6">
            <a
              href="https://pringgodani-malangkab.desa.id"
              target="_blank"
              rel="noopener"
              className="font-label-sm text-primary hover:underline flex items-center gap-1 font-semibold"
              title="Website Resmi Pemerintah Desa Pringgodani"
            >
              <span>Website Resmi Desa: pringgodani-malangkab.desa.id</span>
              <Icon name="arrow_outward" className="text-xs" />
            </a>
            <a
              className="font-label-sm text-on-surface-variant hover:text-primary underline"
              href="#"
            >
              Kebijakan Privasi
            </a>
            <a
              className="font-label-sm text-on-surface-variant hover:text-primary underline"
              href="#"
            >
              Peta Situs
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
