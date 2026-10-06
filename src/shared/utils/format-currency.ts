/**
 * Formats a rupiah amount the way the prototype writes prices
 * ("Rp 150.000"). `UmkmProduct.price` is nullable in the schema, so a missing
 * price returns the agreed placeholder instead of "Rp 0".
 */
export function formatRupiah(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return "Harga menyesuaikan";

  return `Rp ${new Intl.NumberFormat("id-ID").format(amount)}`;
}
