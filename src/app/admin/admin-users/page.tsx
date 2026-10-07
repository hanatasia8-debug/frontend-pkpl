"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/shared/api/axios-instance";

interface PendingAdminUser {
  id: string;
  name: string;
  email: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<PendingAdminUser[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let isActive = true;
    apiClient
      .get<{ data: PendingAdminUser[] }>("/admin/users")
      .then(({ data }) => {
        if (isActive) setUsers(data.data);
      })
      .catch((error: unknown) => {
        if (!isActive) return;
        const responseData = (
          error as { response?: { data?: { error?: string } } }
        ).response?.data;
        setErrorMessage(
          responseData?.error || "Gagal memuat permintaan persetujuan.",
        );
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [reloadKey]);

  const approveUser = async (user: PendingAdminUser) => {
    setApprovingId(user.id);
    setErrorMessage("");
    try {
      await apiClient.patch(`/admin/users/${user.id}/approve`);
      setIsLoading(true);
      setReloadKey((key) => key + 1);
    } catch (error) {
      const responseData = (
        error as { response?: { data?: { error?: string } } }
      ).response?.data;
      setErrorMessage(
        responseData?.error || `Gagal menyetujui ${user.email}.`,
      );
    } finally {
      setApprovingId(null);
    }
  };

  return (
    <section className="space-y-6">
      <header>
        <p className="text-on-surface-variant text-xs font-bold uppercase tracking-wider">
          Pengelolaan akses
        </p>
        <h1 className="mt-1 text-3xl font-bold text-primary">
          Persetujuan Admin
        </h1>
        <p className="mt-2 text-sm text-on-surface-variant">
          Akun yang baru mendaftar belum memiliki akses admin sampai disetujui.
        </p>
      </header>

      {errorMessage && (
        <p role="alert" className="rounded-xl bg-red-100 p-4 text-sm text-red-800">
          {errorMessage}
        </p>
      )}

      <div className="overflow-hidden rounded-2xl border border-outline-variant/30 bg-surface-container-lowest">
        {isLoading ? (
          <p className="p-6 text-sm text-on-surface-variant">Memuat akun...</p>
        ) : users.length === 0 ? (
          <p className="p-6 text-sm text-on-surface-variant">
            Tidak ada akun yang menunggu persetujuan.
          </p>
        ) : (
          <ul className="divide-y divide-outline-variant/30">
            {users.map((user) => (
              <li
                key={user.id}
                className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-semibold text-on-surface">{user.name}</p>
                  <p className="mt-1 text-sm text-on-surface-variant">
                    {user.email}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={approvingId !== null}
                  onClick={() => approveUser(user)}
                  className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-on-primary disabled:cursor-wait disabled:opacity-60"
                >
                  {approvingId === user.id ? "Menyetujui..." : "Setujui admin"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
