import { useEffect, useSyncExternalStore } from "react";

export type DiscountType = "PERCENT" | "FIXED";

export interface Coupon {
  code: string;
  type: DiscountType;
  value: number;           // discount: e.g. 15 for 15% off to the customer
  commissionRate: number;  // influencer earns this % of the revenue they generate (e.g. 10 = 10%)
  influencerName: string;
  description: string;
  active: boolean;
  usageCount: number;
  createdAt: string;
}

const STORAGE_KEY = "jesusity-coupons-v3";

const DEFAULT_COUPONS: Coupon[] = [
  {
    code: "AMA",
    type: "PERCENT",
    value: 15,
    commissionRate: 10,
    influencerName: "Ama Mensah",
    description: "Ama's 15% follower discount code",
    active: true,
    usageCount: 0,
    createdAt: "2026-07-01T10:00:00Z",
  },
  {
    code: "KOFI",
    type: "PERCENT",
    value: 20,
    commissionRate: 10,
    influencerName: "Kofi Owusu",
    description: "Kofi's 20% follower discount code",
    active: true,
    usageCount: 0,
    createdAt: "2026-07-05T12:00:00Z",
  },
  {
    code: "JESUSITY10",
    type: "PERCENT",
    value: 10,
    commissionRate: 0,
    influencerName: "Clovermade Studio",
    description: "10% Welcome preorder promo",
    active: true,
    usageCount: 0,
    createdAt: "2026-07-10T08:00:00Z",
  },
];

let coupons: Coupon[] = DEFAULT_COUPONS;
let loaded = false;

function load() {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: Coupon[] = JSON.parse(raw);
      // Ensure default coupons always exist
      const existingCodes = new Set(parsed.map((c) => c.code.toUpperCase()));
      const missingDefaults = DEFAULT_COUPONS.filter((dc) => !existingCodes.has(dc.code.toUpperCase()));
      coupons = [...parsed, ...missingDefaults];
    } else {
      coupons = DEFAULT_COUPONS;
      persist();
    }
  } catch {
    coupons = DEFAULT_COUPONS;
  }
  loaded = true;
}

function persist() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(coupons));
}

function emit() {
  listeners.forEach((fn) => fn());
}

export const couponStore = {
  hydrate() {
    load();
    emit();
  },
  getAll(): Coupon[] {
    if (typeof window !== "undefined" && !loaded) load();
    return coupons;
  },
  getByCode(code: string): Coupon | undefined {
    if (typeof window !== "undefined" && !loaded) load();
    const clean = code.trim().toUpperCase();
    return coupons.find((c) => c.code.toUpperCase() === clean);
  },
  validate(code: string): { valid: boolean; coupon?: Coupon; error?: string } {
    if (typeof window !== "undefined" && !loaded) load();
    if (!code || !code.trim()) {
      return { valid: false, error: "Please enter a coupon code." };
    }
    const clean = code.trim().toUpperCase();
    const found = coupons.find((c) => c.code.toUpperCase() === clean);
    if (!found) {
      return { valid: false, error: `Coupon "${clean}" is invalid.` };
    }
    if (!found.active) {
      return { valid: false, error: `Coupon "${clean}" is no longer active.` };
    }
    return { valid: true, coupon: found };
  },
  add(coupon: Omit<Coupon, "usageCount" | "createdAt">): Coupon {
    const cleanCode = coupon.code.trim().toUpperCase();
    const existingIndex = coupons.findIndex((c) => c.code.toUpperCase() === cleanCode);
    const newCoupon: Coupon = {
      ...coupon,
      code: cleanCode,
      usageCount: existingIndex >= 0 ? coupons[existingIndex].usageCount : 0,
      createdAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      coupons[existingIndex] = newCoupon;
    } else {
      coupons.push(newCoupon);
    }
    persist();
    emit();
    return newCoupon;
  },
  toggleActive(code: string) {
    const clean = code.trim().toUpperCase();
    coupons = coupons.map((c) => (c.code.toUpperCase() === clean ? { ...c, active: !c.active } : c));
    persist();
    emit();
  },
  incrementUsage(code: string) {
    const clean = code.trim().toUpperCase();
    coupons = coupons.map((c) => (c.code.toUpperCase() === clean ? { ...c, usageCount: c.usageCount + 1 } : c));
    persist();
    emit();
  },
  remove(code: string) {
    const clean = code.trim().toUpperCase();
    coupons = coupons.filter((c) => c.code.toUpperCase() !== clean);
    persist();
    emit();
  },
  subscribe(fn: () => void) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
};

export function useCoupons() {
  const snap = useSyncExternalStore(
    (cb) => couponStore.subscribe(cb),
    () => coupons,
    () => DEFAULT_COUPONS
  );
  useEffect(() => {
    couponStore.hydrate();
  }, []);
  return snap;
}

export function calculateCouponDiscount(coupon: Coupon | null, subtotalUSD: number, subtotalGHS: number) {
  if (!coupon || !coupon.active) {
    return { discountUSD: 0, discountGHS: 0, finalUSD: subtotalUSD, finalGHS: subtotalGHS };
  }

  let discountUSD = 0;
  let discountGHS = 0;

  if (coupon.type === "PERCENT") {
    discountUSD = Math.round((subtotalUSD * (coupon.value / 100)) * 100) / 100;
    discountGHS = Math.round((subtotalGHS * (coupon.value / 100)) * 100) / 100;
  } else {
    // FIXED amount
    discountUSD = Math.min(subtotalUSD, coupon.value);
    const ghsRatio = subtotalGHS / (subtotalUSD || 1);
    discountGHS = Math.min(subtotalGHS, Math.round(discountUSD * ghsRatio));
  }

  const finalUSD = Math.max(0, subtotalUSD - discountUSD);
  const finalGHS = Math.max(0, subtotalGHS - discountGHS);

  return { discountUSD, discountGHS, finalUSD, finalGHS };
}
