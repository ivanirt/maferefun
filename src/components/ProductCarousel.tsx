"use client";

import { useEffect, useRef, useState } from "react";
import { addToCart } from "@/lib/cart";
import type { CatalogProduct } from "@/components/CatalogHome";
import { ProductPhotos } from "@/components/ProductPhotos";
import { SalePrice } from "@/components/SalePrice";

const CARD_WIDTH = 336;
const IMAGE_HEIGHT = 246;
const GAP = 16;
const STEP = CARD_WIDTH + GAP;

export function ProductCarousel({ title, products }: { title: string; products: CatalogProduct[] }) {
  const scroller = useRef<HTMLDivElement>(null);
  const [added, setAdded] = useState<string | null>(null);
  const [paused, setPaused] = useState(false);
  if (!products.length) return null;

  function scroll(dir: number) {
    const node = scroller.current;
    if (!node) return;
    const max = node.scrollWidth - node.clientWidth;
    if (max <= 0) return;
    const next = node.scrollLeft + dir * STEP;
    if (next > max - 8) {
      node.scrollTo({ left: 0, behavior: "smooth" });
      return;
    }
    if (next < 0) {
      node.scrollTo({ left: max, behavior: "smooth" });
      return;
    }
    node.scrollBy({ left: dir * STEP, behavior: "smooth" });
  }

  useEffect(() => {
    if (products.length < 2 || paused) return;
    const timer = window.setInterval(() => scroll(1), 4000);
    return () => window.clearInterval(timer);
  }, [products.length, paused]);

  return (
    <section className="mx-auto max-w-6xl px-4 py-8">
      <h2 className="mb-4 font-serif text-2xl">{title}</h2>
      <div
        className="relative"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <button
          type="button"
          onClick={() => scroll(-1)}
          className="absolute left-0 top-[123px] z-10 -translate-x-1/2 -translate-y-1/2 border border-[#EADBCE] bg-white/95 px-3 py-6 text-xl text-[#241B16] shadow-sm"
          aria-label="Anterior"
        >
          ‹
        </button>
        <button
          type="button"
          onClick={() => scroll(1)}
          className="absolute right-0 top-[123px] z-10 translate-x-1/2 -translate-y-1/2 border border-[#EADBCE] bg-white/95 px-3 py-6 text-xl text-[#241B16] shadow-sm"
          aria-label="Siguiente"
        >
          ›
        </button>
        <div
          ref={scroller}
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {products.map((product) => (
            <article
              key={product.id}
              className="shrink-0 snap-start border border-[#EADBCE] bg-white"
              style={{ width: CARD_WIDTH }}
            >
              <ProductPhotos
                paths={product.images.length ? product.images : [product.imagePath]}
                alt={product.name}
                sizes="336px"
                className="relative bg-[#E8DFD0]"
                style={{ height: IMAGE_HEIGHT }}
              />
              <div className="space-y-2 p-3">
                <p className="font-serif text-[#241B16]">{product.name}</p>
                <SalePrice priceMxn={product.priceMxn} compareAtMxn={product.compareAtMxn} />
                <button
                  type="button"
                  disabled={product.stock < 1}
                  className="w-full bg-[#241B16] py-2 text-xs uppercase tracking-wider text-[#FAF7F2] disabled:opacity-40"
                  onClick={() => {
                    addToCart({
                      key: `product:${product.id}`,
                      kind: "product",
                      productId: product.id,
                      slug: product.slug,
                      name: product.name,
                      priceMxn: product.priceMxn,
                      compareAtMxn: product.compareAtMxn,
                      imagePath: product.imagePath,
                    });
                    setAdded(product.id);
                    setTimeout(() => setAdded(null), 1500);
                  }}
                >
                  {product.stock < 1 ? "Agotado" : added === product.id ? "Añadido" : "Añadir"}
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
