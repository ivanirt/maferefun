"use client";

import { useState } from "react";
import Link from "next/link";
import { addToCart } from "@/lib/cart";
import type { CatalogProduct } from "@/components/CatalogHome";
import { ProductPhotos } from "@/components/ProductPhotos";
import { SalePrice } from "@/components/SalePrice";

export function ProductDetail({ product, detail }: { product: CatalogProduct; detail: string }) {
  const [added, setAdded] = useState(false);
  const body = detail.trim() || product.description;

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 lg:grid-cols-2">
      <ProductPhotos
        paths={product.images.length ? product.images : [product.imagePath]}
        alt={product.name}
        sizes="(max-width: 1024px) 100vw, 50vw"
      />
      <div>
        <p className="text-xs uppercase tracking-wider text-[#6D5E52]">{product.orisha}</p>
        <h1 className="mt-2 font-serif text-4xl">{product.name}</h1>
        <div className="mt-4">
          <SalePrice priceMxn={product.priceMxn} compareAtMxn={product.compareAtMxn} />
        </div>
        <p className="mt-6 whitespace-pre-wrap text-[#6D5E52]">{body}</p>
        <button
          type="button"
          disabled={product.stock < 1}
          className="mt-8 w-full bg-[#241B16] py-3 text-xs uppercase tracking-wider text-[#FAF7F2] disabled:opacity-40 lg:w-auto lg:px-10"
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
            setAdded(true);
            setTimeout(() => setAdded(false), 1500);
          }}
        >
          {product.stock < 1 ? "Sin inventario" : added ? "Añadido" : "Añadir al carrito"}
        </button>
        <p className="mt-6 text-sm">
          <Link href="/#catalogo">Volver al catálogo</Link>
        </p>
      </div>
    </div>
  );
}
