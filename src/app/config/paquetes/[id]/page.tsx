import { notFound } from "next/navigation";
import { PackageEditor } from "@/components/PackageEditor";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function PaqueteDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [pack, products] = await Promise.all([
    prisma.package.findUnique({
      where: { id },
      include: { items: true, _count: { select: { orderItems: true } } },
    }),
    prisma.product.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!pack) notFound();
  return (
    <PackageEditor
      pack={{
        id: pack.id,
        name: pack.name,
        description: pack.description,
        enabled: pack.enabled,
        items: pack.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
        hasTransactions: pack._count.orderItems > 0,
      }}
      products={products.map((product) => ({
        id: product.id,
        name: product.name,
        priceMxn: product.priceMxn,
      }))}
    />
  );
}
