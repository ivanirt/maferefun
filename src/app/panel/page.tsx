import Link from "next/link";
import { redirect } from "next/navigation";
import { formatMxn } from "@/lib/shipping";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { LogoutButton } from "@/components/LogoutButton";

export const dynamic = "force-dynamic";

export default async function PanelPage() {
  const user = await getSession();
  if (!user) redirect("/acceso");

  const [orders, consultas] = await Promise.all([
    prisma.order.findMany({
      where: { OR: [{ devoteeId: user.id }, { email: user.email }] },
      orderBy: { createdAt: "desc" },
      include: { items: { include: { product: true } } },
    }),
    prisma.consulta.findMany({
      where: { OR: [{ devoteeId: user.id }, { email: user.email }] },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-serif text-4xl">Mi cuenta</h1>
        <LogoutButton />
      </div>
      <p className="mt-2 text-[#6D5E52]">{user.name}</p>

      <h2 className="mt-10 font-serif text-2xl">Pedidos</h2>
      {orders.length === 0 ? (
        <p className="mt-2 text-sm text-[#6D5E52]">
          Aún no hay pedidos. <Link href="/">Ver catálogo</Link>
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {orders.map((order) => (
            <li key={order.id} className="border border-[#EADBCE] bg-white p-4 text-sm">
              <p>
                {order.code} · {order.status} · {formatMxn(order.total)} ·{" "}
                {order.createdAt.toLocaleDateString("es-MX")}
              </p>
              <p className="text-[#6D5E52]">{order.items.map((item) => item.product.name).join(", ")}</p>
            </li>
          ))}
        </ul>
      )}

      <h2 className="mt-10 font-serif text-2xl">Consultas</h2>
      {consultas.length === 0 ? (
        <p className="mt-2 text-sm text-[#6D5E52]">
          No hay solicitudes. <Link href="/consultas">Pedir consulta</Link>
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {consultas.map((consulta) => (
            <li key={consulta.id} className="border border-[#EADBCE] bg-white p-4 text-sm">
              {consulta.kind} · {consulta.status}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
