import { useEffect, useSyncExternalStore } from "react";

export type OrderStatus = "Paid" | "In Production" | "Shipped" | "Delivered";

export interface OrderItem {
  id: string;
  name: string;
  size: string;
  priceUSD: number;
  priceGHS: number;
  qty: number;
}

export interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface Order {
  id: string;
  ref: string;
  customer: CustomerInfo;
  items: OrderItem[];
  subtotalUSD: number;
  discountUSD: number;
  totalUSD: number;
  subtotalGHS: number;
  discountGHS: number;
  totalGHS: number;
  couponCode?: string;
  influencerName?: string;
  status: OrderStatus;
  verifiedWithPaystack: boolean;
  paymentChannel?: string;
  createdAt: string;
}

const STORAGE_KEY = "jesusity-orders-v2"; // v2 clears stale seed data from v1

let orders: Order[] = [];
const listeners = new Set<() => void>();



function load() {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    orders = raw ? (JSON.parse(raw) as Order[]) : [];
  } catch {
    orders = [];
  }
}

function persist() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

function emit() {
  listeners.forEach((fn) => fn());
}

export const ordersStore = {
  hydrate() {
    load();
    emit();
  },
  getAll(): Order[] {
    return orders;
  },
  add(order: Omit<Order, "id"> & { id?: string }): Order {
    const newOrder: Order = {
      ...order,
      id: order.id || `ord-${Date.now()}`,
      verifiedWithPaystack: order.verifiedWithPaystack ?? true,
      paymentChannel: order.paymentChannel || "Paystack Live Gateway",
      createdAt: order.createdAt || new Date().toISOString(),
    };
    orders = [newOrder, ...orders];
    persist();
    emit();
    return newOrder;
  },
  updateStatus(id: string, status: OrderStatus) {
    orders = orders.map((o) => (o.id === id ? { ...o, status } : o));
    persist();
    emit();
  },
  verifyOrderWithPaystack(id: string, channel?: string) {
    orders = orders.map((o) =>
      o.id === id ? { ...o, verifiedWithPaystack: true, paymentChannel: channel || o.paymentChannel || "Paystack Verified" } : o
    );
    persist();
    emit();
  },
  /**
   * Import an array of orders from Paystack, skipping any that already exist.
   * Existing orders (by ref) are never overwritten.
   */
  bulkImport(incoming: Order[]) {
    const existingRefs = new Set(orders.map((o) => o.ref));
    const fresh = incoming.filter((o) => !existingRefs.has(o.ref));
    if (fresh.length === 0) return 0;
    orders = [...fresh, ...orders].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    persist();
    emit();
    return fresh.length;
  },
  subscribe(fn: () => void) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
};

export function useOrders() {
  const snap = useSyncExternalStore(
    (cb) => ordersStore.subscribe(cb),
    () => orders,
    () => [] as Order[]
  );
  useEffect(() => {
    ordersStore.hydrate();
  }, []);
  return snap;
}

export function exportOrdersToCSV(ordersList: Order[]) {
  if (typeof window === "undefined") return;
  const headers = [
    "Order Ref",
    "Date",
    "Customer Name",
    "Email",
    "Phone",
    "Address",
    "City",
    "Country",
    "Items & Sizes",
    "Coupon Code",
    "Total (GHS)",
    "Total (USD)",
    "Status",
    "Paystack Verified",
  ];

  const rows = ordersList.map((o) => [
    `"${o.ref}"`,
    `"${new Date(o.createdAt).toLocaleDateString()}"`,
    `"${o.customer.firstName} ${o.customer.lastName}"`,
    `"${o.customer.email}"`,
    `"${o.customer.phone}"`,
    `"${o.customer.address}"`,
    `"${o.customer.city}"`,
    `"${o.customer.country}"`,
    `"${o.items.map((i) => `${i.qty}x ${i.size}`).join("; ")}"`,
    `"${o.couponCode || "Direct"}"`,
    `"${o.totalGHS}"`,
    `"${o.totalUSD}"`,
    `"${o.status}"`,
    `"${o.verifiedWithPaystack ? "Yes" : "No"}"`,
  ]);

  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `Clovermade_Preorders_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function computeAnalytics(ordersList: Order[]) {
  const totalRevenueUSD = ordersList.reduce((sum, o) => sum + o.totalUSD, 0);
  const totalRevenueGHS = ordersList.reduce((sum, o) => sum + o.totalGHS, 0);
  const totalDiscountUSD = ordersList.reduce((sum, o) => sum + o.discountUSD, 0);
  const totalDiscountGHS = ordersList.reduce((sum, o) => sum + o.discountGHS, 0);
  const totalOrders = ordersList.length;

  const totalTeesCount = ordersList.reduce(
    (sum, o) => sum + o.items.reduce((iSum, i) => iSum + i.qty, 0),
    0
  );

  const avgOrderValueUSD = totalOrders > 0 ? totalRevenueUSD / totalOrders : 0;
  const avgOrderValueGHS = totalOrders > 0 ? totalRevenueGHS / totalOrders : 0;

  // Size breakdown
  const sizeCounts: Record<string, number> = { S: 0, M: 0, L: 0, XL: 0, XXL: 0 };
  ordersList.forEach((o) => {
    o.items.forEach((i) => {
      sizeCounts[i.size] = (sizeCounts[i.size] || 0) + i.qty;
    });
  });

  const sizeBreakdown = Object.entries(sizeCounts).map(([size, count]) => ({
    size,
    count,
  }));

  // Coupon / Influencer tracking
  const couponStatsMap: Record<
    string,
    { code: string; influencer: string; orders: number; revenueGHS: number; revenueUSD: number; discountGHS: number }
  > = {
    AMA: { code: "AMA", influencer: "Ama Mensah", orders: 0, revenueGHS: 0, revenueUSD: 0, discountGHS: 0 },
    KOFI: { code: "KOFI", influencer: "Kofi Owusu", orders: 0, revenueGHS: 0, revenueUSD: 0, discountGHS: 0 },
    JESUSITY10: { code: "JESUSITY10", influencer: "Clovermade Studio", orders: 0, revenueGHS: 0, revenueUSD: 0, discountGHS: 0 },
    DIRECT: { code: "DIRECT", influencer: "Direct / Organic", orders: 0, revenueGHS: 0, revenueUSD: 0, discountGHS: 0 },
  };

  ordersList.forEach((o) => {
    const key = o.couponCode ? o.couponCode.toUpperCase() : "DIRECT";
    if (!couponStatsMap[key]) {
      couponStatsMap[key] = {
        code: key,
        influencer: o.influencerName || "Custom Coupon",
        orders: 0,
        revenueGHS: 0,
        revenueUSD: 0,
        discountGHS: 0,
      };
    }
    couponStatsMap[key].orders += 1;
    couponStatsMap[key].revenueGHS += o.totalGHS;
    couponStatsMap[key].revenueUSD += o.totalUSD;
    couponStatsMap[key].discountGHS += o.discountGHS;
  });

  const couponPerformance = Object.values(couponStatsMap);

  // Timeline (group by date)
  const timelineMap: Record<string, { date: string; revenueGHS: number; revenueUSD: number; orders: number }> = {};
  [...ordersList]
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .forEach((o) => {
      const dateStr = new Date(o.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      if (!timelineMap[dateStr]) {
        timelineMap[dateStr] = { date: dateStr, revenueGHS: 0, revenueUSD: 0, orders: 0 };
      }
      timelineMap[dateStr].revenueGHS += o.totalGHS;
      timelineMap[dateStr].revenueUSD += o.totalUSD;
      timelineMap[dateStr].orders += 1;
    });

  const timelineData = Object.values(timelineMap);

  return {
    totalRevenueUSD,
    totalRevenueGHS,
    totalDiscountUSD,
    totalDiscountGHS,
    totalOrders,
    totalTeesCount,
    avgOrderValueUSD,
    avgOrderValueGHS,
    sizeBreakdown,
    couponPerformance,
    timelineData,
  };
}
