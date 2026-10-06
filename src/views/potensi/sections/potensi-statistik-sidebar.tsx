import { Icon } from "@/shared/ui/icon";

/**
 * The prototype (`detail_potensi_desa_pringgodani_prd_3_compliant`) has a
 * "3. Statistik Section" comment in the sidebar but never fills in any
 * actual content there — it's an empty placeholder in the mockup itself.
 * Since the master plan explicitly requires a statistik section, this
 * designs simple stat tiles from data we actually have (counts of the
 * other three PRD-3 sections), rather than leaving it blank or inventing
 * numbers with no backing.
 */
export function PotensiStatistikSidebar({
  umkmCount,
  productCount,
  newsCount,
}: {
  umkmCount: number;
  productCount: number;
  newsCount: number;
}) {
  const stats = [
    { icon: "storefront", value: umkmCount, label: "UMKM Terkait" },
    { icon: "inventory_2", value: productCount, label: "Produk Unggulan" },
    { icon: "newspaper", value: newsCount, label: "Berita Terkait" },
  ];

  return (
    <section className="border-outline-variant/20 bg-surface-container-lowest rounded-2xl border p-6 shadow-sm">
      <h3 className="text-on-surface-variant font-label-sm text-label-sm mb-4 tracking-widest uppercase">
        Statistik Potensi
      </h3>
      <div className="grid grid-cols-3 gap-3">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center">
            <Icon name={stat.icon} className="text-primary mb-1 text-xl" />
            <div className="font-headline-md text-headline-md text-primary">
              {stat.value}
            </div>
            <div className="text-on-surface-variant text-[11px] leading-tight">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
