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
  const rows = await prisma.product.findMany({
    where: { enabled: true, inCarousel: true },
    orderBy: { name: "asc" },
    include: { offers: true, images: { orderBy: { sort: "asc" as const } } },
  });
  return { title: "Destacados", products: rows.map(toCatalogProduct) };
}
