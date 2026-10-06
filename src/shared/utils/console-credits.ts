/**
 * Discreet ASCII Banner & Credit for KKN Desa Pringgodani 2026
 * Appears in browser console (F12) for technical reviewers & developers.
 */
export function initConsoleCredits() {
  if (typeof window === "undefined") return;

  const headerStyle =
    "color: #064E3B; font-weight: bold; font-size: 14px; padding: 4px 0;";
  const subStyle = "color: #003527; font-size: 11px; line-height: 1.5;";
  const quoteStyle = "color: #C9A86A; font-style: italic; font-size: 11px;";

  console.log(
    `%c🌲 Website Resmi Desa Pringgodani\n%cInisiatif Pengabdian & Digitalisasi Mahasiswa KKN 2026\n%c"Terima kasih telah menjadi bagian dari perjalanan Desa Pringgodani."\n\nKetik triggerKknMemorial() di console atau tekan Shift+K untuk membuka memorial.`,
    headerStyle,
    subStyle,
    quoteStyle,
  );

  // Expose manual trigger in window for developers
  (window as any).triggerKknMemorial = () => {
    window.dispatchEvent(new CustomEvent("kkn-open-memorial"));
  };
}
