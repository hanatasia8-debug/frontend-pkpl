import { Icon } from "@/shared/ui/icon";

export function ProductTrustBadges() {
  const badges = [
    {
      icon: "eco",
      title: "100% Asli Pringgodani",
      desc: "Diproduksi oleh warga & pengrajin desa.",
    },
    {
      icon: "chat",
      title: "Pesan Langsung via WA",
      desc: "Komunikasi tanpa perantara ke pemilik.",
    },
    {
      icon: "verified_user",
      title: "Tanpa Biaya Admin",
      desc: "100% pembayaran untuk penggiat UMKM.",
    },
    {
      icon: "inventory_2",
      title: "Bisa COD / Ambil di Lokasi",
      desc: "Siap ambil di tempat atau kirim desa.",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
      {badges.map((badge, idx) => (
        <div
          key={idx}
          className="bg-surface-container-low/70 border-outline-variant/20 flex items-start gap-2 sm:gap-2.5 rounded-xl border p-2 sm:p-2.5 transition-colors hover:bg-surface-container"
        >
          <div className="bg-primary/10 text-primary flex h-6 w-6 sm:h-7 sm:w-7 shrink-0 items-center justify-center rounded-lg">
            <Icon name={badge.icon} className="text-xs sm:text-sm" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-headline-md text-on-surface text-[11px] sm:text-xs font-bold leading-tight truncate">
              {badge.title}
            </h4>
            <p className="text-on-surface-variant/75 mt-0.5 text-[10px] leading-tight hidden xs:block line-clamp-1">
              {badge.desc}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
