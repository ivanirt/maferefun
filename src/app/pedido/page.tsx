"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { formatMxn } from "@/lib/shipping";

type Lookup = {
  code: string;
  status: string;
  total: number;
  createdAt: string;
  items: { name: string; quantity: number }[];
};

const STATUS: Record<string, string> = {
  pendiente_pago: "Pendiente de pago",
  pagado: "Pagado",
  recibido: "Recibido",
};

export default function PedidoPage() {
  return (
    <Suspense fallback={<p className="px-4 py-12 text-sm text-[#6D5E52]">Cargando…</p>}>
      <PedidoLookup />
    </Suspense>
  );
}

function PedidoLookup() {
  const searchParams = useSearchParams();
  const [code, setCode] = useState("");
  const [order, setOrder] = useState<Lookup | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fromUrl = searchParams.get("code");
    if (!fromUrl) return;
    setCode(fromUrl.toUpperCase());
    fetch(`/api/orders?code=${encodeURIComponent(fromUrl)}`)
      .then((res) => res.json().then((data) => ({ res, data })))
      .then(({ res, data }) => {
        if (!res.ok) setError(data.error || "No encontramos ese pedido.");
        else setOrder(data);
      });
  }, [searchParams]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setOrder(null);
    const res = await fetch(`/api/orders?code=${encodeURIComponent(code.trim())}`);
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "No encontramos ese pedido.");
      return;
    }
    setOrder(data);
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <h1 className="font-serif text-3xl">Estatus del pedido</h1>
      <p className="mt-2 text-sm text-[#6D5E52]">Escribe el número que te dimos al pagar.</p>
      <form onSubmit={onSubmit} className="mt-6 flex gap-2">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="MF-A1B2C3"
          className="flex-1 border border-[#EADBCE] bg-white px-3 py-2 font-mono"
        />
        <button className="bg-[#241B16] px-4 py-2 text-xs uppercase tracking-wider text-[#FAF7F2]">Ver</button>
      </form>
      {error ? <p className="mt-4 text-sm text-[#6D5E52]">{error}</p> : null}
      {order ? (
        <div className="mt-8 border border-[#EADBCE] bg-white p-5">
          <p className="font-mono text-lg">{order.code}</p>
          <p className="mt-1 text-sm">{STATUS[order.status] || order.status}</p>
          <p className="mt-1 text-sm text-[#6D5E52]">
            {formatMxn(order.total)} · {new Date(order.createdAt).toLocaleDateString("es-MX")}
          </p>
          <ul className="mt-4 space-y-1 text-sm text-[#6D5E52]">
            {order.items.map((item) => (
              <li key={item.name}>
                {item.quantity} × {item.name}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
