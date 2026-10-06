import { Icon } from "@/shared/ui/icon";
import { formatWhatsappNumber } from "@/entities/umkm/model/whatsapp-link";
import { WhatsappCta } from "@/features/whatsapp-contact/ui/whatsapp-cta";
import { LocationCard } from "@/features/google-maps-link/ui/location-card";
import type { UmkmDetailDto } from "@/entities/umkm/model/types";

/**
 * "Informasi Kontak" + "Lokasi" sidebar.
 *
 * Deviations from the mockup, both driven by the schema (`prd_2.txt §6.2`):
 * `Umkm` has no business-email and no operating-hours column, so those two
 * rows are dropped instead of hardcoded — and `submitterEmail` is deliberately
 * NOT shown, it belongs to whoever filed the submission, not to the public
 * profile. WhatsApp is the contact channel the PRD specifies for UMKM.
 */
export function UmkmInfoSidebar({ umkm }: { umkm: UmkmDetailDto }) {
  return (
    <div className="space-y-6">
      <div className="bg-surface-container-low/70 border-outline-variant/30 rounded-2xl border p-5 shadow-xs backdrop-blur-xs sm:p-6">
        <div className="mb-5 flex items-center gap-2.5">
          <div className="bg-primary/10 text-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-xl">
            <Icon name="contact_mail" className="text-sm" />
          </div>
          <h2 className="font-label-sm text-label-sm text-primary font-bold tracking-wider uppercase">
            Informasi Kontak
          </h2>
        </div>

        <div className="space-y-4.5">
          <div className="flex items-start gap-3">
            <div className="bg-emerald-50 text-emerald-700 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl">
              <Icon name="phone" className="text-sm" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-on-surface-variant/75 text-[11px] font-bold tracking-wider uppercase">
                WhatsApp
              </p>
              <p className="text-on-surface mt-0.5 text-sm font-semibold break-words">
                {formatWhatsappNumber(umkm.whatsappNumber || umkm.phone || "") || "-"}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="bg-secondary/10 text-secondary flex h-8 w-8 shrink-0 items-center justify-center rounded-xl">
              <Icon name="location_on" className="text-sm" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-on-surface-variant/75 text-[11px] font-bold tracking-wider uppercase">
                Alamat Usaha
              </p>
              <p className="text-on-surface mt-0.5 text-sm font-semibold leading-snug break-words">
                {umkm.address || "Desa Pringgodani"}
              </p>
            </div>
          </div>

          {(umkm.openDay || (umkm.startTime && umkm.endTime)) && (
            <div className="flex items-start gap-3">
              <div className="bg-amber-50 text-amber-700 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl">
                <Icon name="schedule" className="text-sm" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-on-surface-variant/75 text-[11px] font-bold tracking-wider uppercase">
                  Jam Operasional
                </p>
                <p className="text-on-surface mt-0.5 text-sm font-semibold leading-snug break-words">
                  {umkm.openDay || "Setiap Hari"}
                  {umkm.startTime &&
                    umkm.endTime &&
                    ` (${String(umkm.startTime).includes("T") ? String(umkm.startTime).slice(11, 16) : String(umkm.startTime).slice(0, 5)} - ${String(umkm.endTime).includes("T") ? String(umkm.endTime).slice(11, 16) : String(umkm.endTime).slice(0, 5)})`}
                </p>
              </div>
            </div>
          )}

          {umkm.since && (
            <div className="flex items-start gap-3">
              <div className="bg-purple-50 text-purple-700 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl">
                <Icon name="calendar_today" className="text-sm" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-on-surface-variant/75 text-[11px] font-bold tracking-wider uppercase">
                  Berdiri Sejak
                </p>
                <p className="text-on-surface mt-0.5 text-sm font-semibold">
                  Tahun {umkm.since}
                </p>
              </div>
            </div>
          )}
        </div>

        <WhatsappCta
          phone={umkm.whatsappNumber || umkm.phone || ""}
          umkmName={umkm.name}
          className="mt-6"
        />
      </div>

      <LocationCard
        placeName={umkm.name}
        address={umkm.address}
        mapsUrl={umkm.mapsUrl}
      />
    </div>
  );
}
