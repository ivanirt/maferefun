export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  priceMxn: number;
  imagePath: string;
  quantity: number;
};

const KEY = "maferefun-cart";

export function readCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
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
  const existing = items.find((entry) => entry.productId === item.productId);
  if (existing) existing.quantity += quantity;
  else items.push({ ...item, quantity });
  writeCart(items);
}

export function setQuantity(productId: string, quantity: number): void {
  const items = readCart().filter((entry) => (entry.productId === productId ? quantity > 0 : true));
  const target = items.find((entry) => entry.productId === productId);
  if (target) target.quantity = quantity;
  writeCart(items.filter((entry) => entry.quantity > 0));
}

export function clearCart(): void {
  writeCart([]);
}
