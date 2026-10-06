/**
 * Converts a stored `coverImage`/`logo`/etc. value into a usable `src` for
 * `<img>`/`FallbackImage`. Currently a pass-through: the connected backend
 * always returns either a fully-qualified URL (`http(s)://`) or a
 * root-relative path (`/uploads/...`), both directly usable as-is.
 *
 * NOTE: if the backend ever returns a *bare* relative key (no leading `/`,
 * e.g. `"berita/cover.jpg"`), that would be returned unresolved and would
 * NOT work as an `<img src>` (it'd resolve relative to the current page
 * URL). Re-introduce a prefix step here if that turns out to happen —
 * couldn't verify from the frontend alone which shape the backend
 * guarantees for every field.
 */
export function resolveImageUrl(
  storagePathOrUrl: string | null | undefined,
): string | null {
  return storagePathOrUrl ?? null;
}
