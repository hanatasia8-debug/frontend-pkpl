import type { NewsContentSectionDto } from "./types";

/** Average reading speed for Bahasa Indonesia prose. */
const WORDS_PER_MINUTE = 200;

function asNonEmptyString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

/**
 * `News.contentSections` is an untyped `Json` column, so anything read back
 * from it is `unknown` as far as the type system is concerned. This narrows
 * it into the shape the UI renders, silently dropping malformed entries
 * instead of throwing — one bad row must not turn a detail page into a 500.
 */
export function parseContentSections(value: unknown): NewsContentSectionDto[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((raw) => {
    if (typeof raw !== "object" || raw === null) return [];
    const section = raw as Record<string, unknown>;

    const paragraph = asNonEmptyString(section.paragraph);
    const sectionTitle = asNonEmptyString(section.section_title);
    if (!paragraph && !sectionTitle) return [];

    return [
      {
        sectionTitle,
        paragraph: paragraph ?? "",
        sectionImage: asNonEmptyString(section.section_image),
      },
    ];
  });
}

function countWords(text: string): number {
  const trimmed = text.trim();
  return trimmed.length === 0 ? 0 : trimmed.split(/\s+/).length;
}

/**
 * Reading-time estimate shown in the article header ("5 Menit Baca" in the
 * prototype). Computed from the article body on every request rather than
 * stored, so it can never drift out of sync with edited content.
 */
export function estimateReadingMinutes(
  sections: NewsContentSectionDto[],
): number {
  const words = sections.reduce(
    (total, section) =>
      total +
      countWords(section.sectionTitle || section.title || "") +
      countWords(section.paragraph || section.body || ""),
    0,
  );

  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}
