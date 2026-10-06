"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Icon } from "@/shared/ui/icon";
import { FallbackImage } from "@/shared/ui/fallback-image";
import { SettingsService } from "@/entities/settings/api/settings.service";
import {
  getStoredAdminSettings,
  subscribeStoredAdminSettings,
} from "@/entities/admin/api/admin-settings.service";
import { cn } from "@/shared/utils/cn";

import { useRef } from "react";
import { triggerKknMemorial } from "@/features/kkn-memorial/model/use-kkn-easter-egg";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/profil", label: "Profil" },
  { href: "/produk", label: "Produk" },
  { href: "/umkm", label: "UMKM" },
  { href: "/berita", label: "Berita" },
  { href: "/peta", label: "Peta" },
];

const AJUKAN_OPTIONS = [
  { href: "/umkm/daftar", label: "Daftarkan UMKM", icon: "storefront" },
  { href: "/submit/berita", label: "Ajukan Berita", icon: "edit_square" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [ajukanOpen, setAjukanOpen] = useState(false);
  const [brandName, setBrandName] = useState("Lokal Pringgodani");
  const [logoUrl, setLogoUrl] = useState<string>("/images/logo.png");
  const [logoClicks, setLogoClicks] = useState(0);
  const logoTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const nextCount = logoClicks + 1;
    if (nextCount >= 5) {
      setLogoClicks(0);
      if (logoTimerRef.current) clearTimeout(logoTimerRef.current);
      triggerKknMemorial();
      return;
    }

    setLogoClicks(nextCount);
    if (logoTimerRef.current) clearTimeout(logoTimerRef.current);
    logoTimerRef.current = setTimeout(() => {
      setLogoClicks(0);
    }, 2500);
  };

  const applySettings = (s?: { website_name?: string; logo_url?: string } | null) => {
    if (
      s?.website_name &&
      typeof s.website_name === "string" &&
      s.website_name !== "Desa Pringgodani" &&
      s.website_name !== "LokalUMKM Pringgodani"
    ) {
      setBrandName(s.website_name);
    } else {
      setBrandName("Lokal Pringgodani");
    }

    if (s?.logo_url && typeof s.logo_url === "string" && s.logo_url.trim().length > 0) {
      const resolved =
        s.logo_url === "/images/logo-desa.png"
          ? "/images/logo.png"
          : s.logo_url;
      setLogoUrl(resolved);
    } else {
      setLogoUrl("/images/logo.png");
    }
  };

  useEffect(() => {
    // 1. Initial read from local cache
    const stored = getStoredAdminSettings();
    applySettings(stored);

    // 2. Fetch public settings
    SettingsService.getAll().then((res) => {
      const s = res?.settings as Record<string, any> | undefined;
      applySettings(s);
    });

    // 3. Subscribe to reactive changes
    const unsubscribe = subscribeStoredAdminSettings(() => {
      const latest = getStoredAdminSettings();
      applySettings(latest);
    });

    return () => {
      unsubscribe();
      if (logoTimerRef.current) clearTimeout(logoTimerRef.current);
    };
  }, []);

  return (
    <>
      <header className="border-outline-variant/30 glass-effect bg-surface/90 fixed top-0 z-50 w-full border-b shadow-sm">
        <nav className="max-w-container-max px-gutter mx-auto flex items-center justify-between py-3 md:py-4">
          {/* Brand Logo & Name */}
          <div className="flex shrink-0 items-center gap-2.5">
            <button
              type="button"
              onClick={handleLogoClick}
              title={brandName}
              className={cn(
                "border-outline-variant/30 bg-surface-container-lowest relative h-9 w-9 overflow-hidden rounded-xl border shadow-xs md:h-10 md:w-10 transition-transform active:scale-90",
                logoClicks >= 3 && "animate-pulse scale-95 ring-2 ring-primary/40",
              )}
            >
              <FallbackImage
                src={logoUrl || "/images/logo.png"}
                alt={brandName}
                className="h-full w-full object-contain p-0.5"
                fallbackIcon="storefront"
              />
            </button>
            <Link href="/" className="font-headline-md md:text-headline-md text-primary text-lg font-bold tracking-tight">
              {brandName}
            </Link>
          </div>

          {/* Desktop Links */}
          <div className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "font-label-sm text-label-sm pb-1 transition-colors duration-200",
                  isActive(pathname, link.href)
                    ? "text-primary border-primary border-b-2 font-bold"
                    : "text-on-surface-variant hover:text-primary",
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            {/* Link ke Website Resmi Desa (Desktop) */}
            <a
              href="https://pringgodani-malangkab.desa.id"
              target="_blank"
              rel="noopener"
              className="border-outline-variant/40 bg-surface-container-low text-primary hover:bg-primary hover:text-on-primary font-label-sm text-label-sm hidden lg:inline-flex items-center gap-1.5 rounded-full border px-4 py-2 shadow-2xs transition-all active:scale-95"
              title="Website Resmi Pemerintah Desa Pringgodani"
            >
              <Icon name="account_balance" className="text-base" />
              <span>Portal Desa</span>
              <Icon name="arrow_outward" className="text-xs opacity-75" />
            </a>

            {/* Ajukan Konten dropdown (desktop) */}
            <div className="relative hidden md:block">
              <button
                onClick={() => setAjukanOpen((v) => !v)}
                className="bg-primary text-on-primary font-label-sm text-label-sm flex items-center gap-1 rounded-full px-5 py-2 shadow-sm transition-all hover:opacity-90 active:scale-95"
              >
                <span>Ajukan Konten</span>
                <Icon
                  name="expand_more"
                  className={cn(
                    "text-lg transition-transform",
                    ajukanOpen && "rotate-180",
                  )}
                />
              </button>
              {ajukanOpen && (
                <>
                  {/* Click-outside catcher */}
                  <button
                    aria-label="Tutup menu"
                    className="fixed inset-0 z-40 cursor-default"
                    onClick={() => setAjukanOpen(false)}
                  />
                  <div className="border-outline-variant/20 bg-surface-container-lowest absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border shadow-xl">
                    {AJUKAN_OPTIONS.map((opt) => (
                      <Link
                        key={opt.href}
                        href={opt.href}
                        className="hover:bg-surface-container font-label-sm text-on-surface flex items-center gap-3 px-4 py-3 transition-colors"
                        onClick={() => setAjukanOpen(false)}
                      >
                        <Icon
                          name={opt.icon}
                          className="text-primary text-lg"
                        />
                        <span>{opt.label}</span>
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Mobile menu trigger button */}
            <button
              className="text-primary hover:bg-primary/10 flex h-9 w-9 items-center justify-center rounded-lg transition-all active:scale-95 md:hidden"
              aria-label="Buka menu navigasi"
              onClick={() => setMobileOpen(true)}
            >
              <Icon name="menu" className="text-2xl" />
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile slide-over drawer menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <button
            aria-label="Tutup menu"
            className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <div className="bg-surface animate-in slide-in-from-right absolute top-0 right-0 flex h-full w-72 max-w-[85vw] flex-col overflow-hidden shadow-2xl duration-250">
            {/* Drawer Header */}
            <div className="border-outline-variant/30 bg-surface-container-low/50 flex shrink-0 items-center justify-between border-b px-5 py-4">
              <div className="flex items-center gap-2">
                <div className="bg-primary/10 text-primary flex h-7 w-7 items-center justify-center rounded-full">
                  <Icon name="eco" className="text-base" />
                </div>
                <span className="font-headline-md text-primary text-base font-bold">
                  Navigasi Desa
                </span>
              </div>
              <button
                aria-label="Tutup menu"
                onClick={() => setMobileOpen(false)}
                className="text-on-surface-variant hover:bg-surface-container rounded-full p-1 transition-colors"
              >
                <Icon name="close" className="text-xl" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex flex-1 flex-col space-y-4 overflow-y-auto p-4">
              <div className="flex flex-col space-y-1">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "font-label-sm flex items-center justify-between rounded-lg px-3.5 py-2.5 text-sm transition-colors",
                      isActive(pathname, link.href)
                        ? "text-primary bg-primary/10 font-bold"
                        : "text-on-surface-variant hover:bg-surface-container-low",
                    )}
                  >
                    <span>{link.label}</span>
                    {isActive(pathname, link.href) && (
                      <span className="bg-primary h-2 w-2 rounded-full" />
                    )}
                  </Link>
                ))}
              </div>

              {/* Mobile CTA Options */}
              <div className="border-outline-variant/20 space-y-2 border-t pt-3">
                <span className="text-on-surface-variant/70 block px-2 text-[11px] font-bold tracking-wider uppercase">
                  Aksi & Pengajuan
                </span>
                {AJUKAN_OPTIONS.map((opt) => (
                  <Link
                    key={opt.href}
                    href={opt.href}
                    onClick={() => setMobileOpen(false)}
                    className="bg-primary text-on-primary font-label-sm flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold shadow-sm transition-all hover:opacity-90"
                  >
                    <Icon name={opt.icon} className="text-base" />
                    <span>{opt.label}</span>
                  </Link>
                ))}
              </div>

              {/* Mobile Official Village Portal Link */}
              <div className="border-outline-variant/20 space-y-2 border-t pt-3">
                <span className="text-on-surface-variant/70 block px-2 text-[11px] font-bold tracking-wider uppercase">
                  Pemerintahan Resmi
                </span>
                <a
                  href="https://pringgodani-malangkab.desa.id"
                  target="_blank"
                  rel="noopener"
                  onClick={() => setMobileOpen(false)}
                  className="bg-surface-container-low border-outline-variant/30 text-primary font-label-sm flex items-center justify-between rounded-xl border px-3.5 py-2.5 text-xs font-bold shadow-2xs transition-all hover:bg-primary/10"
                  title="Website Resmi Pemerintah Desa Pringgodani"
                >
                  <div className="flex items-center gap-2">
                    <Icon name="account_balance" className="text-base text-primary" />
                    <span>Website Resmi Desa</span>
                  </div>
                  <Icon name="arrow_outward" className="text-xs text-primary/70" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
