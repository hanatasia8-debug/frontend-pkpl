import { Icon } from "@/shared/ui/icon";
import { cn } from "@/shared/utils/cn";
import { buildWhatsappLink } from "@/entities/umkm/model/whatsapp-link";

interface WhatsappCtaProps {
  /** Phone number in any raw or formatted shape (08xx, +62xx, etc.) */
  phone: string | null | undefined;
  umkmName: string;
  label?: string;
  className?: string;
  disabled?: boolean;
}

/**
 * The one WhatsApp call-to-action used by both the UMKM card and the detail
 * sidebar — `prd_2.txt §4.7` makes WhatsApp the only contact channel for UMKM,
 * so the brand color and the prefilled message live in a single place.
 */
export function WhatsappCta({
  phone,
  umkmName,
  label = "Hubungi WhatsApp",
  className,
  disabled = false,
}: WhatsappCtaProps) {
  const waUrl = buildWhatsappLink(phone, umkmName);
  const isDisabled = disabled || !waUrl;

  if (isDisabled) {
    return (
      <button
        type="button"
        disabled
        aria-label="Nomor WhatsApp tidak tersedia"
        className={cn(
          "inline-flex w-full items-center justify-center gap-2 rounded-xl bg-surface-container-high px-4 py-3 text-xs sm:text-sm font-semibold text-on-surface-variant/60 cursor-not-allowed border border-outline-variant/20 shadow-none",
          className,
        )}
      >
        <Icon name="chat" className="shrink-0 text-base opacity-40" />
        <span className="text-center leading-tight">Kontak WA Belum Tersedia</span>
      </button>
    );
  }

  return (
    <a
      href={waUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Hubungi WhatsApp ${umkmName}`}
      className={cn(
        "inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-3 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:bg-[#20BD5A] hover:shadow-md hover:shadow-emerald-500/20 active:scale-[0.98]",
        className,
      )}
    >
      <Icon name="chat" className="shrink-0 text-base" />
      <span className="text-center leading-tight">{label}</span>
    </a>
  );
}

