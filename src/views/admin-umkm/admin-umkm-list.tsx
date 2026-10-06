"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@/shared/ui/icon";
import { AdminUmkmService } from "@/entities/admin/api/admin-umkm.service";
import type {
  AdminUmkmItem,
  UmkmStatus,
} from "@/entities/admin/model/admin.types";

export function AdminUmkmList() {
  const [umkmItems, setUmkmItems] = useState<AdminUmkmItem[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadUmkm = () => {
    setIsLoading(true);
    AdminUmkmService.getAllUmkm()
      .then((res) => setUmkmItems(res.items))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    let ignore = false;
    AdminUmkmService.getAllUmkm()
      .then((res) => {
        if (!ignore) setUmkmItems(res.items);
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

  const handleStatusChange = async (id: string, newStatus: UmkmStatus) => {
    await AdminUmkmService.updateUmkmStatus(id, newStatus);
    showToast(`Status UMKM berhasil diubah menjadi ${newStatus}.`);
    loadUmkm();
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus UMKM "${name}"?`)) {
      await AdminUmkmService.deleteUmkm(id);
      showToast(`UMKM "${name}" telah dihapus.`);
      loadUmkm();
    }
  };

  const filteredItems = umkmItems.filter((item) => {
    if (filterStatus !== "ALL" && item.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.ownerName.toLowerCase().includes(q) ||
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
            Ekonomi & Usaha Warga
          </span>
          <h2 className="font-headline-lg text-primary mt-1 text-3xl font-bold">
            Kelola Data UMKM Desa
          </h2>
          <p className="text-on-surface-variant mt-1 text-sm">
            Daftarkan UMKM baru, verifikasi status usaha, dan atur katalog
            produk warga.
          </p>
        </div>

        <Link
          href="/admin/umkm/new"
          className="bg-primary text-on-primary hover:bg-primary/90 inline-flex items-center gap-2 self-start rounded-2xl px-6 py-3.5 text-xs font-bold shadow-md transition sm:self-auto"
        >
          <Icon name="add" className="text-xl" /> Tambah UMKM Baru
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
            placeholder="Cari nama UMKM, pemilik, atau kategori..."
            className="bg-surface border-outline-variant text-on-surface focus:border-primary w-full rounded-2xl border py-3 pr-4 pl-12 text-sm outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-on-surface-variant mr-1 text-xs font-bold">
            Status:
          </span>
          {["ALL", "APPROVED", "PENDING", "DRAFT", "REJECTED"].map((st) => (
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

      {/* Tabel UMKM */}
      <div className="border-outline-variant/30 bg-surface-container-lowest overflow-hidden rounded-3xl border shadow-sm">
        {isLoading ? (
          <div className="text-on-surface-variant py-12 text-center text-sm font-medium">
            Memuat daftar UMKM...
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-on-surface-variant space-y-2 py-12 text-center text-sm font-medium">
            <Icon
              name="storefront"
              className="text-primary/40 mx-auto text-4xl"
            />
            <p>Tidak ada UMKM yang sesuai dengan kriteria filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-container-highest text-on-surface-variant border-b text-xs font-bold uppercase">
                <tr>
                  <th className="px-6 py-4">Nama Usaha & Pemilik</th>
                  <th className="px-6 py-4">Kategori</th>
                  <th className="px-6 py-4">Kontak Telepon</th>
                  <th className="px-6 py-4">Status</th>
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
                        {item.name}
                      </p>
                      <p className="text-on-surface-variant mt-0.5 text-xs">
                        Pemilik: {item.ownerName}
                      </p>
                    </td>
                    <td className="text-on-surface-variant px-6 py-4 text-xs font-semibold whitespace-nowrap">
                      {item.categoryName}
                    </td>
                    <td className="text-primary px-6 py-4 font-mono text-xs font-bold whitespace-nowrap">
                      {item.phone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <span
                          className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${
                            item.status === "APPROVED"
                              ? "bg-primary-container text-on-primary-container"
                              : item.status === "PENDING"
                                ? "bg-warning-container text-on-warning-container"
                                : item.status === "DRAFT"
                                  ? "bg-surface-container-high text-on-surface-variant"
                                  : "bg-error-container text-on-error-container"
                          }`}
                        >
                          {item.status}
                        </span>
                        {item.status === "REJECTED" && item.rejectionReason && (
                          <p className="text-error mt-1 max-w-xs text-[11px] font-medium italic">
                            Alasan: {item.rejectionReason}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="space-x-2 px-6 py-4 text-right whitespace-nowrap">
                      {item.status !== "APPROVED" && (
                        <button
                          onClick={() =>
                            handleStatusChange(item.id, "APPROVED")
                          }
                          className="bg-primary/10 text-primary hover:bg-primary hover:text-on-primary rounded-xl px-3 py-1.5 text-xs font-bold transition"
                          title="Setujui UMKM Ini"
                        >
                          Setujui
                        </button>
                      )}
                      <Link
                        href={`/admin/umkm/${item.id}/edit`}
                        className="bg-secondary/10 text-secondary hover:bg-secondary hover:text-on-secondary inline-flex items-center gap-1 rounded-xl px-3 py-1.5 align-middle text-xs font-bold transition"
                        title="Sunting UMKM"
                      >
                        <Icon name="edit" className="text-sm" /> Sunting
                      </Link>
                      <button
                        onClick={() => handleDelete(item.id, item.name)}
                        className="bg-error/10 text-error hover:bg-error hover:text-on-error rounded-xl px-3 py-1.5 align-middle text-xs font-bold transition"
                        title="Hapus UMKM"
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
