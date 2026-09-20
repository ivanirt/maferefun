"use client";

import { FormEvent, useState } from "react";

export default function AccesoPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [label, setLabel] = useState("Casa");
  const [line1, setLine1] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [phone, setPhone] = useState("");
  const [holder, setHolder] = useState("");
  const [number, setNumber] = useState("");
  const [expMonth, setExpMonth] = useState("12");
  const [expYear, setExpYear] = useState("2028");
  const [status, setStatus] = useState<string | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const payload: Record<string, unknown> = { action: mode, name, email, password, whatsapp };
    if (mode === "register") {
      if (line1 && city && state && zip && phone) {
        payload.address = { label, line1, city, state, zip, phone };
      }
      if (holder && number) {
        payload.payment = { holder, number, expMonth, expYear, label: "Tarjeta" };
      }
    }
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      setStatus(data.error || "No se pudo entrar.");
      return;
    }
    window.location.href = data.role === "admin" ? "/config/productos" : "/panel";
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="font-serif text-4xl">{mode === "login" ? "Entrar" : "Crear cuenta"}</h1>
      <p className="mt-2 text-sm text-[#6D5E52]">
        {mode === "login"
          ? "Usuario o correo. Invitado puede comprar sin cuenta."
          : "Puedes guardar un domicilio y un método de pago desde ahora. Si más tarde tienes varios, eliges uno por default."}
      </p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        {mode === "register" ? (
          <label className="block text-sm">
            Nombre
            <input required value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full border border-[#EADBCE] bg-white px-3 py-2" />
          </label>
        ) : null}
        <label className="block text-sm">
          Usuario o correo
          <input required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full border border-[#EADBCE] bg-white px-3 py-2" />
        </label>
        <label className="block text-sm">
          Contraseña
          <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full border border-[#EADBCE] bg-white px-3 py-2" />
        </label>
        {mode === "register" ? (
          <>
            <label className="block text-sm">
              WhatsApp
              <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} className="mt-1 w-full border border-[#EADBCE] bg-white px-3 py-2" />
            </label>
            <fieldset className="space-y-3 border border-[#EADBCE] p-4">
              <legend className="px-1 text-sm">Domicilio (opcional)</legend>
              <input placeholder="Etiqueta" value={label} onChange={(e) => setLabel(e.target.value)} className="w-full border border-[#EADBCE] px-3 py-2 text-sm" />
              <input placeholder="Calle y número" value={line1} onChange={(e) => setLine1(e.target.value)} className="w-full border border-[#EADBCE] px-3 py-2 text-sm" />
              <input placeholder="Ciudad" value={city} onChange={(e) => setCity(e.target.value)} className="w-full border border-[#EADBCE] px-3 py-2 text-sm" />
              <input placeholder="Estado" value={state} onChange={(e) => setState(e.target.value)} className="w-full border border-[#EADBCE] px-3 py-2 text-sm" />
              <input placeholder="CP" value={zip} onChange={(e) => setZip(e.target.value)} className="w-full border border-[#EADBCE] px-3 py-2 text-sm" />
              <input placeholder="Teléfono" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full border border-[#EADBCE] px-3 py-2 text-sm" />
            </fieldset>
            <fieldset className="space-y-3 border border-[#EADBCE] p-4">
              <legend className="px-1 text-sm">Método de pago (opcional, simulado)</legend>
              <input placeholder="Titular" value={holder} onChange={(e) => setHolder(e.target.value)} className="w-full border border-[#EADBCE] px-3 py-2 text-sm" />
              <input placeholder="Número de tarjeta" value={number} onChange={(e) => setNumber(e.target.value)} className="w-full border border-[#EADBCE] px-3 py-2 text-sm" />
              <div className="grid grid-cols-2 gap-2">
                <input placeholder="Mes" value={expMonth} onChange={(e) => setExpMonth(e.target.value)} className="border border-[#EADBCE] px-3 py-2 text-sm" />
                <input placeholder="Año" value={expYear} onChange={(e) => setExpYear(e.target.value)} className="border border-[#EADBCE] px-3 py-2 text-sm" />
              </div>
            </fieldset>
          </>
        ) : null}
        <button className="w-full bg-[#241B16] py-3 text-xs uppercase tracking-wider text-[#FAF7F2]">
          {mode === "login" ? "Entrar" : "Registrarme"}
        </button>
        <button
          type="button"
          className="w-full text-sm text-[#6D5E52]"
          onClick={() => setMode(mode === "login" ? "register" : "login")}
        >
          {mode === "login" ? "Crear cuenta" : "Ya tengo cuenta"}
        </button>
        {status ? <p className="text-sm text-[#6D5E52]">{status}</p> : null}
      </form>
    </div>
  );
}
