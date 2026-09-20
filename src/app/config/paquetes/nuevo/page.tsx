import { PackageEditor } from "@/components/PackageEditor";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function NuevoPaquetePage() {
  const products = await prisma.product.findMany({ orderBy: { name: "asc" } });
  return (
    <PackageEditor
      products={products.map((product) => ({
        id: product.id,
        name: product.name,
        priceMxn: product.priceMxn,
      }))}
    />
  );
}
