import { notFound } from "next/navigation";
import { ProductEditor } from "@/components/ProductEditor";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function toLocalInput(value: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}T${pad(value.getHours())}:${pad(value.getMinutes())}`;
}

export default async function ProductoDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { images: { orderBy: { sort: "asc" } }, offers: { orderBy: { startsAt: "desc" } } },
  });
  if (!product) notFound();
  const txCount = await prisma.orderItem.count({ where: { productId: id } });
  return (
    <ProductEditor
      product={{
        id: product.id,
        name: product.name,
        category: product.category,
        orisha: product.orisha,
        description: product.description,
        detail: product.detail,
        priceMxn: product.priceMxn,
        stock: product.stock,
        minStock: product.minStock,
        enabled: product.enabled,
        inCarousel: product.inCarousel,
        images: product.images.length ? product.images.map((image) => image.path) : [product.imagePath].filter(Boolean),
        offers: product.offers.map((offer) => ({
          id: offer.id,
          priceMxn: offer.priceMxn,
          startsAt: toLocalInput(offer.startsAt),
          endsAt: toLocalInput(offer.endsAt),
        })),
        hasTransactions: txCount > 0,
      }}
    />
  );
}
