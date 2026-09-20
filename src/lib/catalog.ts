type OfferLike = { priceMxn: number; startsAt: Date; endsAt: Date };

export function savingsPercent(original: number, sale: number): number | null {
  if (!original || sale >= original) return null;
  return Math.max(1, Math.round(((original - sale) / original) * 100));
}

export function currentSalePrice(
  priceMxn: number,
  offers: OfferLike[],
  at = new Date(),
): { priceMxn: number; compareAtMxn: number | null } {
  const active = offers.filter((offer) => offer.startsAt <= at && offer.endsAt >= at);
  if (!active.length) return { priceMxn, compareAtMxn: null };
  const sale = Math.min(...active.map((offer) => offer.priceMxn));
  return { priceMxn: sale, compareAtMxn: sale < priceMxn ? priceMxn : null };
}
