import { CatalogHome } from "@/components/CatalogHome";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  try {
    const products = await prisma.product.findMany({ orderBy: { name: "asc" } });
    return <CatalogHome products={products} />;
  } catch {
    return <CatalogHome products={[]} />;
  }
}
