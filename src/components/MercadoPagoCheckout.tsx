"use client";

import { FormEvent, useState } from "react";
import { formatMxn } from "@/lib/shipping";

export function MercadoPagoCheckout({
  amount,
  email,
  onPaid,
  onCancel,
}: {
  amount: number;
  email: string;
  onPaid: (paymentId: string) => void;
  onCancel: () => void;
}) {
  const [busy, setBusy] = useState(false);

  async function pay(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    await new Promise((resolve) => setTimeout(resolve, 900));
    const paymentId = `MP-SIM-${Date.now().toString(36).toUpperCase()}`;
    onPaid(paymentId);
  }

  return (
    <div className="mx-auto max-w-md border border-[#cfd8dc] bg-white shadow-sm">
      <div className="bg-[#009ee3] px-5 py-4 text-white">
        <p className="text-sm font-semibold tracking-wide">mercado pago</p>
        <p className="mt-1 text-xs text-white/80">Simulación de pago · no se cobra de verdad</p>
      </div>
      <form onSubmit={pay} className="space-y-4 p-5">
        <div>
          <p className="text-xs text-[#757575]">Pagas a Botánica Maferefun</p>
          <p className="text-2xl font-semibold text-[#333]">{formatMxn(amount)}</p>
        </div>
        <label className="block text-sm text-[#333]">
          Correo
          <input readOnly value={email} className="mt-1 w-full border border-[#cfd8dc] bg-[#f5f5f5] px-3 py-2" />
        </label>
        <label className="block text-sm text-[#333]">
          Número de tarjeta
          <input required placeholder="ACCT-000030" className="mt-1 w-full border border-[#cfd8dc] px-3 py-2" />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm text-[#333]">
            Vence
            <input required placeholder="11/30" className="mt-1 w-full border border-[#cfd8dc] px-3 py-2" />
          </label>
          <label className="block text-sm text-[#333]">
            CVV
            <input required placeholder="123" className="mt-1 w-full border border-[#cfd8dc] px-3 py-2" />
          </label>
        </div>
        <label className="block text-sm text-[#333]">
          Nombre en la tarjeta
          <input required placeholder="Como aparece en la tarjeta" className="mt-1 w-full border border-[#cfd8dc] px-3 py-2" />
        </label>
        <button
          disabled={busy}
          className="w-full bg-[#009ee3] py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {busy ? "Procesando…" : `Pagar ${formatMxn(amount)}`}
        </button>
        <button type="button" onClick={onCancel} className="w-full py-2 text-sm text-[#009ee3]">
          Volver al pedido
        </button>
      </form>
    </div>
  );
}
