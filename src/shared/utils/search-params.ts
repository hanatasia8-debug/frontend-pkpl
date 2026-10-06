/** Value types accepted when building a query string. `null` removes the key. */
type ParamValue = string | number | null | undefined;

/**
 * Returns a query string ("?a=1&b=2", or "" when empty) built from `current`
 * with `updates` applied — used by the listing pages so changing one filter
 * never silently drops the others (e.g. paging while a search keyword and a
 * category chip are both active).
 */
export function buildQueryString(
  current: URLSearchParams | Record<string, string> | string,
  updates: Record<string, ParamValue> = {},
): string {
  const params = new URLSearchParams(current);

  Object.entries(updates).forEach(([key, value]) => {
    if (value === null || value === undefined || value === "") {
      params.delete(key);
    } else {
      params.set(key, String(value));
    }
  });

  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
}
