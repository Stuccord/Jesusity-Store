import { useEffect, useSyncExternalStore } from "react";
import { couponStore, Coupon, calculateCouponDiscount } from "./coupons";

export type CartItem = {
  id: string;
  name: string;
  size: string;
  price: number;
  qty: number;
  image: string;
};

const KEY = "jesusity-cart-v1";
const COUPON_KEY = "jesusity-applied-coupon-v1";

let items: CartItem[] = [];
let appliedCouponCode: string | null = null;
const listeners = new Set<() => void>();

function load() {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) items = JSON.parse(raw);
    const rawCoupon = window.localStorage.getItem(COUPON_KEY);
    if (rawCoupon) appliedCouponCode = rawCoupon;
  } catch {
    /* noop */
  }
}

function persist() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(items));
  if (appliedCouponCode) {
    window.localStorage.setItem(COUPON_KEY, appliedCouponCode);
  } else {
    window.localStorage.removeItem(COUPON_KEY);
  }
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
  getCouponCode() {
    return appliedCouponCode;
  },
  getCoupon(): Coupon | null {
    if (!appliedCouponCode) return null;
    const found = couponStore.getByCode(appliedCouponCode);
    return found && found.active ? found : null;
  },
  applyCoupon(code: string): { success: boolean; message: string; coupon?: Coupon } {
    const res = couponStore.validate(code);
    if (!res.valid || !res.coupon) {
      return { success: false, message: res.error || "Invalid coupon code" };
    }
    appliedCouponCode = res.coupon.code;
    persist();
    emit();
    return {
      success: true,
      message: `${res.coupon.code} applied! (${res.coupon.value}% off)`,
      coupon: res.coupon,
    };
  },
  removeCoupon() {
    appliedCouponCode = null;
    persist();
    emit();
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
    appliedCouponCode = null;
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

export function useAppliedCoupon() {
  const _snap = useSyncExternalStore(
    (cb) => cart.subscribe(cb),
    () => appliedCouponCode,
    () => null,
  );
  useEffect(() => {
    cart.hydrate();
  }, []);
  return cart.getCoupon();
}

export function cartCount(items: CartItem[]) {
  return items.reduce((n, i) => n + i.qty, 0);
}

export function cartSubtotalUSD(items: CartItem[]) {
  return items.reduce((s, i) => s + i.qty * i.price, 0);
}

export function cartSubtotalGHS(items: CartItem[], priceGHS: number) {
  return items.reduce((s, i) => s + i.qty * priceGHS, 0);
}

export function cartTotalsWithCoupon(items: CartItem[], priceGHS: number, coupon: Coupon | null) {
  const subtotalUSD = cartSubtotalUSD(items);
  const subtotalGHS = cartSubtotalGHS(items, priceGHS);
  return {
    subtotalUSD,
    subtotalGHS,
    ...calculateCouponDiscount(coupon, subtotalUSD, subtotalGHS),
  };
}
