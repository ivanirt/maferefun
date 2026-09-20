"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { formatMxn } from "@/lib/shipping";

export type ProductEditorData = {
  id: string;
  name: string;
  category: string;
  orisha: string;
  description: string;
  priceMxn: number;
  stock: number;
  minStock: number;
  enabled: boolean;
  images: string[];
  offers: { id: string; priceMxn: number; startsAt: string; endsAt: string }[];
  hasTransactions: boolean;
};

export function ProductEditor({ product }: { product?: ProductEditorData }) {
  const router = useRouter();
  const [name, setName] = useState(product?.name || "");
  const [category, setCategory] = useState(product?.category || "Collar");
  const [orisha, setOrisha] = useState(product?.orisha || "");
  const [description, setDescription] = useState(product?.description || "");
  const [priceMxn, setPriceMxn] = useState(product?.priceMxn ?? 13);
  const [stock, setStock] = useState(product?.stock ?? 0);
  const [minStock, setMinStock] = useState(product?.minStock ?? 1);
  const [enabled, setEnabled] = useState(product?.enabled ?? true);
  const [images, setImages] = useState<string[]>(product?.images || []);
  const [offers, setOffers] = useState(product?.offers || []);
  const [offerPrice, setOfferPrice] = useState(0);
  const [offerStart, setOfferStart] = useState("");
  const [offerEnd, setOfferEnd] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function persistImages(next: string[]) {
    if (!product) return;
    const res = await fetch(`/api/admin/products/${product.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ images: next }),
    });
    if (!res.ok) {
      const data = await res.json();
      setMessage(data.error || "No se pudieron guardar las fotos.");
    }
  }

  async function upload(files: FileList | null, input: HTMLInputElement) {
    if (!files?.length) return;
    setUploading(true);
    setMessage(null);
    try {
      const form = new FormData();
      for (const file of Array.from(files)) form.append("files", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || "No se pudieron subir las fotos.");
        return;
      }
      const next = [...images, ...(data.paths as string[])];
      setImages(next);
      await persistImages(next);
    } finally {
      input.value = "";
      setUploading(false);
    }
  }

  function moveImage(index: number, dir: number) {
    const target = index + dir;
    if (target < 0 || target >= images.length) return;
    const next = [...images];
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item);
    setImages(next);
    void persistImages(next);
  }

  function removeImage(path: string, index: number) {
    const next = images.filter((_, i) => i !== index);
    setImages(next);
    void persistImages(next);
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      const payload = { name, category, orisha, description, priceMxn, stock, minStock, enabled, images };
      const res = await fetch(product ? `/api/admin/products/${product.id}` : "/api/admin/products", {
        method: product ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || "No se pudo guardar.");
        return;
      }
      router.push(`/config/productos/${data.product.id}`);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function addOffer() {
    if (!product) return;
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/products/${product.id}/offers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceMxn: offerPrice, startsAt: offerStart, endsAt: offerEnd }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || "No se pudo crear la oferta.");
        return;
      }
      setOffers((current) => [
        {
          id: data.offer.id,
          priceMxn: data.offer.priceMxn,
          startsAt: offerStart,
          endsAt: offerEnd,
        },
        ...current,
      ]);
      setOfferPrice(0);
      setOfferStart("");
      setOfferEnd("");
    } finally {
      setBusy(false);
    }
  }

  async function removeOffer(id: string) {
    const res = await fetch(`/api/admin/offers/${id}`, { method: "DELETE" });
    if (res.ok) setOffers((current) => current.filter((offer) => offer.id !== id));
  }

  async function disable() {
    if (!product) return;
    await fetch(`/api/admin/products/${product.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: !enabled }),
    });
    setEnabled(!enabled);
    router.refresh();
  }

  async function remove() {
    if (!product) return;
    const res = await fetch(`/api/admin/products/${product.id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error || "No se pudo borrar.");
      return;
    }
    router.push("/config/productos");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-4">
        <h2 className="font-serif text-2xl">{product ? "Detalle del artículo" : "Nuevo artículo"}</h2>
        <label className="block text-sm">
          Nombre
          <input required value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full border border-[#EADBCE] px-3 py-2" />
        </label>
        <label className="block text-sm">
          Categoría
          <input value={category} onChange={(e) => setCategory(e.target.value)} className="mt-1 w-full border border-[#EADBCE] px-3 py-2" />
        </label>
        <label className="block text-sm">
          Orisha
          <input value={orisha} onChange={(e) => setOrisha(e.target.value)} className="mt-1 w-full border border-[#EADBCE] px-3 py-2" />
        </label>
        <label className="block text-sm">
          Descripción
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 w-full border border-[#EADBCE] px-3 py-2" />
        </label>
        <label className="block text-sm">
          Precio unitario (MXN)
          <input type="number" min={0} value={priceMxn} onChange={(e) => setPriceMxn(Number(e.target.value))} className="mt-1 w-full border border-[#EADBCE] px-3 py-2" />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm">
            Inventario
            <input type="number" min={0} value={stock} onChange={(e) => setStock(Number(e.target.value))} className="mt-1 w-full border border-[#EADBCE] px-3 py-2" />
          </label>
          <label className="block text-sm">
            Mínimo
            <input type="number" min={0} value={minStock} onChange={(e) => setMinStock(Number(e.target.value))} className="mt-1 w-full border border-[#EADBCE] px-3 py-2" />
          </label>
        </div>
        <button disabled={busy} className="bg-[#241B16] px-4 py-2 text-xs uppercase tracking-wider text-[#FAF7F2]">
          {product ? "Guardar cambios" : "Crear artículo"}
        </button>
        {product ? (
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={disable} className="border border-[#EADBCE] px-4 py-2 text-xs uppercase tracking-wider">
              {enabled ? "Deshabilitar" : "Habilitar"}
            </button>
            <button
              type="button"
              onClick={remove}
              disabled={product.hasTransactions}
              className="border border-[#EADBCE] px-4 py-2 text-xs uppercase tracking-wider disabled:opacity-40"
            >
              Borrar
            </button>
          </div>
        ) : null}
        {product?.hasTransactions ? (
          <p className="text-sm text-[#6D5E52]">Este artículo ya tiene transacciones; no se puede borrar, solo deshabilitar.</p>
        ) : null}
        {message ? <p className="text-sm text-[#8B3A2A]">{message}</p> : null}
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="font-serif text-xl">Fotos</h3>
          <p className="mt-1 text-sm text-[#6D5E52]">
            Puedes añadir varias. La primera es la del catálogo.
            {product ? " Se guardan al subirlas." : " Se guardan al crear el artículo."}
          </p>
          <label className="mt-3 inline-block cursor-pointer bg-[#241B16] px-4 py-2 text-xs uppercase tracking-wider text-[#FAF7F2]">
            {uploading ? "Subiendo…" : "Añadir fotos"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              className="sr-only"
              disabled={uploading}
              onClick={(event) => event.stopPropagation()}
              onChange={(event) => {
                event.stopPropagation();
                void upload(event.target.files, event.target);
              }}
            />
          </label>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {images.map((path, index) => (
              <div key={`${path}-${index}`} className="relative aspect-square border border-[#EADBCE] bg-[#F3EEE6]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={path} alt="" className="h-full w-full object-cover" />
                {index === 0 ? (
                  <span className="absolute left-1 top-1 bg-white/90 px-2 py-1 text-[10px] uppercase tracking-wider">Principal</span>
                ) : null}
                <div className="absolute right-1 top-1 flex gap-1">
                  <button type="button" className="bg-white/90 px-2 py-1 text-xs" disabled={index === 0} onClick={() => moveImage(index, -1)}>
                    ↑
                  </button>
                  <button type="button" className="bg-white/90 px-2 py-1 text-xs" disabled={index === images.length - 1} onClick={() => moveImage(index, 1)}>
                    ↓
                  </button>
                  <button type="button" className="bg-white/90 px-2 py-1 text-xs" onClick={() => removeImage(path, index)}>
                    Quitar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {product ? (
          <div className="border border-[#EADBCE] bg-white p-4">
            <h3 className="font-serif text-xl">Ofertas temporales</h3>
            <div className="mt-3 grid gap-2 text-sm">
              <input type="number" min={0} placeholder="Precio oferta" value={offerPrice || ""} onChange={(e) => setOfferPrice(Number(e.target.value))} className="border border-[#EADBCE] px-3 py-2" />
              <input type="datetime-local" value={offerStart} onChange={(e) => setOfferStart(e.target.value)} className="border border-[#EADBCE] px-3 py-2" />
              <input type="datetime-local" value={offerEnd} onChange={(e) => setOfferEnd(e.target.value)} className="border border-[#EADBCE] px-3 py-2" />
              <button type="button" onClick={addOffer} className="border border-[#EADBCE] py-2 text-xs uppercase tracking-wider">
                Añadir oferta
              </button>
            </div>
            <ul className="mt-4 space-y-2 text-sm">
              {offers.map((offer) => (
                <li key={offer.id} className="flex items-center justify-between gap-2 border-t border-[#EADBCE] pt-2">
                  <span>
                    {formatMxn(offer.priceMxn)} · {offer.startsAt.replace("T", " ")} → {offer.endsAt.replace("T", " ")}
                  </span>
                  <button type="button" onClick={() => removeOffer(offer.id)} className="text-xs uppercase tracking-wider">
                    Quitar
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-sm text-[#6D5E52]">Guarda el artículo para poder añadir ofertas temporales.</p>
        )}
      </div>
    </form>
  );
}
