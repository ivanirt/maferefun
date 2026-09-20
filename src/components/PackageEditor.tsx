"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { formatMxn } from "@/lib/shipping";

type ProductOption = { id: string; name: string; priceMxn: number };
type PackItem = { productId: string; quantity: number; unitPrice: number };

export function PackageEditor({
  pack,
  products,
}: {
  pack?: {
    id: string;
    name: string;
    description: string;
    enabled: boolean;
    items: PackItem[];
    hasTransactions: boolean;
  };
  products: ProductOption[];
}) {
  const router = useRouter();
  const [name, setName] = useState(pack?.name || "");
  const [description, setDescription] = useState(pack?.description || "");
  const [enabled, setEnabled] = useState(pack?.enabled ?? true);
  const [items, setItems] = useState<PackItem[]>(pack?.items.length ? pack.items : [{ productId: products[0]?.id || "", quantity: 1, unitPrice: products[0]?.priceMxn || 0 }]);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const total = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  function updateItem(index: number, patch: Partial<PackItem>) {
    setItems((current) => current.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch(pack ? `/api/admin/packages/${pack.id}` : "/api/admin/packages", {
        method: pack ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, enabled, items }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || "No se pudo guardar.");
        return;
      }
      router.push(`/config/paquetes/${data.package.id}`);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function disable() {
    if (!pack) return;
    await fetch(`/api/admin/packages/${pack.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: !enabled }),
    });
    setEnabled(!enabled);
    router.refresh();
  }

  async function remove() {
    if (!pack) return;
    const res = await fetch(`/api/admin/packages/${pack.id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error || "No se pudo borrar.");
      return;
    }
    router.push("/config/paquetes");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="max-w-2xl space-y-4">
      <h2 className="font-serif text-2xl">{pack ? "Detalle del paquete" : "Nuevo paquete"}</h2>
      <p className="text-sm text-[#6D5E52]">
        Cada artículo lleva su precio especial en el paquete. El inventario sigue mostrando el precio unitario de lista.
        El paquete se cobra como una sola transacción.
      </p>
      <label className="block text-sm">
        Nombre
        <input required value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full border border-[#EADBCE] px-3 py-2" />
      </label>
      <label className="block text-sm">
        Descripción
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 w-full border border-[#EADBCE] px-3 py-2" />
      </label>
      {items.map((item, index) => {
        const product = products.find((entry) => entry.id === item.productId);
        return (
          <div key={index} className="grid gap-2 border border-[#EADBCE] bg-white p-3 sm:grid-cols-3">
            <label className="block text-sm sm:col-span-3">
              Artículo
              <select
                value={item.productId}
                onChange={(e) => {
                  const next = products.find((entry) => entry.id === e.target.value);
                  updateItem(index, { productId: e.target.value, unitPrice: next?.priceMxn || 0 });
                }}
                className="mt-1 w-full border border-[#EADBCE] px-3 py-2"
              >
                {products.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name} · lista {formatMxn(option.priceMxn)}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              Cantidad
              <input type="number" min={1} value={item.quantity} onChange={(e) => updateItem(index, { quantity: Number(e.target.value) })} className="mt-1 w-full border border-[#EADBCE] px-3 py-2" />
            </label>
            <label className="block text-sm">
              Precio especial
              <input type="number" min={0} value={item.unitPrice} onChange={(e) => updateItem(index, { unitPrice: Number(e.target.value) })} className="mt-1 w-full border border-[#EADBCE] px-3 py-2" />
            </label>
            <p className="self-end text-sm text-[#6D5E52]">Lista {product ? formatMxn(product.priceMxn) : "—"}</p>
            {items.length > 1 ? (
              <button type="button" className="text-left text-xs uppercase tracking-wider" onClick={() => setItems((current) => current.filter((_, i) => i !== index))}>
                Quitar
              </button>
            ) : null}
          </div>
        );
      })}
      <button
        type="button"
        className="border border-[#EADBCE] px-4 py-2 text-xs uppercase tracking-wider"
        onClick={() =>
          setItems((current) => [
            ...current,
            { productId: products[0]?.id || "", quantity: 1, unitPrice: products[0]?.priceMxn || 0 },
          ])
        }
      >
        Añadir artículo
      </button>
      <p className="text-sm">Total del paquete {formatMxn(total)}</p>
      <button disabled={busy} className="bg-[#241B16] px-4 py-2 text-xs uppercase tracking-wider text-[#FAF7F2]">
        {pack ? "Guardar cambios" : "Crear paquete"}
      </button>
      {pack ? (
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={disable} className="border border-[#EADBCE] px-4 py-2 text-xs uppercase tracking-wider">
            {enabled ? "Deshabilitar" : "Habilitar"}
          </button>
          <button type="button" onClick={remove} disabled={pack.hasTransactions} className="border border-[#EADBCE] px-4 py-2 text-xs uppercase tracking-wider disabled:opacity-40">
            Borrar
          </button>
        </div>
      ) : null}
      {message ? <p className="text-sm text-[#8B3A2A]">{message}</p> : null}
    </form>
  );
}
