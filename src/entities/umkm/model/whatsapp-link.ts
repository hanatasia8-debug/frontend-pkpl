/**
 * Normalizes any Indonesian phone number format into standard international format without '+' (e.g. '6281234567890').
 * Handles variations:
 * - Local prefix: '081234567890' -> '6281234567890'
 * - Standard +62: '+6281234567890' -> '6281234567890'
 * - Formatted with symbols: '+62 812-3456-7890' -> '6281234567890'
 * - Accidental double prefix: '62081234567890' -> '6281234567890'
 * - Missing prefix: '81234567890' -> '6281234567890'
 * Returns empty string if invalid or empty.
 */
export function normalizeWhatsappNumber(
  phone: string | null | undefined,
): string {
  if (!phone) return "";

  // Strip all non-digit characters
  let cleaned = phone.replace(/\D/g, "");
  if (!cleaned) return "";

  // Handle accidental '6208...' or '620...' (e.g. user typed '+62 0812...')
  if (cleaned.startsWith("6208")) {
    cleaned = "62" + cleaned.slice(3);
  } else if (cleaned.startsWith("620")) {
    cleaned = "62" + cleaned.slice(3);
  }
  // Handle local prefix '08...' or '0...'
  else if (cleaned.startsWith("0")) {
    cleaned = "62" + cleaned.slice(1);
  }
  // Handle missing prefix '8...'
  else if (cleaned.startsWith("8")) {
    cleaned = "62" + cleaned;
  }

  // Indonesian mobile numbers should start with '62' and have at least 9 digits
  if (!cleaned.startsWith("62") || cleaned.length < 9) {
    return "";
  }

  return cleaned;
}

/**
 * Creates a direct `https://wa.me/<number>?text=<message>` URL.
 * Automatically normalizes the phone number and URI-encodes the message.
 * Returns empty string if phone number is empty/invalid.
 */
export function createWhatsappUrl(
  phone: string | null | undefined,
  message?: string,
): string {
  const normalized = normalizeWhatsappNumber(phone);
  if (!normalized) return "";

  const encodedMsg = message ? `?text=${encodeURIComponent(message.trim())}` : "";
  return `https://wa.me/${normalized}${encodedMsg}`;
}

/**
 * Builds a `wa.me` deep link with a prefilled inquiry message for an UMKM profile.
 */
export function buildWhatsappLink(
  phone: string | null | undefined,
  umkmName: string,
): string {
  const name = umkmName ? umkmName.trim() : "UMKM";
  const message = `Halo, saya tertarik dengan produk dari ${name} yang saya lihat di katalog Lokal Pringgodani.`;
  return createWhatsappUrl(phone, message);
}

/**
 * Renders any valid phone number for display: e.g. `+62 812-3450-0001`.
 * Handles both raw stored numbers (e.g. '081234500001', '6281234500001')
 * and returns '-' or fallback if empty.
 */
export function formatWhatsappNumber(phone: string | null | undefined): string {
  if (!phone || !phone.trim()) return "-";

  const normalized = normalizeWhatsappNumber(phone);
  if (!normalized || normalized.length < 10) {
    return phone.trim();
  }

  const national = normalized.slice(2);
  const groups = [
    national.slice(0, 3),
    national.slice(3, 7),
    national.slice(7),
  ];

  return `+62 ${groups.filter(Boolean).join("-")}`;
}

