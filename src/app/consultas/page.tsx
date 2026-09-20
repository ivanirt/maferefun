"use client";

import { FormEvent, useState } from "react";
import { ConsultaWeekPicker } from "@/components/ConsultaWeekPicker";
import { modalityLabel, MODALITIES } from "@/lib/consultas";
import { isValidEmail, isValidPhone } from "@/lib/validate";

export default function ConsultasPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [kind, setKind] = useState("IFA Registro");
  const [modality, setModality] = useState("en_linea");
  const [slot, setSlot] = useState<{ date: string; startTime: string } | null>(null);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ name?: string; email?: string; whatsapp?: string }>({});

  function validateFields() {
    const next: { name?: string; email?: string; whatsapp?: string } = {};
    if (!name.trim()) next.name = "El nombre es necesario.";
    if (!whatsapp.trim()) next.whatsapp = "El WhatsApp es necesario.";
    else if (!isValidPhone(whatsapp)) next.whatsapp = "Ese teléfono no es válido. Usa 10 dígitos o incluye la lada.";
    if (!email.trim()) next.email = "El correo es necesario.";
    else if (!isValidEmail(email)) next.email = "Ese correo no es válido.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!validateFields()) {
      setStatus(null);
      return;
    }
    if (!slot) {
      setStatus("Elige fecha y hora en el calendario.");
      return;
    }
    const res = await fetch("/api/consultas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        whatsapp,
        kind,
        modality,
        date: slot.date,
        startTime: slot.startTime,
        message,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setStatus("Solicitud recibida. Te escribimos para confirmar.");
      setSlot(null);
      return;
    }
    setStatus(data.error || "No se pudo enviar.");
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="font-serif text-4xl">Consultas</h1>
      <p className="mt-3 text-[#6D5E52]">
        IFA Registro u Otro. Elige si es en línea o presencial, y toma una hora libre.
      </p>
      <form noValidate onSubmit={onSubmit} className="mt-8 space-y-4">
        <label className="block text-sm">
          Nombre
          <input
            required
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full border border-[#EADBCE] bg-white px-3 py-2"
          />
          {errors.name ? <span className="mt-1 block text-xs text-[#8B3A2A]">{errors.name}</span> : null}
        </label>
        <label className="block text-sm">
          Correo
          <input
            required
            type="email"
            autoComplete="email"
            inputMode="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full border border-[#EADBCE] bg-white px-3 py-2"
          />
          {errors.email ? <span className="mt-1 block text-xs text-[#8B3A2A]">{errors.email}</span> : null}
        </label>
        <label className="block text-sm">
          WhatsApp
          <input
            required
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            placeholder="55 1234 5678 o +52 55 1234 5678"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            className="mt-1 w-full border border-[#EADBCE] bg-white px-3 py-2"
          />
          {errors.whatsapp ? <span className="mt-1 block text-xs text-[#8B3A2A]">{errors.whatsapp}</span> : null}
        </label>
        <label className="block text-sm">
          Tipo
          <select value={kind} onChange={(e) => setKind(e.target.value)} className="mt-1 w-full border border-[#EADBCE] bg-white px-3 py-2">
            <option>IFA Registro</option>
            <option>Otro</option>
          </select>
        </label>
        <fieldset className="text-sm">
          <legend>Modalidad</legend>
          <div className="mt-2 flex gap-4">
            {MODALITIES.map((item) => (
              <label key={item.id} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="modality"
                  value={item.id}
                  checked={modality === item.id}
                  onChange={() => {
                    setModality(item.id);
                    setSlot(null);
                  }}
                />
                {item.label}
              </label>
            ))}
          </div>
        </fieldset>
        <div>
          <p className="text-sm">Fecha y hora — {modalityLabel(modality)}</p>
          <div className="mt-2">
            <ConsultaWeekPicker modality={modality} selected={slot} onSelect={setSlot} />
          </div>
        </div>
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
