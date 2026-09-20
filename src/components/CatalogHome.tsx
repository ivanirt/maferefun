"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { addToCart } from "@/lib/cart";
import { formatMxn } from "@/lib/shipping";

export type CatalogProduct = {
  id: string;
  slug: string;
  name: string;
  category: string;
  orisha: string;
  description: string;
  priceMxn: number;
  imagePath: string;
};

export function CatalogHome({ products }: { products: CatalogProduct[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todos");
  const [added, setAdded] = useState<string | null>(null);

  const categories = ["Todos", ...Array.from(new Set(products.map((p) => p.category)))];

  const filtered = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory = category === "Todos" || product.category === category;
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        product.name.toLowerCase().includes(q) ||
        product.orisha.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [products, category, query]);

  return (
    <div>
      <section className="border-b border-[#EADBCE] px-4 py-12">
        <div className="mx-auto max-w-6xl">
          <h1 className="font-serif text-4xl text-[#241B16] sm:text-5xl">
            Artículos de Osha e Ifá, con respeto y oficio
          </h1>
          <p className="mt-4 max-w-xl text-[#6D5E52]">
            Collares y mazos. Si lo pides, lo consagramos antes de enviarlo.
          </p>
        </div>
      </section>

      <section id="catalogo" className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-6 flex flex-wrap gap-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar"
            className="w-full max-w-xs border border-[#EADBCE] bg-white px-3 py-2 text-sm"
          />
          {categories.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setCategory(item)}
              className={`px-3 py-2 text-xs uppercase tracking-wider ${
                category === item ? "bg-[#241B16] text-[#FAF7F2]" : "border border-[#EADBCE] text-[#6D5E52]"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((product) => (
            <article key={product.id} className="border border-[#EADBCE] bg-white">
              <div className="relative aspect-square bg-[#F3EEE6]">
                <Image
                  src={product.imagePath}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="space-y-2 p-4">
                <p className="text-xs uppercase tracking-wider text-[#6D5E52]">{product.orisha}</p>
                <h2 className="font-serif text-xl text-[#241B16]">{product.name}</h2>
                <p className="text-sm text-[#6D5E52]">{product.description}</p>
                <p className="text-sm text-[#241B16]">{formatMxn(product.priceMxn)}</p>
                <button
                  type="button"
                  className="w-full bg-[#241B16] py-2.5 text-xs uppercase tracking-wider text-[#FAF7F2]"
                  onClick={() => {
                    addToCart({
                      productId: product.id,
                      slug: product.slug,
                      name: product.name,
                      priceMxn: product.priceMxn,
                      imagePath: product.imagePath,
                    });
                    setAdded(product.id);
                    setTimeout(() => setAdded(null), 1500);
                  }}
                >
                  {added === product.id ? "Añadido" : "Añadir al carrito"}
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
