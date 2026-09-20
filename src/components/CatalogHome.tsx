"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { addToCart } from "@/lib/cart";
import { formatMxn } from "@/lib/shipping";
import { ProductCarousel } from "@/components/ProductCarousel";
import { PostCarousel } from "@/components/PostCarousel";
import { ProductCard } from "@/components/ProductCard";
import { SalePrice } from "@/components/SalePrice";

export type CatalogProduct = {
  id: string;
  slug: string;
  name: string;
  category: string;
  orisha: string;
  description: string;
  priceMxn: number;
  compareAtMxn: number | null;
  imagePath: string;
  images: string[];
  stock: number;
};

export type CatalogPackage = {
  id: string;
  slug: string;
  name: string;
  description: string;
  priceMxn: number;
  compareAtMxn: number | null;
  imagePath: string;
  items: { name: string; quantity: number; unitPrice: number; listPrice: number }[];
};

export type CatalogNews = {
  slug: string;
  title: string;
  body: string;
  createdAt: string;
  href: string;
};

export function CatalogHome({
  products,
  packages,
  news,
  blogs,
  featured,
  featuredTitle,
}: {
  products: CatalogProduct[];
  packages: CatalogPackage[];
  news: CatalogNews[];
  blogs: CatalogNews[];
  featured: CatalogProduct[];
  featuredTitle: string;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todos");
  const [added, setAdded] = useState<string | null>(null);

  const categories = [
    "Todos",
    ...Array.from(new Set(products.map((p) => p.category))),
    ...(packages.length ? ["Paquetes"] : []),
  ];

  const filteredProducts = useMemo(() => {
    if (category === "Paquetes") return [];
    return products.filter((product) => {
      const matchesCategory = category === "Todos" || product.category === category;
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q || product.name.toLowerCase().includes(q) || product.orisha.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [products, category, query]);

  const filteredPackages = useMemo(() => {
    if (category !== "Todos" && category !== "Paquetes") return [];
    const q = query.trim().toLowerCase();
    return packages.filter((pack) => !q || pack.name.toLowerCase().includes(q));
  }, [packages, category, query]);

  return (
    <div>
      <section className="relative h-[260px] overflow-hidden border-b border-[#EADBCE] sm:h-[300px]">
        <Image
          src="/banner/banner-ifa-soperas-v8.png"
          alt=""
          fill
          priority
          className="object-cover object-[75%_78%]"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0C0907]/50 via-[#0C0907]/15 to-transparent" />
        <div className="relative mx-auto flex h-full max-w-6xl items-center px-4">
          <div className="max-w-xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#F7F1E6] [text-shadow:0_1px_10px_rgba(12,9,7,0.95)]">
              Catálogo
            </p>
            <h1 className="mt-1.5 max-w-[18ch] font-serif text-[1.85rem] font-semibold leading-[1.12] tracking-tight text-[#F7F1E6] [text-shadow:0_2px_16px_rgba(12,9,7,0.95)] sm:text-4xl">
              Artículos de Osha e Ifá, con respeto y oficio
            </h1>
            <p className="mt-2 max-w-[40ch] text-sm font-medium leading-snug text-[#F3EEE6] [text-shadow:0_1px_10px_rgba(12,9,7,0.95)] sm:text-base">
              Collares, mazos y paquetes. Puedes ver y comprar sin cuenta. Si lo pides, lo consagramos antes de enviarlo.
            </p>
          </div>
        </div>
      </section>

      <section className="border-b border-[#EADBCE]">
        <div className="mx-auto grid max-w-6xl lg:grid-cols-2">
          <div className="border-b border-[#EADBCE] lg:border-b-0 lg:border-r">
            <PostCarousel
              title="Noticias"
              items={news}
              allHref="/noticias"
              empty="Pronto publicamos avisos de la casa."
            />
          </div>
          <div>
            <PostCarousel title="Blogs" items={blogs} allHref="/blogs" empty="Aún no hay notas nuevas." />
          </div>
        </div>
      </section>

      <ProductCarousel title={featuredTitle} products={featured} />

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
          {filteredPackages.map((pack) => (
            <article key={pack.id} className="border border-[#EADBCE] bg-white">
              <div className="relative aspect-square bg-[#F3EEE6]">
                {pack.imagePath ? (
                  <Image src={pack.imagePath} alt={pack.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
                ) : null}
              </div>
              <div className="space-y-2 p-4">
                <p className="text-xs uppercase tracking-wider text-[#6D5E52]">Paquete</p>
                <h2 className="font-serif text-xl text-[#241B16]">{pack.name}</h2>
                <p className="text-sm text-[#6D5E52]">{pack.description}</p>
                <ul className="text-xs text-[#6D5E52]">
                  {pack.items.map((item) => (
                    <li key={item.name}>
                      {item.quantity} × {item.name} · {formatMxn(item.unitPrice)}
                      {item.unitPrice !== item.listPrice ? ` (lista ${formatMxn(item.listPrice)})` : ""}
                    </li>
                  ))}
                </ul>
                <SalePrice priceMxn={pack.priceMxn} compareAtMxn={pack.compareAtMxn} />
                <button
                  type="button"
                  className="w-full bg-[#241B16] py-2.5 text-xs uppercase tracking-wider text-[#FAF7F2]"
                  onClick={() => {
                    addToCart({
                      key: `package:${pack.id}`,
                      kind: "package",
                      packageId: pack.id,
                      slug: pack.slug,
                      name: pack.name,
                      priceMxn: pack.priceMxn,
                      compareAtMxn: pack.compareAtMxn,
                      imagePath: pack.imagePath,
                    });
                    setAdded(pack.id);
                    setTimeout(() => setAdded(null), 1500);
                  }}
                >
                  {added === pack.id ? "Añadido" : "Añadir paquete"}
                </button>
              </div>
            </article>
          ))}
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
