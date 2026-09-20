"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { CatalogNews } from "@/components/CatalogHome";

export function PostCarousel({
  title,
  items,
  allHref,
  empty,
}: {
  title: string;
  items: CatalogNews[];
  allHref: string;
  empty: string;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (items.length < 2 || paused) return;
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % items.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [items.length, paused]);

  const item = items[index];

  function go(delta: number) {
    if (!items.length) return;
    setIndex((current) => (current + delta + items.length) % items.length);
  }

  return (
    <article
      className="flex flex-col px-4 py-4 lg:px-6"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs uppercase tracking-wider text-[#6D5E52]">{title}</p>
        <div className="flex items-center gap-2">
          {item ? <span className="text-xs text-[#6D5E52]">{index + 1}/{items.length}</span> : null}
          {items.length > 1 ? (
            <>
              <button type="button" onClick={() => go(-1)} className="border border-[#EADBCE] px-2 py-0.5 text-sm leading-none" aria-label={`Anterior ${title}`}>
                ‹
              </button>
              <button type="button" onClick={() => go(1)} className="border border-[#EADBCE] px-2 py-0.5 text-sm leading-none" aria-label={`Siguiente ${title}`}>
                ›
              </button>
            </>
          ) : null}
          <Link href={allHref} className="text-xs text-[#6D5E52]">
            Ver todos
          </Link>
        </div>
      </div>
      {!item ? (
        <p className="mt-2 text-sm text-[#6D5E52]">{empty}</p>
      ) : (
        <div key={item.slug} className="mt-2 animate-[fadeSlide_500ms_ease]">
          <Link href={item.href} className="font-serif text-lg leading-snug text-[#241B16]">
            {item.title}
          </Link>
          <p className="mt-1 line-clamp-2 text-sm leading-snug text-[#6D5E52]">{item.body}</p>
        </div>
      )}
    </article>
  );
}
