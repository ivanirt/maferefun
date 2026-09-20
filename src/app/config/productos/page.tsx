import Link from "next/link";
import { InventoryTable } from "@/components/InventoryTable";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ProductosAdminPage() {
  const products = await prisma.product.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      orisha: true,
      priceMxn: true,
      stock: true,
      minStock: true,
      enabled: true,
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-serif text-2xl">Inventario</h2>
        <Link href="/config/productos/nuevo" className="bg-[#241B16] px-4 py-2 text-xs uppercase tracking-wider text-[#FAF7F2]">
          Nuevo artículo
        </Link>
      </div>
      <InventoryTable products={products} />
    </div>
  );
}
