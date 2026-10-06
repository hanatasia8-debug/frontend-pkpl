import { Icon } from "@/shared/ui/icon";
import { formatRawMapsUrl } from "../model/maps-url";

interface LocationCardProps {
  mapsUrl?: string | null;
  placeName?: string;
  address?: string | null;
}

export function LocationCard({ mapsUrl }: LocationCardProps) {
  const directMapsUrl = formatRawMapsUrl(mapsUrl);

  return (
    <div className="bg-surface-container-low/70 border-outline-variant/30 rounded-2xl border p-5 shadow-xs backdrop-blur-xs sm:p-6">
      <div className="mb-3.5 flex items-center gap-2.5">
        <div className="bg-primary/10 text-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-xl">
          <Icon name="map" className="text-sm" />
        </div>
        <h2 className="font-label-sm text-label-sm text-primary font-bold tracking-wider uppercase">
          Lokasi Usaha
        </h2>
      </div>

      {directMapsUrl ? (
        <>
          <p className="text-on-surface-variant/80 mb-4 text-xs leading-relaxed">
            Dapatkan rute dan panduan navigasi langsung menuju lokasi usaha melalui Google Maps.
          </p>

          <a
            href={directMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-primary text-on-primary hover:bg-primary/90 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold shadow-xs transition-all duration-200 hover:shadow-md active:scale-[0.98]"
          >
            <Icon name="directions" className="shrink-0 text-base" />
            <span>Petunjuk Arah (GPS)</span>
          </a>
        </>
      ) : (
        <>
          <div className="mb-4 rounded-xl border border-amber-200/60 bg-amber-50/70 p-3 text-xs text-amber-900">
            <div className="flex items-start gap-2">
              <Icon
                name="info"
                className="text-amber-600 mt-0.5 shrink-0 text-sm"
              />
              <p className="leading-relaxed">
                Pelaku usaha belum menambahkan tautan Google Maps untuk lokasi usaha ini.
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled
            className="bg-surface-container-highest text-on-surface-variant/50 inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold opacity-75"
          >
            <Icon name="location_searching" className="shrink-0 text-base" />
            <span>Link Lokasi Belum Tersedia</span>
          </button>
        </>
      )}
    </div>
  );
}
