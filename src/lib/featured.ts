import { currentSalePrice } from "@/lib/catalog";
import { prisma } from "@/lib/prisma";
import type { CatalogProduct } from "@/components/CatalogHome";

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  category: string;
  orisha: string;
  description: string;
  priceMxn: number;
  imagePath: string;
  stock: number;
  offers: { priceMxn: number; startsAt: Date; endsAt: Date }[];
  images: { path: string }[];
};

export function toCatalogProduct(product: ProductRow): CatalogProduct {
  const sale = currentSalePrice(product.priceMxn, product.offers);
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    category: product.category,
    orisha: product.orisha,
    description: product.description,
    priceMxn: sale.priceMxn,
    compareAtMxn: sale.compareAtMxn,
    imagePath: product.images[0]?.path || product.imagePath,
    images: product.images.length ? product.images.map((image) => image.path) : [product.imagePath].filter(Boolean),
    stock: product.stock,
  };
}

export async function featuredProducts(): Promise<{ title: string; products: CatalogProduct[] }> {
  const include = { offers: true, images: { orderBy: { sort: "asc" as const } } };
  const now = new Date();
  const offers = await prisma.product.findMany({
    where: {
      enabled: true,
      offers: { some: { startsAt: { lte: now }, endsAt: { gte: now } } },
    },
    include,
    take: 8,
  });
  if (offers.length) {
    return { title: "Ofertas", products: offers.map(toCatalogProduct) };
  }

  const sold = await prisma.orderItem.groupBy({
    by: ["productId"],
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: "desc" } },
    take: 8,
  });
  if (sold.length >= 3) {
    const rows = await prisma.product.findMany({
      where: { enabled: true, id: { in: sold.map((row) => row.productId) } },
      include,
    });
    const order = new Map(sold.map((row, index) => [row.productId, index]));
    rows.sort((a, b) => (order.get(a.id) ?? 99) - (order.get(b.id) ?? 99));
    return { title: "Más vendidos", products: rows.map(toCatalogProduct) };
  }

  const pool = await prisma.product.findMany({
    where: { enabled: true, stock: { gt: 0 } },
    include,
  });
  const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, 8);
  return { title: "Para empezar", products: shuffled.map(toCatalogProduct) };
}
