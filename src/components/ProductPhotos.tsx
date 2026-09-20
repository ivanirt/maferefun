"use client";

import Image from "next/image";
import { CSSProperties, useState } from "react";

export function ProductPhotos({
  paths,
  alt,
  sizes,
  className = "relative aspect-square bg-[#E8DFD0]",
  style,
}: {
  paths: string[];
  alt: string;
  sizes: string;
  className?: string;
  style?: CSSProperties;
}) {
  const photos = paths.filter(Boolean);
  const [index, setIndex] = useState(0);
  const current = photos[Math.min(index, Math.max(photos.length - 1, 0))];

  if (!current) {
    return <div className={className} style={style} />;
  }

  return (
    <div className={className} style={style}>
      <Image src={current} alt={alt} fill className="object-contain p-2" sizes={sizes} />
      {photos.length > 1 ? (
        <>
          <button
            type="button"
            aria-label="Foto anterior"
            className="absolute left-1 top-1/2 z-10 -translate-y-1/2 bg-white/85 px-2 py-1 text-sm"
            onClick={(event) => {
              event.stopPropagation();
              setIndex((i) => (i === 0 ? photos.length - 1 : i - 1));
            }}
            onDoubleClick={(event) => event.stopPropagation()}
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="Foto siguiente"
            className="absolute right-1 top-1/2 z-10 -translate-y-1/2 bg-white/85 px-2 py-1 text-sm"
            onClick={(event) => {
              event.stopPropagation();
              setIndex((i) => (i + 1) % photos.length);
            }}
            onDoubleClick={(event) => event.stopPropagation()}
          >
            ›
          </button>
          <div className="absolute bottom-2 left-0 right-0 z-10 flex justify-center gap-1">
            {photos.map((path, i) => (
              <button
                key={`${path}-${i}`}
                type="button"
                aria-label={`Foto ${i + 1}`}
                className={`h-1.5 w-1.5 rounded-full ${i === index ? "bg-[#241B16]" : "bg-[#241B16]/30"}`}
                onClick={(event) => {
                  event.stopPropagation();
                  setIndex(i);
                }}
                onDoubleClick={(event) => event.stopPropagation()}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
