"use client";

import { FormEvent, useState } from "react";

export default function AccesoPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: mode, name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      setStatus(data.error || "No se pudo entrar.");
      return;
    }
    window.location.href = "/panel";
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="font-serif text-4xl">{mode === "login" ? "Entrar" : "Crear cuenta"}</h1>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        {mode === "register" ? (
          <label className="block text-sm">
            Nombre
            <input required value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full border border-[#EADBCE] bg-white px-3 py-2" />
          </label>
        ) : null}
        <label className="block text-sm">
          Correo
          <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full border border-[#EADBCE] bg-white px-3 py-2" />
        </label>
        <label className="block text-sm">
          Contraseña
          <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full border border-[#EADBCE] bg-white px-3 py-2" />
        </label>
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
