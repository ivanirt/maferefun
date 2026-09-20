import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatMxn } from "@/lib/shipping";

export const dynamic = "force-dynamic";

export default async function ProductosAdminPage() {
  const products = await prisma.product.findMany({
    orderBy: { name: "asc" },
    include: { images: { orderBy: { sort: "asc" } } },
  });

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-serif text-2xl">Inventario</h2>
        <Link href="/config/productos/nuevo" className="bg-[#241B16] px-4 py-2 text-xs uppercase tracking-wider text-[#FAF7F2]">
          Nuevo artículo
        </Link>
      </div>
      <div className="mt-6 overflow-x-auto border border-[#EADBCE] bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#F3EEE6] text-xs uppercase tracking-wider text-[#6D5E52]">
            <tr>
              <th className="px-3 py-2">Artículo</th>
              <th className="px-3 py-2">Precio unitario</th>
              <th className="px-3 py-2">Inventario</th>
              <th className="px-3 py-2">Mínimo</th>
              <th className="px-3 py-2">Estado</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const low = product.stock <= product.minStock;
              return (
                <tr key={product.id} className="border-t border-[#EADBCE]">
                  <td className="px-3 py-2">
                    <Link href={`/config/productos/${product.id}`} className="font-medium text-[#241B16]">
                      {product.name}
                    </Link>
                    <p className="text-xs text-[#6D5E52]">{product.orisha}</p>
                  </td>
                  <td className="px-3 py-2">{formatMxn(product.priceMxn)}</td>
                  <td className={`px-3 py-2 ${low ? "text-[#8B3A2A]" : ""}`}>{product.stock}</td>
                  <td className="px-3 py-2">{product.minStock}</td>
                  <td className="px-3 py-2">{product.enabled ? "Activo" : "Deshabilitado"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
