export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://lokalpringgodani.my.id";

export interface OpenGraphImageDescriptor {
  url: string;
  secureUrl: string;
  width: number;
  height: number;
  alt: string;
  type?: string;
}

/**
 * Converts any relative or absolute image path into a fully qualified HTTPS absolute URL.
 * Required by social media crawlers (WhatsApp, Facebook, Twitter, Telegram, LinkedIn).
 */
export function toAbsoluteUrl(
  pathOrUrl: string | null | undefined,
  fallback = "/images/og-image.png",
): string {
  if (!pathOrUrl || typeof pathOrUrl !== "string" || !pathOrUrl.trim()) {
    const cleanFallback = fallback.startsWith("/") ? fallback : `/${fallback}`;
    return `${SITE_URL.replace(/\/+$/, "")}${cleanFallback}`;
  }

  const clean = pathOrUrl.trim();

  // If already absolute HTTP/HTTPS URL (e.g. Supabase storage or external CDN)
  if (/^https?:\/\//i.test(clean)) {
    return clean;
  }

  // If starts with leading slash
  if (clean.startsWith("/")) {
    return `${SITE_URL.replace(/\/+$/, "")}${clean}`;
  }

  // If relative path without slash
  return `${SITE_URL.replace(/\/+$/, "")}/${clean}`;
}

/**
 * Generates OpenGraph image descriptors with standard WhatsApp/Facebook dimensions (1200x630)
 * and correct MIME types for crawler compatibility.
 */
export function buildOpenGraphImage(
  imageUrl: string | null | undefined,
  alt: string,
  fallback = "/images/og-image.png",
): OpenGraphImageDescriptor[] {
  const absoluteUrl = toAbsoluteUrl(imageUrl, fallback);
  const cleanUrl = absoluteUrl.split("?")[0].toLowerCase();

  let mimeType = "image/jpeg";
  if (cleanUrl.endsWith(".png")) {
    mimeType = "image/png";
  } else if (cleanUrl.endsWith(".webp")) {
    mimeType = "image/webp";
  } else if (cleanUrl.endsWith(".gif")) {
    mimeType = "image/gif";
  } else if (cleanUrl.endsWith(".svg")) {
    mimeType = "image/svg+xml";
  }

  return [
    {
      url: absoluteUrl,
      secureUrl: absoluteUrl,
      width: 1200,
      height: 630,
      alt: alt || "Lokal Pringgodani",
      type: mimeType,
    },
  ];
}
