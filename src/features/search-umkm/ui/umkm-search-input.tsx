import { SearchBox } from "@/widgets/search-box/search-box";

/**
 * Free-text search for the /umkm directory (`?cari=`), matched against the
 * business name and description. Thin wrapper over the shared `SearchBox` so
 * /berita and /umkm behave identically (debounce, URL state, page reset).
 */
export function UmkmSearchInput() {
  return (
    <SearchBox
      id="cari-umkm"
      label="Cari UMKM"
      placeholder="Cari nama usaha atau produk..."
      className="lg:min-w-[260px] lg:flex-1"
      inputClassName="bg-surface-container border-none"
    />
  );
}
