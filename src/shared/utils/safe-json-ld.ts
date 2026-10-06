/**
 * Safely serializes an object to JSON for use within an HTML <script type="application/ld+json"> tag.
 * Replaces all '<' characters with their unicode escape sequence '\u003c' to prevent XSS / script breakout.
 */
export function safeJsonLdStringify(jsonLd: unknown): string {
  if (!jsonLd) return "";
  return JSON.stringify(jsonLd).replace(/</g, "\\u003c");
}
