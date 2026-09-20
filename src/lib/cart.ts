export type CartItem = {
  key: string;
  kind: "product" | "package";
  productId?: string;
  packageId?: string;
  slug: string;
  name: string;
  priceMxn: number;
  compareAtMxn?: number | null;
  imagePath: string;
  quantity: number;
};

const KEY = "maferefun-cart";

export function readCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    const items = raw ? (JSON.parse(raw) as CartItem[]) : [];
    return items.map((item) => ({
      ...item,
      key: item.key || `product:${item.productId}`,
      kind: item.kind || "product",
    }));
  } catch {
    return [];
  }
}

export function writeCart(items: CartItem[]): void {
  localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("maferefun-cart"));
}

export function addToCart(item: Omit<CartItem, "quantity">, quantity = 1): void {
  const items = readCart();
  const existing = items.find((entry) => entry.key === item.key);
  if (existing) existing.quantity += quantity;
  else items.push({ ...item, quantity });
  writeCart(items);
}

export function setQuantity(key: string, quantity: number): void {
  writeCart(
    readCart()
      .map((entry) => (entry.key === key ? { ...entry, quantity } : entry))
      .filter((entry) => entry.quantity > 0),
  );
}

export function clearCart(): void {
  writeCart([]);
}
