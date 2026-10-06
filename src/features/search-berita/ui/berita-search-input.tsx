import { SearchBox } from "@/widgets/search-box/search-box";

/**
 * Free-text search for /berita (`?cari=`). The debounce + URL-state behaviour
 * now lives in the shared `SearchBox` widget, so /berita and /umkm cannot
 * drift apart; this slice only supplies the berita-specific copy and width.
 */
export function BeritaSearchInput() {
  return (
    <SearchBox
      id="cari-berita"
      label="Cari berita"
      placeholder="Cari berita atau pengumuman..."
      className="md:w-1/3"
    />
  );
}
