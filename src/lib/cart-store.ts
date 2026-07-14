import { useEffect, useSyncExternalStore } from "react";

export type CartItem = {
  id: string;
  name: string;
  size: string;
  price: number;
  qty: number;
  image: string;
};

const KEY = "jesusity-cart-v1";

let items: CartItem[] = [];
const listeners = new Set<() => void>();

function load() {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) items = JSON.parse(raw);
  } catch {
    /* noop */
  }
}
function persist() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(items));
}
function emit() {
  listeners.forEach((l) => l());
}

export const cart = {
  hydrate() {
    load();
    emit();
  },
  get() {
    return items;
  },
  add(item: Omit<CartItem, "qty"> & { qty?: number }) {
    const qty = item.qty ?? 1;
    const existing = items.find((i) => i.id === item.id && i.size === item.size);
    if (existing) existing.qty += qty;
    else items = [...items, { ...item, qty }];
    persist();
    emit();
  },
  updateQty(id: string, size: string, qty: number) {
    items = items
      .map((i) => (i.id === id && i.size === size ? { ...i, qty } : i))
      .filter((i) => i.qty > 0);
    persist();
    emit();
  },
  remove(id: string, size: string) {
    items = items.filter((i) => !(i.id === id && i.size === size));
    persist();
    emit();
  },
  clear() {
    items = [];
    persist();
    emit();
  },
  subscribe(fn: () => void) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
};

const SSR_EMPTY: CartItem[] = [];

export function useCart() {
  const snap = useSyncExternalStore(
    (cb) => cart.subscribe(cb),
    () => items,
    () => SSR_EMPTY,
  );
  useEffect(() => {
    cart.hydrate();
  }, []);
  return snap;
}

export function cartCount(items: CartItem[]) {
  return items.reduce((n, i) => n + i.qty, 0);
}
export function cartTotal(items: CartItem[]) {
  return items.reduce((s, i) => s + i.qty * i.price, 0);
}
