/**
 * Validates and sanitizes external URLs to prevent javascript: or data: pseudo-protocol injection (OWASP A03).
 */
export function sanitizeExternalUrl(url?: string | null): string | undefined {
  if (!url || typeof url !== "string") return undefined;
  const trimmed = url.trim();
  if (!trimmed) return undefined;

  // Allowed protocols for links: http, https, mailto, tel, or root-relative path
  if (
    trimmed.startsWith("https://") ||
    trimmed.startsWith("http://") ||
    trimmed.startsWith("mailto:") ||
    trimmed.startsWith("tel:") ||
    (trimmed.startsWith("/") && !trimmed.startsWith("//"))
  ) {
    return trimmed;
  }

  // If it's a domain-like string (e.g. instagram.com/foo or facebook.com/foo), prefix with https://
  if (/^[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+(\/.*)?$/.test(trimmed)) {
    return `https://${trimmed}`;
  }

  return undefined;
}
