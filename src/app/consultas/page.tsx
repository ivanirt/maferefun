"use client";

import { FormEvent, useState } from "react";

export default function ConsultasPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [kind, setKind] = useState("Diloggún");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const res = await fetch("/api/consultas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, whatsapp, kind, message }),
    });
    const data = await res.json();
    setStatus(res.ok ? "Solicitud recibida. Te escribimos para confirmar." : data.error || "No se pudo enviar.");
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <h1 className="font-serif text-4xl">Consultas</h1>
      <p className="mt-3 text-[#6D5E52]">Diloggún, Ifá o misa. Pedimos tus datos y confirmamos por WhatsApp.</p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <label className="block text-sm">
          Nombre
          <input required value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full border border-[#EADBCE] bg-white px-3 py-2" />
        </label>
        <label className="block text-sm">
          Correo
          <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full border border-[#EADBCE] bg-white px-3 py-2" />
        </label>
        <label className="block text-sm">
          WhatsApp
          <input required value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} className="mt-1 w-full border border-[#EADBCE] bg-white px-3 py-2" />
        </label>
        <label className="block text-sm">
          Tipo
          <select value={kind} onChange={(e) => setKind(e.target.value)} className="mt-1 w-full border border-[#EADBCE] bg-white px-3 py-2">
            <option>Diloggún</option>
            <option>Ifá</option>
            <option>Misa</option>
          </select>
        </label>
        <label className="block text-sm">
          Motivo
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} className="mt-1 w-full border border-[#EADBCE] bg-white px-3 py-2" />
        </label>
        <button className="w-full bg-[#241B16] py-3 text-xs uppercase tracking-wider text-[#FAF7F2]">Pedir consulta</button>
        {status ? <p className="text-sm text-[#6D5E52]">{status}</p> : null}
      </form>
    </div>
  );
}
