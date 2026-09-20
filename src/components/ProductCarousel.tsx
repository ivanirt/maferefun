"use client";

import { useEffect, useRef, useState } from "react";
import { addToCart } from "@/lib/cart";
import type { CatalogProduct } from "@/components/CatalogHome";
import { ProductPhotos } from "@/components/ProductPhotos";
import { SalePrice } from "@/components/SalePrice";

const CARD =
  "w-full shrink-0 snap-start border border-[#EADBCE] bg-white sm:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-3rem)/3)]";
const ARROW_BOX =
  "absolute top-0 z-10 flex aspect-square w-full items-center sm:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-3rem)/3)]";

export function ProductCarousel({ title, products }: { title: string; products: CatalogProduct[] }) {
  const scroller = useRef<HTMLDivElement>(null);
  const [added, setAdded] = useState<string | null>(null);
  const [paused, setPaused] = useState(false);

  function stepSize() {
    const node = scroller.current;
    const card = node?.querySelector("article");
    if (!node || !card) return 0;
    const styles = window.getComputedStyle(node);
    const gap = Number.parseFloat(styles.columnGap || styles.gap) || 24;
    return card.getBoundingClientRect().width + gap;
  }

  function scroll(dir: number) {
    const node = scroller.current;
    if (!node) return;
    const step = stepSize();
    const max = node.scrollWidth - node.clientWidth;
    if (max <= 0 || !step) return;
    const next = node.scrollLeft + dir * step;
    if (next > max - 8) {
      node.scrollTo({ left: 0, behavior: "smooth" });
      return;
    }
    if (next < 0) {
      node.scrollTo({ left: max, behavior: "smooth" });
      return;
    }
    node.scrollBy({ left: dir * step, behavior: "smooth" });
  }

  useEffect(() => {
    if (products.length < 2 || paused) return;
    const timer = window.setInterval(() => scroll(1), 4000);
    return () => window.clearInterval(timer);
  }, [products.length, paused]);

  if (!products.length) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-8">
      <h2 className="mb-4 font-serif text-2xl">{title}</h2>
      <div
        className="relative"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <button type="button" onClick={() => scroll(-1)} className={`${ARROW_BOX} left-0 -translate-x-1/2`} aria-label="Anterior">
          <span className="border border-[#EADBCE] bg-white/95 px-3 py-6 text-xl text-[#241B16] shadow-sm">‹</span>
        </button>
        <button type="button" onClick={() => scroll(1)} className={`${ARROW_BOX} right-0 translate-x-1/2 justify-end`} aria-label="Siguiente">
          <span className="border border-[#EADBCE] bg-white/95 px-3 py-6 text-xl text-[#241B16] shadow-sm">›</span>
        </button>
        <div
          ref={scroller}
          className="flex snap-x snap-mandatory gap-6 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {products.map((product) => (
            <article key={product.id} className={CARD}>
              <ProductPhotos
                paths={product.images.length ? product.images : [product.imagePath]}
                alt={product.name}
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <div className="space-y-2 p-4">
                <p className="text-xs uppercase tracking-wider text-[#6D5E52]">{product.orisha}</p>
                <h2 className="font-serif text-xl text-[#241B16]">{product.name}</h2>
                <p className="text-sm text-[#6D5E52]">{product.description}</p>
                <SalePrice priceMxn={product.priceMxn} compareAtMxn={product.compareAtMxn} />
                <button
                  type="button"
                  disabled={product.stock < 1}
                  className="w-full bg-[#241B16] py-2.5 text-xs uppercase tracking-wider text-[#FAF7F2] disabled:opacity-40"
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
                  {product.stock < 1 ? "Sin inventario" : added === product.id ? "Añadido" : "Añadir al carrito"}
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
