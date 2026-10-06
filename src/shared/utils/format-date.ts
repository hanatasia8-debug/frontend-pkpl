/** "24 Mar 2024" — used on News cards. */
export function formatIndonesianDate(isoDate: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(isoDate));
}

/**
 * "Baru saja" / "3 jam lalu" / "2 hari lalu" — used on UMKM cards, matching
 * the prototype's relative-time labels ("Baru saja", "1 jam lalu", "3 jam
 * lalu"). Falls back to a short date once older than a week.
 */
export function formatRelativeTime(isoDate: string): string {
  const date = new Date(isoDate);
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return "Baru saja";
  if (diffMinutes < 60) return `${diffMinutes} menit lalu`;
  if (diffHours < 24) return `${diffHours} jam lalu`;
  if (diffDays < 7) return `${diffDays} hari lalu`;
  return formatIndonesianDate(isoDate);
}
