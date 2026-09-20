"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { readCart } from "@/lib/cart";

type NavUser = { role: string } | null;

export function Navbar() {
  const [count, setCount] = useState(0);
  const [user, setUser] = useState<NavUser>(null);

  useEffect(() => {
    const sync = () => setCount(readCart().reduce((sum, item) => sum + item.quantity, 0));
    sync();
    window.addEventListener("maferefun-cart", sync);
    window.addEventListener("storage", sync);
    fetch("/api/auth")
      .then((res) => res.json())
      .then((data) => setUser(data.user))
      .catch(() => setUser(null));
    return () => {
      window.removeEventListener("maferefun-cart", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const signedIn = Boolean(user);
  const admin = user?.role === "admin";

  return (
    <header className="border-b border-[#EADBCE] bg-[#FAF7F2]">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="font-serif text-xl text-[#241B16]">
          Botánica Maferefun
        </Link>
        <nav className="flex flex-wrap items-center gap-4 text-sm text-[#6D5E52]">
          <Link href="/">Catálogo</Link>
          <Link href="/noticias">Noticias</Link>
          <Link href="/blogs">Blogs</Link>
          <Link href="/tratados">Tratados</Link>
          <Link href="/consultas">Consultas</Link>
          <Link href="/pedido">Pedido</Link>
          {signedIn ? <Link href="/panel">Mi cuenta</Link> : <Link href="/acceso">Entrar</Link>}
          {admin ? <Link href="/config/productos">Configuración</Link> : null}
          <Link href="/carrito" className="text-[#241B16]">
            Carrito{count ? ` (${count})` : ""}
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-[#EADBCE] bg-[#FAF7F2]">
      <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-[#6D5E52]">
        <p>Botánica Maferefun. Artículos de Osha e Ifá. Puedes ver y comprar como invitado.</p>
      </div>
    </footer>
  );
}
