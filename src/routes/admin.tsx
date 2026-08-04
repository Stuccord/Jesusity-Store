import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  useOrders,
  ordersStore,
  computeAnalytics,
  exportOrdersToCSV,
  Order,
  OrderStatus,
} from "@/lib/orders-store";
import { useCoupons, couponStore } from "@/lib/coupons";
import { getPaystackConfig } from "@/lib/paystack-api";
import { fetchPaystackTransactions, isValidSecretKey, PaystackTx } from "@/lib/paystack-server";
import { PRODUCT } from "@/lib/product";
import {
  TrendingUp,
  ShoppingBag,
  Users,
  Tag,
  Search,
  CheckCircle,
  Clock,
  Plus,
  DollarSign,
  Package,
  ShieldCheck,
  Eye,
  X,
  Download,
  RefreshCw,
  Zap,
  Activity,
  CheckCircle2,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Analytics & Operations — Clovermade Studios" },
      {
        name: "description",
        content: "Executive e-commerce analytics, order management, and influencer tracking.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const orders = useOrders();
  const coupons = useCoupons();
  const analytics = computeAnalytics(orders);
  const paystackConfig = getPaystackConfig();

  const [activeTab, setActiveTab] = useState<"analytics" | "orders" | "coupons" | "customers">(
    "analytics",
  );
  const [syncingApi, setSyncingApi] = useState(false);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  // Orders tab state
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("ALL");
  const [orderCouponFilter, setOrderCouponFilter] = useState<string>("ALL");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // New Coupon form state
  const [newCode, setNewCode] = useState("");
  const [newValue, setNewValue] = useState<number>(15);
  const [newType, setNewType] = useState<"PERCENT" | "FIXED_GHS">("FIXED_GHS");
  const [newCommissionRate, setNewCommissionRate] = useState<number>(10);
  const [newInfluencer, setNewInfluencer] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [couponSuccessMsg, setCouponSuccessMsg] = useState("");

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim() || !newInfluencer.trim()) return;
    couponStore.add({
      code: newCode.trim().toUpperCase(),
      type: newType,
      value: newValue,
      commissionRate: newCommissionRate,
      influencerName: newInfluencer.trim(),
      description: newDesc.trim() || `${newInfluencer.trim()}'s promo code`,
      active: true,
    });
    setCouponSuccessMsg(
      `✓ Coupon "${newCode.toUpperCase()}" created with ${newCommissionRate}% commission for ${newInfluencer}.`,
    );
    setNewCode("");
    setNewValue(15);
    setNewCommissionRate(10);
    setNewInfluencer("");
    setNewDesc("");
    setTimeout(() => setCouponSuccessMsg(""), 5000);
  };

  const handleSyncPaystackApi = async () => {
    setSyncingApi(true);
    setSyncNotice(null);

    try {
      const res = (await fetchPaystackTransactions()) as {
        ok: boolean;
        transactions?: PaystackTx[];
        error?: string;
      };
      if (!res.ok) {
        setSyncNotice(res.error || "Paystack Sync Failed");
        return;
      }

      const txs: PaystackTx[] = res.transactions || [];
      if (txs.length === 0) {
        setSyncNotice(
          "Connected to Paystack API. No external transactions found yet — system ready for live checkouts.",
        );
        return;
      }

      const importedOrders: Order[] = txs.map((tx: PaystackTx) => {
        const amountGHS = tx.amount / 100;
        const amountUSD = Math.round((amountGHS / 11.5) * 100) / 100;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const meta = (tx.metadata || {}) as Record<string, any>;

        return {
          id: `paystack-${tx.id}`,
          ref: tx.reference,
          customer: {
            firstName: tx.customer.first_name || meta.firstName || "Customer",
            lastName: tx.customer.last_name || meta.lastName || "",
            email: tx.customer.email,
            phone: tx.customer.phone || meta.phone || "",
            address: meta.address || "Online Order",
            city: meta.city || "Accra",
            state: meta.state || "Greater Accra",
            zip: meta.zip || "00233",
            country: meta.country || "Ghana",
          },
          items: meta.items || [
            {
              id: "jesusity-tee-forest",
              name: "The Jesusity Tee",
              size: meta.size || "M",
              priceUSD: 22,
              priceGHS: 253,
              qty: meta.qty || 1,
            },
          ],
          subtotalUSD: meta.subtotalUSD || amountUSD,
          discountUSD: meta.discountUSD || 0,
          totalUSD: meta.totalUSD || amountUSD,
          subtotalGHS: meta.subtotalGHS || amountGHS,
          discountGHS: meta.discountGHS || 0,
          totalGHS: meta.totalGHS || amountGHS,
          couponCode: meta.couponCode,
          influencerName: meta.influencerName,
          status: "Paid",
          verifiedWithPaystack: true,
          paymentChannel: tx.channel ? `Paystack (${tx.channel})` : "Paystack Live Gateway",
          createdAt: tx.paid_at || tx.createdAt || new Date().toISOString(),
        };
      });

      const count = ordersStore.bulkImport(importedOrders);
      setSyncNotice(`Paystack Sync Successful! ${count} new live transactions synced.`);
    } catch (err) {
      setSyncNotice(`Sync Notice: ${String(err)}`);
    } finally {
      setSyncingApi(false);
      setTimeout(() => setSyncNotice(null), 6000);
    }
  };

  // Filtered orders list
  const filteredOrders = orders.filter((o) => {
    const searchMatch =
      !orderSearch ||
      o.ref.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customer.firstName.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customer.lastName.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customer.email.toLowerCase().includes(orderSearch.toLowerCase()) ||
      (o.couponCode && o.couponCode.toLowerCase().includes(orderSearch.toLowerCase()));

    const statusMatch = orderStatusFilter === "ALL" || o.status === orderStatusFilter;
    const couponMatch =
      orderCouponFilter === "ALL"
        ? true
        : orderCouponFilter === "NONE"
          ? !o.couponCode
          : o.couponCode?.toUpperCase() === orderCouponFilter.toUpperCase();

    return searchMatch && statusMatch && couponMatch;
  });

  return (
    <div className="min-h-screen bg-cream/30 text-foreground pb-20">
      {/* Top Header */}
      <header className="bg-forest-deep text-cream border-b-2 border-forest-deep">
        <div className="mx-auto max-w-7xl px-4 md:px-8 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-lime text-forest-deep px-3 py-1 font-varsity text-xl tracking-wider uppercase border border-cream">
              LIVE ADMIN
            </div>
            <div>
              <h1 className="font-varsity text-2xl md:text-3xl tracking-wide leading-none">
                CLOVERMADE STUDIOS — REAL-TIME DASHBOARD
              </h1>
              <div className="flex items-center gap-3 text-xs text-cream/70 mt-1.5 flex-wrap">
                <span className="flex items-center gap-1.5 text-lime font-bold font-mono">
                  <Activity className="w-3.5 h-3.5 animate-pulse text-lime" /> Paystack API:{" "}
                  {paystackConfig.environment}
                </span>
                <span>·</span>
                <span>
                  Product: {PRODUCT.name} ({PRODUCT.colorway})
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleSyncPaystackApi()}
              disabled={syncingApi}
              className="bg-lime text-forest-deep px-4 py-2 text-xs font-bold tracking-widest uppercase border border-forest-deep hover:bg-cream transition-colors flex items-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncingApi ? "animate-spin" : ""}`} />
              {syncingApi ? "Syncing API..." : "Sync Paystack API"}
            </button>
            <button
              onClick={() => exportOrdersToCSV(orders)}
              className="bg-cream/10 hover:bg-cream/20 text-cream px-4 py-2 text-xs font-bold tracking-widest uppercase border border-cream/30 transition-colors flex items-center gap-2"
            >
              <Download className="w-3.5 h-3.5 text-lime" /> Export CSV
            </button>
          </div>
        </div>

        {syncNotice && (
          <div
            className={`px-8 py-2.5 text-xs font-bold tracking-wider flex items-center justify-center gap-2 border-t ${
              syncNotice.includes("Failed") ||
              syncNotice.includes("401") ||
              syncNotice.includes("missing") ||
              syncNotice.includes("invalid")
                ? "bg-red-900/90 text-red-100 border-red-700"
                : "bg-lime text-forest-deep border-forest-deep"
            }`}
          >
            <Zap className="w-4 h-4 fill-current shrink-0" />
            <span>{syncNotice}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mx-auto max-w-7xl px-4 md:px-8 flex border-t border-cream/15 overflow-x-auto">
          {[
            { id: "analytics", label: "Live Overview & Analytics", icon: TrendingUp },
            { id: "orders", label: `Preorders (${orders.length})`, icon: ShoppingBag },
            { id: "coupons", label: `Coupons & Influencers (${coupons.length})`, icon: Tag },
            { id: "customers", label: "Customer Directory", icon: Users },
          ].map((t) => {
            const Icon = t.icon;
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as typeof activeTab)}
                className={`flex items-center gap-2 px-5 py-3.5 text-xs font-bold tracking-widest uppercase border-b-2 transition-colors shrink-0 ${
                  active
                    ? "border-lime text-lime bg-cream/5"
                    : "border-transparent text-cream/70 hover:text-cream hover:bg-cream/5"
                }`}
              >
                <Icon className="w-4 h-4" />
                {t.label}
              </button>
            );
          })}
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 md:px-8 mt-8 space-y-8">
        {/* KPI Cards Row */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-card border-2 border-forest-deep p-4 space-y-1">
            <div className="text-[10px] tracking-widest uppercase text-muted-foreground font-bold flex items-center justify-between">
              Live Preorder Revenue
              <DollarSign className="w-4 h-4 text-forest" />
            </div>
            <div className="font-varsity text-2xl text-forest-deep">
              GH₵{analytics.totalRevenueGHS.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground font-mono">
              ≈ ${analytics.totalRevenueUSD.toFixed(2)} USD
            </div>
          </div>

          <div className="bg-card border-2 border-forest-deep p-4 space-y-1">
            <div className="text-[10px] tracking-widest uppercase text-muted-foreground font-bold flex items-center justify-between">
              Total Preorders
              <ShoppingBag className="w-4 h-4 text-forest" />
            </div>
            <div className="font-varsity text-2xl text-forest-deep">
              {analytics.totalOrders} Orders
            </div>
            <div className="text-xs text-muted-foreground font-mono">
              {analytics.totalTeesCount} Tees reserved
            </div>
          </div>

          <div className="bg-card border-2 border-forest-deep p-4 space-y-1">
            <div className="text-[10px] tracking-widest uppercase text-muted-foreground font-bold flex items-center justify-between">
              Average Order Value
              <TrendingUp className="w-4 h-4 text-forest" />
            </div>
            <div className="font-varsity text-2xl text-forest-deep">
              GH₵{Math.round(analytics.avgOrderValueGHS).toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground font-mono">
              ≈ ${analytics.avgOrderValueUSD.toFixed(2)} / order
            </div>
          </div>

          <div className="bg-card border-2 border-forest-deep p-4 space-y-1">
            <div className="text-[10px] tracking-widest uppercase text-muted-foreground font-bold flex items-center justify-between">
              Active Coupons
              <Tag className="w-4 h-4 text-forest" />
            </div>
            <div className="font-varsity text-2xl text-forest-deep">
              {coupons.filter((c) => c.active).length} Active
            </div>
            <div className="text-xs text-forest font-bold font-mono">AMA & KOFI live tracking</div>
          </div>

          <div className="bg-forest-deep text-cream border-2 border-forest-deep p-4 space-y-1 col-span-2 lg:col-span-1">
            <div className="text-[10px] tracking-widest uppercase text-cream/70 font-bold flex items-center justify-between">
              Delivery SLA
              <Clock className="w-4 h-4 text-lime" />
            </div>
            <div className="font-varsity text-xl text-lime">3 WORKING DAYS</div>
            <div className="text-[10px] tracking-wider uppercase text-cream/80">
              Jesus Rose on the 3rd Day
            </div>
          </div>
        </div>

        {/* ── TAB 1: OVERVIEW & ANALYTICS ────────────────────────────────────── */}
        {activeTab === "analytics" && (
          <div className="space-y-8">
            <div className="bg-card border-2 border-forest-deep p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 border-b-2 border-forest-deep pb-4">
                <div>
                  <h2 className="font-varsity text-xl text-forest-deep flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-forest" /> LIVE REVENUE TIMELINE
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Real-time daily preorder revenue (GH₵) accumulated across the preorder window.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold font-mono bg-lime/40 border border-forest-deep px-3 py-1.5">
                  Discounts Granted: GH₵{analytics.totalDiscountGHS.toFixed(2)} ($
                  {analytics.totalDiscountUSD.toFixed(2)})
                </div>
              </div>

              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={analytics.timelineData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorGHS" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2d5a3f" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#2d5a3f" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} unit=" GH₵" />
                    <Tooltip
                      formatter={(val: number) => [`GH₵${val.toLocaleString()}`, "Revenue"]}
                      contentStyle={{
                        backgroundColor: "#1b3323",
                        color: "#fbf9f4",
                        borderRadius: "0px",
                        border: "2px solid #1b3323",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenueGHS"
                      stroke="#2d5a3f"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorGHS)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
              {/* Size Breakdown Chart */}
              <div className="bg-card border-2 border-forest-deep p-6">
                <div className="border-b-2 border-forest-deep pb-3 mb-6">
                  <h3 className="font-varsity text-lg text-forest-deep flex items-center gap-2">
                    <Package className="w-5 h-5 text-forest" /> MANUFACTURING SIZE DEMAND
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Preorder quantities by size (S, M, L, XL, XXL).
                  </p>
                </div>

                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.sizeBreakdown}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="size" stroke="#1b3323" fontSize={14} fontWeight="bold" />
                      <YAxis stroke="#64748b" fontSize={12} allowDecimals={false} />
                      <Tooltip
                        formatter={(val: number) => [`${val} Units`, "Quantity"]}
                        contentStyle={{
                          backgroundColor: "#1b3323",
                          color: "#fbf9f4",
                          border: "2px solid #1b3323",
                        }}
                      />
                      <Bar dataKey="count" fill="#2d5a3f" radius={[4, 4, 0, 0]}>
                        {analytics.sizeBreakdown.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={index === 1 || index === 2 ? "#2d5a3f" : "#4a7c59"}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-4 grid grid-cols-5 gap-2 border-t border-forest-deep/20 pt-4 text-center">
                  {analytics.sizeBreakdown.map((s) => (
                    <div key={s.size} className="bg-cream/60 border border-forest-deep p-2">
                      <div className="font-varsity text-lg text-forest-deep">{s.size}</div>
                      <div className="text-xs font-bold text-forest">{s.count} pcs</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Influencer Performance Breakdown */}
              <div className="bg-card border-2 border-forest-deep p-6">
                <div className="border-b-2 border-forest-deep pb-3 mb-6">
                  <h3 className="font-varsity text-lg text-forest-deep flex items-center gap-2">
                    <Tag className="w-5 h-5 text-forest" /> INFLUENCER & COUPON TRACKING
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Live performance metrics for promo codes <strong>AMA</strong>,{" "}
                    <strong>KOFI</strong>, etc.
                  </p>
                </div>

                <div className="space-y-4">
                  {analytics.couponPerformance.map((cp) => {
                    const pct =
                      analytics.totalRevenueGHS > 0
                        ? Math.round((cp.revenueGHS / analytics.totalRevenueGHS) * 100)
                        : 0;
                    const hasCommission = cp.commissionRate > 0 && cp.commissionGHS > 0;
                    return (
                      <div
                        key={cp.code}
                        className={`border-2 p-3.5 space-y-2 ${hasCommission ? "border-lime bg-lime/10" : "border-forest-deep bg-cream/40"}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-varsity text-base px-2 py-0.5 bg-forest-deep text-cream">
                              {cp.code}
                            </span>
                            <div>
                              <div className="text-xs font-bold text-forest-deep">
                                {cp.influencer}
                              </div>
                              {cp.commissionRate > 0 && (
                                <div className="text-[10px] text-forest font-mono">
                                  {cp.commissionRate}% commission rate
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-varsity text-base text-forest-deep">
                              GH₵{cp.revenueGHS.toLocaleString()} ({pct}%)
                            </div>
                            {hasCommission && (
                              <div className="text-[11px] font-bold text-forest bg-lime px-2 py-0.5 mt-0.5 text-right">
                                Owes: GH₵{cp.commissionGHS.toFixed(2)} ($
                                {cp.commissionUSD.toFixed(2)})
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="w-full bg-cream border border-forest-deep h-3">
                          <div
                            className="bg-forest-deep h-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>

                        <div className="flex justify-between text-[11px] text-muted-foreground font-mono pt-1">
                          <span>{cp.orders} Preorders generated</span>
                          <span>Customer savings: GH₵{cp.discountGHS.toFixed(2)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 2: PREORDERS MANAGEMENT ───────────────────────────────────── */}
        {activeTab === "orders" && (
          <div className="bg-card border-2 border-forest-deep p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-forest-deep pb-6">
              <div>
                <h2 className="font-varsity text-2xl text-forest-deep flex items-center gap-2">
                  <ShoppingBag className="w-6 h-6 text-forest" /> PREORDER MANAGEMENT
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Live preorders connected with Paystack payment verification.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => exportOrdersToCSV(filteredOrders)}
                  className="bg-forest-deep text-cream px-3 py-2 text-xs font-bold tracking-wider uppercase border border-forest-deep flex items-center gap-1.5 hover:bg-forest transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-lime" /> Export CSV ({filteredOrders.length}
                  )
                </button>

                <div className="relative flex-1 sm:w-60">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search name, ref, coupon..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border-2 border-forest-deep text-xs font-mono focus:outline-none"
                  />
                </div>

                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="border-2 border-forest-deep px-3 py-2 text-xs font-bold bg-cream uppercase"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="Paid">Paid</option>
                  <option value="In Production">In Production</option>
                  <option value="Shipped">Shipped</option>
                </select>

                <select
                  value={orderCouponFilter}
                  onChange={(e) => setOrderCouponFilter(e.target.value)}
                  className="border-2 border-forest-deep px-3 py-2 text-xs font-bold bg-cream uppercase"
                >
                  <option value="ALL">All Coupons</option>
                  <option value="AMA">Coupon: AMA</option>
                  <option value="KOFI">Coupon: KOFI</option>
                  <option value="JESUSITY10">Coupon: JESUSITY10</option>
                  <option value="NONE">No Coupon (Direct)</option>
                </select>
              </div>
            </div>

            {/* Orders Table */}
            <div className="overflow-x-auto border-2 border-forest-deep">
              <table className="w-full text-left text-xs">
                <thead className="bg-forest-deep text-cream font-varsity tracking-wider text-sm">
                  <tr>
                    <th className="p-3">REF & DATE</th>
                    <th className="p-3">CUSTOMER</th>
                    <th className="p-3">LOCATION</th>
                    <th className="p-3">ITEMS & SIZES</th>
                    <th className="p-3">COUPON</th>
                    <th className="p-3">TOTAL</th>
                    <th className="p-3">STATUS & PAYSTACK</th>
                    <th className="p-3 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-forest-deep/20 font-sans">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-muted-foreground text-sm">
                        No preorders found matching your search.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((o) => (
                      <tr key={o.id} className="hover:bg-cream/60 transition-colors">
                        <td className="p-3">
                          <div className="font-mono font-bold text-forest-deep flex items-center gap-1.5">
                            {o.ref}
                          </div>
                          <div className="text-[10px] text-muted-foreground">
                            {new Date(o.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="font-bold">
                            {o.customer.firstName} {o.customer.lastName}
                          </div>
                          <div className="text-[10px] text-muted-foreground">
                            {o.customer.email}
                          </div>
                          <div className="text-[10px] text-muted-foreground font-mono">
                            {o.customer.phone}
                          </div>
                        </td>
                        <td className="p-3">
                          <div>
                            {o.customer.city}, {o.customer.state}
                          </div>
                          <div className="text-[10px] text-muted-foreground">
                            {o.customer.country}
                          </div>
                        </td>
                        <td className="p-3">
                          {o.items.map((i, idx) => (
                            <span
                              key={idx}
                              className="inline-block bg-cream border border-forest-deep px-1.5 py-0.5 text-[11px] font-bold mr-1 mb-1"
                            >
                              {i.qty}× {i.size}
                            </span>
                          ))}
                        </td>
                        <td className="p-3">
                          {o.couponCode ? (
                            <span className="font-varsity bg-lime text-forest-deep border border-forest-deep px-2 py-0.5 text-xs">
                              {o.couponCode}
                            </span>
                          ) : (
                            <span className="text-muted-foreground text-[10px]">Direct</span>
                          )}
                        </td>
                        <td className="p-3">
                          <div className="font-varsity text-sm font-bold text-forest-deep">
                            GH₵{o.totalGHS.toLocaleString()}
                          </div>
                          <div className="text-[10px] text-muted-foreground font-mono">
                            ${o.totalUSD.toFixed(2)}
                          </div>
                        </td>
                        <td className="p-3 space-y-1">
                          <select
                            value={o.status}
                            onChange={(e) =>
                              ordersStore.updateStatus(o.id, e.target.value as OrderStatus)
                            }
                            className={`border px-2 py-1 text-[11px] font-bold uppercase rounded-none block ${
                              o.status === "Paid"
                                ? "bg-amber-100 text-amber-900 border-amber-400"
                                : o.status === "In Production"
                                  ? "bg-blue-100 text-blue-900 border-blue-400"
                                  : "bg-emerald-100 text-emerald-900 border-emerald-400"
                            }`}
                          >
                            <option value="Paid">Paid</option>
                            <option value="In Production">In Production</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                          </select>
                          <div className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Paystack Verified
                          </div>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => setSelectedOrder(o)}
                            className="bg-forest-deep text-cream hover:bg-forest px-2.5 py-1 text-[11px] font-bold uppercase flex items-center gap-1 ml-auto"
                          >
                            <Eye className="w-3 h-3" /> View
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TAB 3: COUPONS & INFLUENCERS ────────────────────────────────────── */}
        {activeTab === "coupons" && (
          <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
            <div className="bg-card border-2 border-forest-deep p-6 space-y-6">
              <div className="border-b-2 border-forest-deep pb-4">
                <h2 className="font-varsity text-2xl text-forest-deep flex items-center gap-2">
                  <Tag className="w-5 h-5 text-forest" /> INFLUENCER PROMO CODES
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Manage active coupon codes like <strong>AMA</strong> and <strong>KOFI</strong>.
                </p>
              </div>

              <div className="space-y-4">
                {coupons.map((c) => {
                  const ordersForCoupon = orders.filter(
                    (o) => o.couponCode?.toUpperCase() === c.code.toUpperCase(),
                  );
                  const revenueGHS = ordersForCoupon.reduce((sum, o) => sum + o.totalGHS, 0);
                  const commissionOwedGHS =
                    Math.round(revenueGHS * ((c.commissionRate ?? 0) / 100) * 100) / 100;

                  return (
                    <div key={c.code} className="border-2 border-forest-deep p-4 bg-cream/40">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-varsity text-xl bg-forest-deep text-lime px-3 py-1">
                              {c.code}
                            </span>
                            <span className="bg-lime text-forest-deep font-bold text-xs px-2 py-1 border border-forest-deep">
                              {c.value}% OFF
                            </span>
                            {(c.commissionRate ?? 0) > 0 && (
                              <span className="bg-forest text-cream font-bold text-xs px-2 py-1 border border-forest-deep">
                                {c.commissionRate}% Commission
                              </span>
                            )}
                            <span
                              className={`text-[10px] font-bold uppercase px-2 py-0.5 border ${c.active ? "bg-emerald-100 text-emerald-800 border-emerald-300" : "bg-red-100 text-red-800 border-red-300"}`}
                            >
                              {c.active ? "Active" : "Inactive"}
                            </span>
                          </div>
                          <div className="text-xs font-bold text-forest-deep">
                            {c.influencerName}
                          </div>
                          <div className="text-xs text-muted-foreground">{c.description}</div>
                        </div>

                        <div className="flex items-center gap-6 sm:border-l-2 sm:border-forest-deep/20 sm:pl-6 shrink-0">
                          <div className="text-right">
                            <div className="font-varsity text-lg text-forest-deep">
                              GH₵{revenueGHS.toLocaleString()}
                            </div>
                            <div className="text-xs font-mono text-muted-foreground">
                              {ordersForCoupon.length} orders driven
                            </div>
                            {commissionOwedGHS > 0 && (
                              <div className="mt-1 text-[11px] font-bold text-forest bg-lime px-2 py-0.5">
                                Commission Due: GH₵{commissionOwedGHS.toFixed(2)}
                              </div>
                            )}
                          </div>

                          <button
                            onClick={() => couponStore.toggleActive(c.code)}
                            className={`px-3 py-1.5 text-xs font-bold tracking-wider uppercase border-2 transition-colors ${
                              c.active
                                ? "bg-red-50 text-destructive border-destructive hover:bg-destructive hover:text-white"
                                : "bg-forest-deep text-lime border-forest-deep hover:bg-forest"
                            }`}
                          >
                            {c.active ? "Deactivate" : "Activate"}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Create Coupon Form */}
            <div className="bg-card border-2 border-forest-deep p-6 space-y-6 self-start">
              <div className="border-b-2 border-forest-deep pb-4">
                <h3 className="font-varsity text-xl text-forest-deep flex items-center gap-2">
                  <Plus className="w-5 h-5 text-forest" /> CREATE NEW PROMO CODE
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Add custom influencer codes for new campaign partners.
                </p>
              </div>

              {couponSuccessMsg && (
                <div className="bg-emerald-50 border-2 border-emerald-500 p-3 text-xs text-emerald-800 font-bold flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  {couponSuccessMsg}
                </div>
              )}

              <form onSubmit={handleCreateCoupon} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold tracking-widest uppercase text-muted-foreground mb-1">
                    Coupon Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. KWAME20"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                    className="w-full border-2 border-forest-deep p-2.5 text-xs font-mono tracking-wider focus:outline-none uppercase"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold tracking-widest uppercase text-muted-foreground mb-1">
                      Discount Value *
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={100}
                      value={newValue}
                      onChange={(e) => setNewValue(Number(e.target.value))}
                      className="w-full border-2 border-forest-deep p-2.5 text-xs focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold tracking-widest uppercase text-muted-foreground mb-1">
                      Discount Type
                    </label>
                    <select
                      value={newType}
                      onChange={(e) => setNewType(e.target.value as typeof newType)}
                      className="w-full border-2 border-forest-deep p-2.5 text-xs font-bold bg-cream"
                    >
                      <option value="FIXED_GHS">Fixed Cedis Off (GH₵)</option>
                      <option value="PERCENT">% Percentage</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold tracking-widest uppercase text-muted-foreground mb-1">
                    Commission Rate % (Influencer Earns)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={50}
                    value={newCommissionRate}
                    onChange={(e) => setNewCommissionRate(Number(e.target.value))}
                    className="w-full border-2 border-forest-deep p-2.5 text-xs focus:outline-none"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">
                    e.g. 10 = influencer earns 10% of every sale they drive. Set 0 for brand promos.
                  </p>
                </div>

                <div>
                  <label className="block text-[11px] font-bold tracking-widest uppercase text-muted-foreground mb-1">
                    Influencer / Partner Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kwame Mensah"
                    value={newInfluencer}
                    onChange={(e) => setNewInfluencer(e.target.value)}
                    className="w-full border-2 border-forest-deep p-2.5 text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold tracking-widest uppercase text-muted-foreground mb-1">
                    Internal Description
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Kwame's Instagram campaign code"
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    className="w-full border-2 border-forest-deep p-2.5 text-xs focus:outline-none"
                  />
                </div>

                <button type="submit" className="btn-drop w-full !py-3 text-xs">
                  Save & Publish Coupon
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ── TAB 4: CUSTOMER DIRECTORY ───────────────────────────────────────── */}
        {activeTab === "customers" && (
          <div className="bg-card border-2 border-forest-deep p-6 space-y-6">
            <div className="border-b-2 border-forest-deep pb-4 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
              <div>
                <h2 className="font-varsity text-2xl text-forest-deep flex items-center gap-2">
                  <Users className="w-5 h-5 text-forest" /> CUSTOMER DIRECTORY
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Consolidated buyer profiles and contact history.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => exportOrdersToCSV(orders)}
                  className="bg-forest-deep text-cream px-3 py-1.5 text-xs font-bold tracking-wider uppercase border border-forest-deep flex items-center gap-1.5 hover:bg-forest transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-lime" /> Export Customer CSV
                </button>
              </div>
            </div>

            <div className="overflow-x-auto border-2 border-forest-deep">
              <table className="w-full text-left text-xs">
                <thead className="bg-forest-deep text-cream font-varsity tracking-wider text-sm">
                  <tr>
                    <th className="p-3">NAME</th>
                    <th className="p-3">EMAIL</th>
                    <th className="p-3">PHONE</th>
                    <th className="p-3">SHIPPING CITY</th>
                    <th className="p-3">ORDERS</th>
                    <th className="p-3 text-right">TOTAL SPENT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-forest-deep/20 font-sans">
                  {orders.map((o) => (
                    <tr key={o.id} className="hover:bg-cream/60">
                      <td className="p-3 font-bold text-forest-deep">
                        {o.customer.firstName} {o.customer.lastName}
                      </td>
                      <td className="p-3 font-mono">{o.customer.email}</td>
                      <td className="p-3 font-mono">{o.customer.phone}</td>
                      <td className="p-3">
                        {o.customer.city}, {o.customer.country}
                      </td>
                      <td className="p-3 font-bold">1 order</td>
                      <td className="p-3 text-right font-varsity text-sm font-bold text-forest-deep">
                        GH₵{o.totalGHS.toLocaleString()} (${o.totalUSD.toFixed(2)})
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Selected Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-forest-deep/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-cream border-2 border-forest-deep w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b-2 border-forest-deep pb-4">
              <div>
                <div className="text-[10px] tracking-widest uppercase text-muted-foreground">
                  PREORDER DETAILS
                </div>
                <h3 className="font-mono text-xl font-bold text-forest-deep">
                  {selectedOrder.ref}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 hover:bg-forest-deep/10 border border-forest-deep"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="bg-card border border-forest-deep p-3 space-y-1">
                <div className="font-varsity text-forest-deep">CUSTOMER</div>
                <div className="font-bold">
                  {selectedOrder.customer.firstName} {selectedOrder.customer.lastName}
                </div>
                <div>{selectedOrder.customer.email}</div>
                <div className="font-mono">{selectedOrder.customer.phone}</div>
              </div>

              <div className="bg-card border border-forest-deep p-3 space-y-1">
                <div className="font-varsity text-forest-deep">SHIPPING ADDRESS</div>
                <div>{selectedOrder.customer.address}</div>
                <div>
                  {selectedOrder.customer.city}, {selectedOrder.customer.state}{" "}
                  {selectedOrder.customer.zip}
                </div>
                <div>{selectedOrder.customer.country}</div>
              </div>
            </div>

            <div className="border border-forest-deep/30 p-3 bg-cream/40">
              <div className="font-varsity text-xs tracking-wider mb-2">ORDERED ITEMS</div>
              <div className="space-y-2">
                {selectedOrder.items.map((i, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs">
                    <span className="font-bold">
                      {i.name} — Size {i.size} ×{i.qty}
                    </span>
                    <span>
                      ${i.priceUSD * i.qty} (GH₵{i.priceGHS * i.qty})
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-1 text-xs border-t border-forest-deep pt-3">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>
                  GH₵{selectedOrder.subtotalGHS} (${selectedOrder.subtotalUSD})
                </span>
              </div>
              {selectedOrder.discountGHS > 0 && (
                <div className="flex justify-between text-forest font-bold">
                  <span>Coupon Discount ({selectedOrder.couponCode})</span>
                  <span>
                    −GH₵{selectedOrder.discountGHS} (−${selectedOrder.discountUSD.toFixed(2)})
                  </span>
                </div>
              )}
              <div className="flex justify-between font-varsity text-base font-bold text-forest-deep pt-2 border-t border-forest-deep/20">
                <span>Total Paid</span>
                <span>
                  GH₵{selectedOrder.totalGHS.toLocaleString()} (${selectedOrder.totalUSD.toFixed(2)}
                  )
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={() => setSelectedOrder(null)}
                className="btn-drop !py-2.5 !px-5 text-xs"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
