import Link from "next/link";
import { requireAdmin } from "@/lib/admin";

export default async function ConfigLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-serif text-3xl">Configuración</h1>
      <nav className="mt-4 flex gap-4 text-sm text-[#6D5E52]">
        <Link href="/config/productos">Productos</Link>
        <Link href="/config/paquetes">Paquetes</Link>
        <Link href="/config/consultas">Consultas</Link>
      </nav>
      <div className="mt-8">{children}</div>
    </div>
  );
}
