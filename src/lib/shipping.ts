export const FREE_SHIPPING_THRESHOLD = 1500;
export const SHIPPING_FEE = 180;
export const CONSECRATION_FEE = 350;

export function getShippingCost(merchandiseTotal: number, itemCount: number): number {
  if (itemCount === 0 || merchandiseTotal >= FREE_SHIPPING_THRESHOLD) return 0;
  return SHIPPING_FEE;
}

export function formatMxn(amount: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(amount);
}
