import { savingsPercent } from "@/lib/catalog";
import { formatMxn } from "@/lib/shipping";

export function SalePrice({
  priceMxn,
  compareAtMxn,
  className = "text-sm",
}: {
  priceMxn: number;
  compareAtMxn?: number | null;
  className?: string;
}) {
  const percent = compareAtMxn ? savingsPercent(compareAtMxn, priceMxn) : null;
  if (!compareAtMxn || !percent) {
    return <p className={`${className} text-[#241B16]`}>{formatMxn(priceMxn)}</p>;
  }
  return (
    <p className={`${className} flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-[#241B16]`}>
      <span className="text-[#6D5E52] line-through">{formatMxn(compareAtMxn)}</span>
      <span>{formatMxn(priceMxn)}</span>
      <span className="text-xs text-[#8B3A2A]">Ahorras {percent}%</span>
    </p>
  );
}
