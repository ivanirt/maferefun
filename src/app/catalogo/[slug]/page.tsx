import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/ProductDetail";
import { toCatalogProduct } from "@/lib/featured";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function CatalogoDetallePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await prisma.product.findFirst({
    where: { slug, enabled: true },
    include: { offers: true, images: { orderBy: { sort: "asc" } } },
  });
  if (!product) notFound();
  return <ProductDetail product={toCatalogProduct(product)} detail={product.detail} />;
}
