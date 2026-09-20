"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { formatMxn } from "@/lib/shipping";

export type InventoryRow = {
  id: string;
  name: string;
  orisha: string;
  priceMxn: number;
  stock: number;
  minStock: number;
  enabled: boolean;
};

type SortKey = "name" | "priceMxn" | "stock" | "minStock" | "enabled";

const COLUMNS: { key: SortKey; label: string }[] = [
  { key: "name", label: "Artículo" },
  { key: "priceMxn", label: "Precio unitario" },
  { key: "stock", label: "Inventario" },
  { key: "minStock", label: "Mínimo" },
  { key: "enabled", label: "Estado" },
];

function compare(a: InventoryRow, b: InventoryRow, key: SortKey): number {
  if (key === "name") return a.name.localeCompare(b.name, "es") || a.orisha.localeCompare(b.orisha, "es");
  if (key === "enabled") return Number(a.enabled) - Number(b.enabled);
  return a[key] - b[key];
}

function matches(value: string, query: string) {
  if (!query.trim()) return true;
  return value.toLowerCase().includes(query.trim().toLowerCase());
}

export function InventoryTable({ products }: { products: InventoryRow[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [filters, setFilters] = useState<Record<SortKey, string>>({
    name: "",
    priceMxn: "",
    stock: "",
    minStock: "",
    enabled: "",
  });

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((dir) => (dir === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDir(key === "name" ? "asc" : "desc");
  }

  function setFilter(key: SortKey, value: string) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  const rows = useMemo(() => {
    const filtered = products.filter((product) => {
      const status = product.enabled ? "Activo" : "Deshabilitado";
      const low = product.stock <= product.minStock ? "bajo" : "";
      return (
        matches(`${product.name} ${product.orisha}`, filters.name) &&
        matches(String(product.priceMxn), filters.priceMxn) &&
        matches(String(product.stock), filters.stock) &&
        matches(String(product.minStock), filters.minStock) &&
        matches(`${status} ${low}`, filters.enabled)
      );
    });
    const sorted = [...filtered].sort((a, b) => compare(a, b, sortKey));
    if (sortDir === "desc") sorted.reverse();
    return sorted;
  }, [products, filters, sortKey, sortDir]);

  return (
    <div className="mt-6 overflow-x-auto border border-[#EADBCE] bg-white">
      <table className="w-full text-left text-sm">
        <thead className="bg-[#F3EEE6] text-xs uppercase tracking-wider text-[#6D5E52]">
          <tr>
            {COLUMNS.map((column) => {
              const active = sortKey === column.key;
              return (
                <th key={column.key} className="px-3 py-2">
                  <button
                    type="button"
                    onClick={() => toggleSort(column.key)}
                    className="inline-flex items-center gap-1 uppercase tracking-wider"
                  >
                    {column.label}
                    <span className={active ? "text-[#241B16]" : "text-[#C4B8AA]"}>
                      {active ? (sortDir === "asc" ? "↑" : "↓") : "↕"}
                    </span>
                  </button>
                </th>
              );
            })}
          </tr>
          <tr className="normal-case tracking-normal">
            <th className="px-3 pb-2 font-normal">
              <input
                value={filters.name}
                onChange={(e) => setFilter("name", e.target.value)}
                placeholder="Filtrar"
                className="w-full border border-[#EADBCE] bg-white px-2 py-1 text-sm text-[#241B16]"
              />
            </th>
            <th className="px-3 pb-2 font-normal">
              <input
                value={filters.priceMxn}
                onChange={(e) => setFilter("priceMxn", e.target.value)}
                placeholder="Filtrar"
                inputMode="decimal"
                className="w-full border border-[#EADBCE] bg-white px-2 py-1 text-sm text-[#241B16]"
              />
            </th>
            <th className="px-3 pb-2 font-normal">
              <input
                value={filters.stock}
                onChange={(e) => setFilter("stock", e.target.value)}
                placeholder="Filtrar"
                inputMode="numeric"
                className="w-full border border-[#EADBCE] bg-white px-2 py-1 text-sm text-[#241B16]"
              />
            </th>
            <th className="px-3 pb-2 font-normal">
              <input
                value={filters.minStock}
                onChange={(e) => setFilter("minStock", e.target.value)}
                placeholder="Filtrar"
                inputMode="numeric"
                className="w-full border border-[#EADBCE] bg-white px-2 py-1 text-sm text-[#241B16]"
              />
            </th>
            <th className="px-3 pb-2 font-normal">
              <select
                value={filters.enabled}
                onChange={(e) => setFilter("enabled", e.target.value)}
                className="w-full border border-[#EADBCE] bg-white px-2 py-1 text-sm text-[#241B16]"
              >
                <option value="">Todos</option>
                <option value="activo">Activo</option>
                <option value="deshabilitado">Deshabilitado</option>
                <option value="bajo">Bajo mínimo</option>
              </select>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-3 py-6 text-center text-[#6D5E52]">
                Ningún artículo coincide con el filtro.
              </td>
            </tr>
          ) : (
            rows.map((product) => {
              const low = product.stock <= product.minStock;
              return (
                <tr key={product.id} className="border-t border-[#EADBCE]">
                  <td className="px-3 py-2">
                    <Link href={`/config/productos/${product.id}`} className="font-medium text-[#241B16]">
                      {product.name}
                    </Link>
                    <p className="text-xs text-[#6D5E52]">{product.orisha}</p>
                  </td>
                  <td className="px-3 py-2">{formatMxn(product.priceMxn)}</td>
                  <td className={`px-3 py-2 ${low ? "text-[#8B3A2A]" : ""}`}>{product.stock}</td>
                  <td className="px-3 py-2">{product.minStock}</td>
                  <td className="px-3 py-2">{product.enabled ? "Activo" : "Deshabilitado"}</td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
