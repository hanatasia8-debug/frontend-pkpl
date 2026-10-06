"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Icon } from "@/shared/ui/icon";
import { FallbackImage } from "@/shared/ui/fallback-image";
import { AdminAuthService } from "@/shared/lib/auth/admin-auth.service";
import { AdminSubmissionsService } from "@/entities/admin/api/admin-submissions.service";

interface NavGroup {
  groupName: string;
  items: {
    label: string;
    href: string;
    icon: string;
    showBadge?: boolean;
  }[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    groupName: "Manajemen Konten",
    items: [
      { label: "Dashboard", href: "/admin/dashboard", icon: "dashboard" },
      {
        label: "Pengajuan Warga",
        href: "/admin/pengajuan",
        icon: "assignment_turned_in",
        showBadge: true,
      },
      { label: "Kelola Berita", href: "/admin/berita", icon: "newspaper" },
      { label: "Kelola UMKM & Produk", href: "/admin/umkm", icon: "storefront" },
    ],
  },
  {
    groupName: "Wilayah & Potensi",
    items: [
      { label: "Peta Geospasial", href: "/admin/peta", icon: "map" },
      {
        label: "Profil & Perangkat Desa",
        href: "/admin/profil",
        icon: "assignment_ind",
      },
    ],
  },
  {
    groupName: "Sistem & Tampilan",
    items: [
      { label: "Google Indexing", href: "/admin/indexing", icon: "travel_explore" },
      { label: "Pengaturan Website", href: "/admin/settings", icon: "settings" },
    ],
  },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [pendingCount, setPendingCount] = useState(0);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (!isLoginPage && !AdminAuthService.isAuthenticated()) {
      router.push("/admin/login");
      return;
    }

    if (!isLoginPage) {
      AdminSubmissionsService.getPendingSubmissions().then((data) => {
        setPendingCount(data.totalPending);
      });
    }
  }, [pathname, isLoginPage, router]);

  // Close mobile drawer on route change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMobileDrawerOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    AdminAuthService.logout();
    router.push("/admin/login");
  };

  if (isLoginPage) {
    return (
      <div className="bg-surface text-on-surface min-h-screen">
        <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
      </div>
    );
  }

  const renderNavLinks = () => (
    <div className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
      {NAV_GROUPS.map((group) => (
        <div key={group.groupName} className="space-y-1">
          <span className="text-on-surface-variant/70 block px-3 text-[11px] font-bold tracking-wider uppercase">
            {group.groupName}
          </span>
          <div className="mt-1.5 space-y-1">
            {group.items.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`font-label-sm relative flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all duration-150 ${
                    isActive
                      ? "bg-primary text-on-primary font-bold shadow-sm"
                      : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      name={item.icon}
                      className={`text-xl ${isActive ? "text-on-primary" : "text-primary/80"}`}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.showBadge && pendingCount > 0 && (
                    <span
                      className={`ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-bold ${
                        isActive
                          ? "bg-white text-primary"
                          : "bg-error text-on-error animate-pulse"
                      }`}
                    >
                      {pendingCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="bg-surface text-on-surface flex min-h-screen">
      {/* 1. Desktop Persistent Sidebar */}
      <aside className="bg-surface-container-lowest border-outline-variant/30 fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r shadow-xs lg:flex">
        {/* Brand Header */}
        <div className="border-outline-variant/20 flex h-16 shrink-0 items-center justify-between border-b px-5">
          <Link href="/admin/dashboard" className="flex items-center gap-3">
            <div className="border-outline-variant/30 bg-surface-container relative h-9 w-9 overflow-hidden rounded-xl border p-0.5 shadow-xs">
              <FallbackImage
                src="/images/logo.png"
                alt="Logo Desa Pringgodani"
                className="h-full w-full object-contain"
                fallbackIcon="storefront"
              />
            </div>
            <div>
              <h2 className="font-headline-md text-primary text-sm font-bold tracking-tight">
                Lokal Pringgodani
              </h2>
              <span className="text-on-surface-variant/80 block text-[10px] font-semibold tracking-wider uppercase">
                Admin Panel CMS
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Items */}
        {renderNavLinks()}

        {/* Sidebar Footer */}
        <div className="border-outline-variant/20 bg-surface-container-low/40 shrink-0 space-y-3 border-t p-4">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-on-surface-variant hover:bg-surface-container hover:text-primary flex items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition"
            title="Buka Website Publik Desa di Tab Baru"
          >
            <div className="flex items-center gap-2">
              <Icon name="open_in_new" className="text-base" />
              <span>Lihat Website Publik</span>
            </div>
            <span className="text-primary text-[10px]">↗</span>
          </Link>

          <div className="border-outline-variant/20 flex items-center justify-between border-t pt-3">
            <div className="flex items-center gap-2.5">
              <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold">
                AD
              </div>
              <div className="leading-tight">
                <p className="font-label-sm text-on-surface text-xs font-bold">
                  Admin Desa
                </p>
                <span className="text-primary text-[10px] font-semibold">
                  ● Online
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="text-on-surface-variant hover:bg-error/10 hover:text-error flex h-8 w-8 items-center justify-center rounded-lg transition"
              title="Keluar dari Panel Admin"
            >
              <Icon name="logout" className="text-lg" />
            </button>
          </div>
        </div>
      </aside>

      {/* 2. Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0 lg:pl-64">
        {/* Mobile Header Bar */}
        <header className="bg-surface-container-lowest border-outline-variant/30 sticky top-0 z-20 flex h-14 items-center justify-between border-b px-4 shadow-xs lg:hidden">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(true)}
              className="text-primary hover:bg-surface-container flex h-9 w-9 items-center justify-center rounded-lg transition active:scale-95"
              aria-label="Buka Menu Admin"
            >
              <Icon name="menu" className="text-2xl" />
            </button>
            <span className="font-headline-md text-primary text-sm font-bold">
              Admin Panel
            </span>
          </div>

          <div className="flex items-center gap-2">
            {pendingCount > 0 && (
              <Link
                href="/admin/pengajuan"
                className="bg-error text-on-error flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold shadow-xs animate-pulse"
              >
                <Icon name="assignment_turned_in" className="text-sm" />
                <span>{pendingCount}</span>
              </Link>
            )}
            <button
              type="button"
              onClick={handleLogout}
              className="text-on-surface-variant hover:bg-error/10 hover:text-error flex h-8 w-8 items-center justify-center rounded-lg transition"
              title="Keluar"
            >
              <Icon name="logout" className="text-lg" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          {children}
        </main>
      </div>

      {/* 3. Mobile Slide-Over Drawer */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Tutup Menu"
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileDrawerOpen(false)}
          />
          <div className="bg-surface-container-lowest animate-in slide-in-from-left fixed inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col shadow-2xl duration-200">
            {/* Drawer Header */}
            <div className="border-outline-variant/20 flex h-14 shrink-0 items-center justify-between border-b px-4">
              <div className="flex items-center gap-2.5">
                <div className="border-outline-variant/30 bg-surface-container relative h-8 w-8 overflow-hidden rounded-lg border p-0.5">
                  <FallbackImage
                    src="/images/logo.png"
                    alt="Logo Desa Pringgodani"
                    className="h-full w-full object-contain"
                    fallbackIcon="storefront"
                  />
                </div>
                <span className="font-headline-md text-primary text-sm font-bold">
                  Lokal Pringgodani
                </span>
              </div>
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(false)}
                className="text-on-surface-variant hover:bg-surface-container rounded-lg p-1.5 transition"
              >
                <Icon name="close" className="text-xl" />
              </button>
            </div>

            {/* Nav Links */}
            {renderNavLinks()}

            {/* Drawer Footer */}
            <div className="border-outline-variant/20 bg-surface-container-low/40 shrink-0 space-y-3 border-t p-4">
              <Link
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-on-surface-variant hover:bg-surface-container hover:text-primary flex items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition"
              >
                <div className="flex items-center gap-2">
                  <Icon name="open_in_new" className="text-base" />
                  <span>Lihat Website Publik</span>
                </div>
                <span className="text-primary text-[10px]">↗</span>
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="bg-error/10 text-error hover:bg-error hover:text-on-error flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition"
              >
                <Icon name="logout" className="text-base" />
                <span>Keluar dari Panel Admin</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
