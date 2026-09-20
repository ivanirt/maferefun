import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatMxn } from "@/lib/shipping";

export const dynamic = "force-dynamic";

export default async function PaquetesAdminPage() {
  const packages = await prisma.package.findMany({
    orderBy: { name: "asc" },
    include: { items: { include: { product: true } } },
  });

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-serif text-2xl">Paquetes</h2>
        <Link href="/config/paquetes/nuevo" className="bg-[#241B16] px-4 py-2 text-xs uppercase tracking-wider text-[#FAF7F2]">
          Nuevo paquete
        </Link>
      </div>
      <ul className="mt-6 space-y-3">
        {packages.map((pack) => {
          const total = pack.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
          return (
            <li key={pack.id} className="border border-[#EADBCE] bg-white p-4">
              <Link href={`/config/paquetes/${pack.id}`} className="font-serif text-xl">
                {pack.name}
              </Link>
              <p className="text-sm text-[#6D5E52]">
                {pack.enabled ? "Activo" : "Deshabilitado"} · {formatMxn(total)} ·{" "}
                {pack.items.map((item) => `${item.quantity}× ${item.product.name}`).join(", ")}
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
