"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { MercadoPagoCheckout } from "@/components/MercadoPagoCheckout";
import { CartItem, clearCart, readCart, setQuantity } from "@/lib/cart";
import { CONSECRATION_FEE, FREE_SHIPPING_THRESHOLD, SHIPPING_FEE, formatMxn, getShippingCost } from "@/lib/shipping";

export default function CarritoPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [consecrate, setConsecrate] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [orderCode, setOrderCode] = useState<string | null>(null);
  const [paidTotal, setPaidTotal] = useState(0);
  const [step, setStep] = useState<"form" | "pay" | "done">("form");
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const sync = () => setItems(readCart());
    sync();
    window.addEventListener("maferefun-cart", sync);
    return () => window.removeEventListener("maferefun-cart", sync);
  }, []);

  const subtotal = items.reduce((sum, item) => sum + item.priceMxn * item.quantity, 0);
  const shipping = getShippingCost(subtotal, items.length);
  const consecration = consecrate ? CONSECRATION_FEE : 0;
  const total = subtotal + shipping + consecration;

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          whatsapp,
          address,
          notes,
          consecrate,
          items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || "No se pudo confirmar el pedido.");
        return;
      }
      setOrderCode(data.code);
      setPaidTotal(data.total ?? total);
      setStep("pay");
    } finally {
      setBusy(false);
    }
  }

  async function onPaid(paymentId: string) {
    if (!orderCode) return;
    const res = await fetch("/api/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: orderCode, paymentId }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error || "El pago no se pudo registrar.");
      return;
    }
    clearCart();
    setStep("done");
  }

  if (step === "done" && orderCode) {
    return (
      <div className="mx-auto max-w-xl px-4 py-12">
        <h1 className="font-serif text-3xl">Pedido completado</h1>
        <p className="mt-4 text-[#6D5E52]">
          El pago simulado de Mercado Pago quedó aprobado. Anota este número para revisar cómo va tu pedido:
        </p>
        <p className="mt-6 border border-[#EADBCE] bg-white px-4 py-4 text-center font-mono text-2xl tracking-wider text-[#241B16]">
          {orderCode}
        </p>
        <p className="mt-4 text-sm text-[#6D5E52]">Total pagado {formatMxn(paidTotal)}.</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href={`/pedido?code=${encodeURIComponent(orderCode)}`}
            className="flex-1 bg-[#241B16] py-3 text-center text-xs uppercase tracking-wider text-[#FAF7F2]"
          >
            Ver estatus
          </Link>
          <Link href="/" className="flex-1 border border-[#EADBCE] py-3 text-center text-xs uppercase tracking-wider">
            Seguir viendo
          </Link>
        </div>
      </div>
    );
  }

  if (step === "pay" && orderCode) {
    return (
      <div className="px-4 py-10">
        <p className="mb-4 text-center text-sm text-[#6D5E52]">Pedido {orderCode}</p>
        <MercadoPagoCheckout
          amount={paidTotal}
          email={email}
          onPaid={onPaid}
          onCancel={() => setStep("form")}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 lg:grid-cols-2">
      <section>
        <h1 className="font-serif text-3xl">Carrito</h1>
        {items.length === 0 ? (
          <p className="mt-4 text-[#6D5E52]">No hay piezas todavía.</p>
        ) : (
          <ul className="mt-6 space-y-4">
            {items.map((item) => (
              <li key={item.productId} className="flex gap-4 border border-[#EADBCE] bg-white p-3">
                <div className="relative h-20 w-20 shrink-0 bg-[#F3EEE6]">
                  <Image src={item.imagePath} alt="" fill className="object-cover" />
                </div>
                <div className="flex-1">
                  <p className="font-serif text-lg">{item.name}</p>
                  <p className="text-sm text-[#6D5E52]">{formatMxn(item.priceMxn)}</p>
                  <input
                    type="number"
                    min={0}
                    value={item.quantity}
                    onChange={(e) => setQuantity(item.productId, Number(e.target.value))}
                    className="mt-2 w-16 border border-[#EADBCE] px-2 py-1 text-sm"
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <form onSubmit={onSubmit} className="space-y-4 border border-[#EADBCE] bg-white p-6">
        <h2 className="font-serif text-2xl">Confirmar pedido</h2>
        <p className="text-sm text-[#6D5E52]">
          Envío {formatMxn(SHIPPING_FEE)} · gratis desde {formatMxn(FREE_SHIPPING_THRESHOLD)}. Pagas con Mercado Pago
          (simulado).
        </p>
        <label className="block text-sm">
          Nombre
          <input required value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full border border-[#EADBCE] px-3 py-2" />
        </label>
        <label className="block text-sm">
          Correo
          <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full border border-[#EADBCE] px-3 py-2" />
        </label>
        <label className="block text-sm">
          WhatsApp
          <input required value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} className="mt-1 w-full border border-[#EADBCE] px-3 py-2" />
        </label>
        <label className="block text-sm">
          Dirección
          <textarea required value={address} onChange={(e) => setAddress(e.target.value)} className="mt-1 w-full border border-[#EADBCE] px-3 py-2" />
        </label>
        <label className="block text-sm">
          Notas
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="mt-1 w-full border border-[#EADBCE] px-3 py-2" />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={consecrate} onChange={(e) => setConsecrate(e.target.checked)} />
          Consagrar ({formatMxn(CONSECRATION_FEE)})
        </label>
        <p className="text-sm">Subtotal {formatMxn(subtotal)}</p>
        <p className="text-sm">Envío {formatMxn(shipping)}</p>
        <p className="text-sm">Total {formatMxn(total)}</p>
        <button disabled={busy || items.length === 0} className="w-full bg-[#009ee3] py-3 text-xs uppercase tracking-wider text-white disabled:opacity-50">
          Pagar con Mercado Pago
        </button>
        {message ? <p className="text-sm text-[#6D5E52]">{message}</p> : null}
      </form>
    </div>
  );
}
