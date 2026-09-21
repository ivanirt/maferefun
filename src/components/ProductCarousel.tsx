"use client";

import { useEffect, useState } from "react";
import type { CatalogProduct } from "@/components/CatalogHome";
import { ProductCard } from "@/components/ProductCard";

export function ProductCarousel({ title, products }: { title: string; products: CatalogProduct[] }) {
  const [paused, setPaused] = useState(false);
  const [start, setStart] = useState(0);
  const [visible, setVisible] = useState(3);

  useEffect(() => {
    function update() {
      if (window.innerWidth < 640) setVisible(1);
      else if (window.innerWidth < 1024) setVisible(2);
      else setVisible(3);
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  function move(dir: number) {
    if (products.length < 2) return;
    setStart((current) => (current + dir + products.length) % products.length);
  }

  useEffect(() => {
    if (products.length < 2 || paused) return;
    const timer = window.setInterval(() => move(1), 4000);
    return () => window.clearInterval(timer);
  }, [products.length, paused]);

  if (!products.length) return null;

  const count = Math.min(visible, products.length);
  const slides = Array.from({ length: count }, (_, i) => products[(start + i) % products.length]);

  return (
    <section className="mx-auto max-w-6xl px-4 py-8">
      <h2 className="mb-4 font-serif text-2xl">{title}</h2>
      <div className="relative" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
        <button
          type="button"
          onClick={() => move(-1)}
          className="absolute left-0 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 border border-[#EADBCE] bg-white px-3 py-10 text-2xl text-[#241B16] shadow-sm"
          aria-label="Anterior"
        >
          ‹
        </button>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {slides.map((product, index) => (
            <ProductCard
              key={`${product.id}-${start}-${index}`}
              product={product}
              className="border border-[#EADBCE] bg-white"
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => move(1)}
          className="absolute right-0 top-1/2 z-20 translate-x-1/2 -translate-y-1/2 border border-[#EADBCE] bg-white px-3 py-10 text-2xl text-[#241B16] shadow-sm"
          aria-label="Siguiente"
        >
          ›
        </button>
      </div>
    </section>
  );
}
