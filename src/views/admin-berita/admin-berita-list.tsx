"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@/shared/ui/icon";
import { AdminNewsService } from "@/entities/admin/api/admin-news.service";
import type {
  AdminNewsItem,
  NewsStatus,
} from "@/entities/admin/model/admin.types";

export function AdminBeritaList() {
  const [newsItems, setNewsItems] = useState<AdminNewsItem[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadNews = () => {
    setIsLoading(true);
    AdminNewsService.getAllNews()
      .then((res) => setNewsItems(res.items))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    let ignore = false;
    AdminNewsService.getAllNews()
      .then((res) => {
        if (!ignore) setNewsItems(res.items);
      })
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleStatusChange = async (id: string, newStatus: NewsStatus) => {
    await AdminNewsService.updateNewsStatus(id, newStatus);
    showToast(`Status berita berhasil diubah menjadi ${newStatus}.`);
    loadNews();
  };

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus berita "${title}"?`)) {
      await AdminNewsService.deleteNews(id);
      showToast(`Berita "${title}" telah dihapus.`);
      loadNews();
    }
  };

  const filteredItems = newsItems.filter((item) => {
    const itemStatus = (item.status || "").toUpperCase();
    if (filterStatus !== "ALL" && itemStatus !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.categoryName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-8">
      {toastMessage && (
        <div className="bg-primary text-on-primary animate-fade-in fixed right-6 bottom-6 z-50 flex items-center gap-3 rounded-2xl px-6 py-4 text-sm font-semibold shadow-2xl">
          <Icon name="check_circle" className="text-xl" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Halaman */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="text-on-surface-variant font-label-sm text-xs font-bold tracking-wider uppercase">
            Manajemen Konten
          </span>
          <h2 className="font-headline-lg text-primary mt-1 text-3xl font-bold">
            Kelola Berita & Publikasi Desa
          </h2>
          <p className="text-on-surface-variant mt-1 text-sm">
            Tambah artikel baru, atur status terbit, sunting liputan, dan pantau
            berita desa.
          </p>
        </div>

        <Link
          href="/admin/berita/new"
          className="bg-primary text-on-primary hover:bg-primary/90 inline-flex items-center gap-2 self-start rounded-2xl px-6 py-3.5 text-xs font-bold shadow-md transition sm:self-auto"
        >
          <Icon name="add" className="text-xl" /> Tulis Berita Baru
        </Link>
      </div>

      {/* Filter & Pencarian */}
      <div className="border-outline-variant/30 bg-surface-container-lowest flex flex-col gap-4 rounded-3xl border p-6 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="relative max-w-md flex-1">
          <span className="text-on-surface-variant absolute inset-y-0 left-4 flex items-center">
            <Icon name="search" className="text-xl" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari judul berita atau kategori..."
            className="bg-surface border-outline-variant text-on-surface focus:border-primary w-full rounded-2xl border py-3 pr-4 pl-12 text-sm outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-on-surface-variant mr-1 text-xs font-bold">
            Status:
          </span>
          {["ALL", "PUBLISHED", "PENDING", "DRAFT", "REJECTED"].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                filterStatus === st
                  ? "bg-primary text-on-primary"
                  : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
              }`}
            >
              {st === "ALL" ? "Semua Status" : st}
            </button>
          ))}
        </div>
      </div>

      {/* Tabel Berita */}
      <div className="border-outline-variant/30 bg-surface-container-lowest overflow-hidden rounded-3xl border shadow-sm">
        {isLoading ? (
          <div className="text-on-surface-variant py-12 text-center text-sm font-medium">
            Memuat daftar berita...
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-on-surface-variant space-y-2 py-12 text-center text-sm font-medium">
            <Icon
              name="newspaper"
              className="text-primary/40 mx-auto text-4xl"
            />
            <p>Tidak ada berita yang sesuai dengan kriteria filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-container-highest text-on-surface-variant border-b text-xs font-bold uppercase">
                <tr>
                  <th className="px-6 py-4">Berita & Judul</th>
                  <th className="px-6 py-4">Kategori</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Tanggal Terbit</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-outline-variant/20 divide-y">
                {filteredItems.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-surface-container-low transition"
                  >
                    <td className="px-6 py-4">
                      <p className="text-primary text-base font-bold">
                        {item.title}
                      </p>
                      <p className="text-on-surface-variant mt-0.5 line-clamp-1 text-xs">
                        {item.excerpt}
                      </p>
                    </td>
                    <td className="text-on-surface-variant px-6 py-4 text-xs font-semibold whitespace-nowrap">
                      {item.categoryName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {(() => {
                        const statusUpper = (item.status || "").toUpperCase();
                        // Use the site's actual design tokens (globals.css)
                        // instead of raw Tailwind palette (slate/emerald/sky/
                        // amber/red) so admin badges stay visually consistent
                        // with the rest of the app if the palette ever changes.
                        let badgeClasses =
                          "bg-surface-container-high text-on-surface-variant border-outline-variant/50 border";

                        if (statusUpper === "PUBLISHED") {
                          badgeClasses =
                            "bg-status-verified/10 text-status-verified border-status-verified/30 border";
                        } else if (statusUpper === "PENDING") {
                          badgeClasses =
                            "bg-status-pending/10 text-status-pending border-status-pending/30 border";
                        } else if (statusUpper === "DRAFT") {
                          badgeClasses =
                            "bg-secondary/10 text-secondary border-secondary/30 border";
                        } else if (statusUpper === "REJECTED") {
                          badgeClasses =
                            "bg-error-container text-on-error-container border-error/30 border";
                        }

                        return (
                          <div className="space-y-1">
                            <span
                              className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${badgeClasses}`}
                            >
                              {statusUpper}
                            </span>
                            {statusUpper === "REJECTED" && item.rejectionReason && (
                              <p className="text-error mt-1 max-w-xs text-[11px] font-medium italic">
                                Alasan: {item.rejectionReason}
                              </p>
                            )}
                          </div>
                        );
                      })()}
                    </td>
                    <td className="text-on-surface-variant px-6 py-4 text-xs whitespace-nowrap">
                      {new Date(item.publishedAt).toLocaleDateString("id-ID", {
                        dateStyle: "medium",
                      })}
                    </td>
                    <td className="space-x-2 px-6 py-4 text-right whitespace-nowrap">
                      <Link
                        href={`/admin/berita/${item.id}/edit`}
                        className="bg-primary/10 text-primary hover:bg-primary hover:text-on-primary inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-bold transition"
                        title="Sunting & Edit Berita"
                      >
                        <Icon name="edit" className="text-sm" /> Sunting
                      </Link>
                      {item.status !== "PUBLISHED" && (
                        <button
                          onClick={() =>
                            handleStatusChange(item.id, "PUBLISHED")
                          }
                          className="rounded-xl bg-emerald-600/10 px-3 py-1.5 text-xs font-bold text-emerald-700 transition hover:bg-emerald-600 hover:text-white"
                          title="Terbitkan Berita Ini"
                        >
                          Terbitkan
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(item.id, item.title)}
                        className="bg-error/10 text-error hover:bg-error hover:text-on-error rounded-xl px-3 py-1.5 text-xs font-bold transition"
                        title="Hapus Berita"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
