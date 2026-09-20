"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { addToCart } from "@/lib/cart";
import type { CatalogProduct } from "@/components/CatalogHome";
import { ProductPhotos } from "@/components/ProductPhotos";
import { SalePrice } from "@/components/SalePrice";

export function ProductCard({
  product,
  className = "border border-[#EADBCE] bg-white",
}: {
  product: CatalogProduct;
  className?: string;
}) {
  const router = useRouter();
  const [added, setAdded] = useState(false);

  return (
    <article
      className={className}
      title="Doble clic para ver el detalle"
      onDoubleClick={() => router.push(`/catalogo/${product.slug}`)}
    >
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
          onClick={(event) => {
            event.stopPropagation();
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
          onDoubleClick={(event) => event.stopPropagation()}
        >
          {product.stock < 1 ? "Sin inventario" : added ? "Añadido" : "Añadir al carrito"}
        </button>
      </div>
    </article>
  );
}
