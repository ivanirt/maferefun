"use client";

import { FormEvent, useEffect, useState } from "react";

export type SavedAddress = {
  id: string;
  label: string;
  line1: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  isDefault: boolean;
};

export type SavedPayment = {
  id: string;
  label: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  holder: string;
  isDefault: boolean;
};

export function WalletManager() {
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [payments, setPayments] = useState<SavedPayment[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  const [label, setLabel] = useState("Casa");
  const [line1, setLine1] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [phone, setPhone] = useState("");

  const [payLabel, setPayLabel] = useState("Tarjeta");
  const [holder, setHolder] = useState("");
  const [number, setNumber] = useState("");
  const [expMonth, setExpMonth] = useState("12");
  const [expYear, setExpYear] = useState("2028");

  async function load() {
    const res = await fetch("/api/account");
    if (!res.ok) return;
    const data = await res.json();
    setAddresses(data.addresses || []);
    setPayments(data.paymentMethods || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function addAddress(event: FormEvent) {
    event.preventDefault();
    const res = await fetch("/api/account/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        label,
        line1,
        city,
        state,
        zip,
        phone,
        isDefault: addresses.length === 0,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error);
      return;
    }
    setLine1("");
    setCity("");
    setState("");
    setZip("");
    setPhone("");
    setMessage(null);
    load();
  }

  async function addPayment(event: FormEvent) {
    event.preventDefault();
    const res = await fetch("/api/account/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        label: payLabel,
        holder,
        number,
        expMonth,
        expYear,
        isDefault: payments.length === 0,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error);
      return;
    }
    setHolder("");
    setNumber("");
    setMessage(null);
    load();
  }

  return (
    <div className="space-y-10">
      {message ? <p className="text-sm text-[#8B3A2A]">{message}</p> : null}

      <section>
        <h2 className="font-serif text-2xl">Domicilios</h2>
        <p className="mt-1 text-sm text-[#6D5E52]">Si tienes más de uno, elige cuál es el de envío por default.</p>
        <ul className="mt-4 space-y-3">
          {addresses.map((item) => (
            <li key={item.id} className="border border-[#EADBCE] bg-white p-4 text-sm">
              <p className="font-medium">
                {item.label}
                {item.isDefault ? " · default" : ""}
              </p>
              <p className="text-[#6D5E52]">
                {item.line1}, {item.city}, {item.state} {item.zip}
              </p>
              <p className="text-[#6D5E52]">Tel {item.phone}</p>
              <div className="mt-2 flex gap-3">
                {!item.isDefault ? (
                  <button
                    type="button"
                    className="text-xs uppercase tracking-wider"
                    onClick={async () => {
                      await fetch(`/api/account/addresses/${item.id}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ isDefault: true }),
                      });
                      load();
                    }}
                  >
                    Usar por default
                  </button>
                ) : null}
                <button
                  type="button"
                  className="text-xs uppercase tracking-wider"
                  onClick={async () => {
                    await fetch(`/api/account/addresses/${item.id}`, { method: "DELETE" });
                    load();
                  }}
                >
                  Quitar
                </button>
              </div>
            </li>
          ))}
        </ul>
        <form onSubmit={addAddress} className="mt-4 grid gap-3 border border-[#EADBCE] bg-white p-4 sm:grid-cols-2">
          <label className="block text-sm">
            Etiqueta
            <input value={label} onChange={(e) => setLabel(e.target.value)} className="mt-1 w-full border border-[#EADBCE] px-3 py-2" />
          </label>
          <label className="block text-sm sm:col-span-2">
            Calle y número
            <input required value={line1} onChange={(e) => setLine1(e.target.value)} className="mt-1 w-full border border-[#EADBCE] px-3 py-2" />
          </label>
          <label className="block text-sm">
            Ciudad
            <input required value={city} onChange={(e) => setCity(e.target.value)} className="mt-1 w-full border border-[#EADBCE] px-3 py-2" />
          </label>
          <label className="block text-sm">
            Estado
            <input required value={state} onChange={(e) => setState(e.target.value)} className="mt-1 w-full border border-[#EADBCE] px-3 py-2" />
          </label>
          <label className="block text-sm">
            CP
            <input required value={zip} onChange={(e) => setZip(e.target.value)} className="mt-1 w-full border border-[#EADBCE] px-3 py-2" />
          </label>
          <label className="block text-sm">
            Teléfono
            <input required value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 w-full border border-[#EADBCE] px-3 py-2" />
          </label>
          <button className="bg-[#241B16] px-4 py-2 text-xs uppercase tracking-wider text-[#FAF7F2] sm:col-span-2">
            Guardar domicilio
          </button>
        </form>
      </section>

      <section>
        <h2 className="font-serif text-2xl">Métodos de pago</h2>
        <p className="mt-1 text-sm text-[#6D5E52]">
          Guardamos marca, últimos 4 dígitos y vencimiento. No se guarda el número completo. Si hay más de uno, elige el default.
        </p>
        <ul className="mt-4 space-y-3">
          {payments.map((item) => (
            <li key={item.id} className="border border-[#EADBCE] bg-white p-4 text-sm">
              <p className="font-medium">
                {item.label} · {item.brand} ···{item.last4}
                {item.isDefault ? " · default" : ""}
              </p>
              <p className="text-[#6D5E52]">
                {item.holder} · {String(item.expMonth).padStart(2, "0")}/{item.expYear}
              </p>
              <div className="mt-2 flex gap-3">
                {!item.isDefault ? (
                  <button
                    type="button"
                    className="text-xs uppercase tracking-wider"
                    onClick={async () => {
                      await fetch(`/api/account/payments/${item.id}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ isDefault: true }),
                      });
                      load();
                    }}
                  >
                    Usar por default
                  </button>
                ) : null}
                <button
                  type="button"
                  className="text-xs uppercase tracking-wider"
                  onClick={async () => {
                    await fetch(`/api/account/payments/${item.id}`, { method: "DELETE" });
                    load();
                  }}
                >
                  Quitar
                </button>
              </div>
            </li>
          ))}
        </ul>
        <form onSubmit={addPayment} className="mt-4 grid gap-3 border border-[#EADBCE] bg-white p-4 sm:grid-cols-2">
          <label className="block text-sm">
            Etiqueta
            <input value={payLabel} onChange={(e) => setPayLabel(e.target.value)} className="mt-1 w-full border border-[#EADBCE] px-3 py-2" />
          </label>
          <label className="block text-sm">
            Titular
            <input required value={holder} onChange={(e) => setHolder(e.target.value)} className="mt-1 w-full border border-[#EADBCE] px-3 py-2" />
          </label>
          <label className="block text-sm sm:col-span-2">
            Número (simulado)
            <input required value={number} onChange={(e) => setNumber(e.target.value)} className="mt-1 w-full border border-[#EADBCE] px-3 py-2" />
          </label>
          <label className="block text-sm">
            Mes
            <input required value={expMonth} onChange={(e) => setExpMonth(e.target.value)} className="mt-1 w-full border border-[#EADBCE] px-3 py-2" />
          </label>
          <label className="block text-sm">
            Año
            <input required value={expYear} onChange={(e) => setExpYear(e.target.value)} className="mt-1 w-full border border-[#EADBCE] px-3 py-2" />
          </label>
          <button className="bg-[#241B16] px-4 py-2 text-xs uppercase tracking-wider text-[#FAF7F2] sm:col-span-2">
            Guardar método de pago
          </button>
        </form>
      </section>
    </div>
  );
}
