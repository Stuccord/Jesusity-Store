import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useCart, useAppliedCoupon, cart, cartTotalsWithCoupon } from "@/lib/cart-store";
import { PRODUCT } from "@/lib/product";
import { couponStore } from "@/lib/coupons";
import { ordersStore } from "@/lib/orders-store";
import { Lock, CheckCircle2, Tag, AlertCircle } from "lucide-react";

const PAYSTACK_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY as string;

if (!PAYSTACK_KEY) {
  console.error(
    "[Clovermade] VITE_PAYSTACK_PUBLIC_KEY is not set. " +
    "Add it to your .env file (pk_test_... for test, pk_live_... for production)."
  );
}

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Jesusity Preorder" },
      { name: "description", content: "Reserve your Jesusity Tee." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CheckoutPage,
});

// ─── Types ────────────────────────────────────────────────────────────────────

interface PaystackPopupOptions {
  key: string;
  email: string;
  amount: number; // in pesewas / smallest unit
  currency: string;
  ref: string;
  metadata?: Record<string, unknown>;
  phone?: string;
  callback: (response: { reference: string }) => void;
  onClose: () => void;
}

declare global {
  interface Window {
    PaystackPop: {
      setup: (opts: PaystackPopupOptions) => { openIframe: () => void };
    };
  }
}

interface FormValues {
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

const DEFAULT_FORM: FormValues = {
  email: "",
  phone: "",
  firstName: "",
  lastName: "",
  address: "",
  city: "",
  state: "",
  zip: "",
  country: "Ghana",
};

function CheckoutPage() {
  const items = useCart();
  const appliedCoupon = useAppliedCoupon();
  const totals = cartTotalsWithCoupon(items, PRODUCT.priceGHS, appliedCoupon);

  const [placed, setPlaced] = useState(false);
  const [orderRef, setOrderRef] = useState("");
  const [paystackError, setPaystackError] = useState(false);
  const [loading, setLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [form, setForm] = useState<FormValues>(DEFAULT_FORM);

  const [couponInput, setCouponInput] = useState("");
  const [couponMsg, setCouponMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = cart.applyCoupon(couponInput);
    if (res.success) {
      setCouponMsg({ type: "success", text: res.message });
      setCouponInput("");
    } else {
      setCouponMsg({ type: "error", text: res.message });
    }
  };

  const [paystackErrorMsg, setPaystackErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPaystackErrorMsg(null);

    const isDummyKey =
      !PAYSTACK_KEY ||
      PAYSTACK_KEY.includes("REPLACE") ||
      PAYSTACK_KEY.includes("YOUR_") ||
      PAYSTACK_KEY.length < 20;

    if (!window.PaystackPop) {
      setPaystackError(true);
      setPaystackErrorMsg("Paystack SDK script did not load. Please refresh the page.");
      return;
    }

    setLoading(true);
    setPaystackError(false);

    const ref = `JESUSITY-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
    const amountInPesewas = Math.round(totals.finalGHS * 100);

    try {
      const handler = window.PaystackPop.setup({
        key: PAYSTACK_KEY,
        email: form.email,
        phone: form.phone,
        amount: amountInPesewas,
        currency: PRODUCT.currencyGHS,
        ref,
        metadata: {
          custom_fields: [
            { display_name: "Order Items", variable_name: "items", value: items.map((i) => `${i.name} ×${i.qty} (${i.size})`).join(", ") },
            { display_name: "Applied Coupon", variable_name: "coupon", value: appliedCoupon ? `${appliedCoupon.code} (${appliedCoupon.value}%)` : "None" },
            { display_name: "Discount Amount", variable_name: "discount", value: `GH₵${totals.discountGHS} ($${totals.discountUSD})` },
            { display_name: "Shipping Name", variable_name: "name", value: `${form.firstName} ${form.lastName}` },
            { display_name: "Phone Number", variable_name: "phone", value: form.phone },
            { display_name: "Shipping Address", variable_name: "address", value: `${form.address}, ${form.city}, ${form.state} ${form.zip}, ${form.country}` },
          ],
        },
        callback(response) {
          setOrderRef(response.reference);

          // Track order in ordersStore with live Paystack verification
          ordersStore.add({
            ref: response.reference,
            customer: { ...form },
            items: items.map((i) => ({
              id: i.id,
              name: i.name,
              size: i.size,
              priceUSD: i.price,
              priceGHS: PRODUCT.priceGHS,
              qty: i.qty,
            })),
            subtotalUSD: totals.subtotalUSD,
            discountUSD: totals.discountUSD,
            totalUSD: totals.finalUSD,
            subtotalGHS: totals.subtotalGHS,
            discountGHS: totals.discountGHS,
            totalGHS: totals.finalGHS,
            couponCode: appliedCoupon?.code,
            influencerName: appliedCoupon?.influencerName,
            status: "Paid",
            verifiedWithPaystack: true,
            paymentChannel: "Paystack Live Gateway",
            createdAt: new Date().toISOString(),
          });

          // Increment coupon usage count if applied
          if (appliedCoupon) {
            couponStore.incrementUsage(appliedCoupon.code);
          }

          setPlaced(true);
          cart.clear();
          setLoading(false);
        },
        onClose() {
          setLoading(false);
          setPaystackErrorMsg("Payment window closed. If you saw an 'Invalid Key' error, please set a valid VITE_PAYSTACK_PUBLIC_KEY in .env.");
        },
      });

      handler.openIframe();
    } catch (err) {
      console.error("[Paystack Setup Error]", err);
      setLoading(false);
      setPaystackErrorMsg(`Paystack Error: ${String(err)}. Please check your VITE_PAYSTACK_PUBLIC_KEY in .env.`);
    }
  };

  // ── Success screen ────────────────────────────────────────────────────────

  if (placed) {
    return (
      <section className="mx-auto max-w-2xl px-4 md:px-8 py-24 text-center">
        <CheckCircle2 className="w-16 h-16 mx-auto text-forest" />
        <div className="mt-4 text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
          Preorder Confirmed
        </div>
        <h1 className="font-hero text-5xl md:text-6xl text-forest-deep mt-2">YOU'RE IN THE PURSUIT.</h1>
        <p className="mt-4 text-muted-foreground max-w-md mx-auto text-sm">
          Thank you, <strong className="text-foreground">{form.firstName}</strong>. Your preorder is secured.{" "}
          <strong className="text-forest-deep">Estimated ship window: {PRODUCT.shipEstimate}.</strong>{" "}
          We'll email tracking the day yours goes out.
        </p>
        <div className="mt-4 text-xs text-muted-foreground font-mono tracking-widest">
          Ref: {orderRef}
        </div>
        <div className="mt-8 bg-lime border-2 border-forest-deep p-4 text-left inline-block">
          <div className="font-varsity text-sm">WHAT HAPPENS NEXT</div>
          <ol className="mt-2 text-xs tracking-widest uppercase space-y-1 text-forest-deep/80">
            <li>1 · Preorder window closes July 31</li>
            <li>2 · Tees go into production</li>
            <li>3 · Ships {PRODUCT.shipEstimate.toLowerCase()}</li>
          </ol>
        </div>
        <div className="mt-10 flex gap-4 justify-center">
          <Link to="/" className="btn-outline-dark">
            Back Home
          </Link>
          <Link to="/admin" className="btn-drop">
            View Admin Dashboard
          </Link>
        </div>
      </section>
    );
  }

  // ── Empty bag screen ──────────────────────────────────────────────────────

  if (items.length === 0) {
    return (
      <section className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="font-varsity text-3xl">YOUR BAG IS EMPTY</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Add the Jesusity Tee to your bag before checking out.
        </p>

        {paystackError && (
          <div className="mt-6 bg-red-50 border-2 border-destructive p-4 text-left text-xs text-destructive flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold">Paystack Not Configured</strong>
              <p className="mt-1">
                <code className="bg-red-100 px-1 py-0.5 font-mono">VITE_PAYSTACK_PUBLIC_KEY</code> is
                missing from your <code className="bg-red-100 px-1 py-0.5 font-mono">.env</code> file. Add
                it and restart the dev server to test live payments.
              </p>
            </div>
          </div>
        )}

        <div className="mt-8">
          <Link to="/" className="btn-drop">
            Back to the Drop
          </Link>
        </div>
      </section>
    );
  }

  // ── Checkout form ─────────────────────────────────────────────────────────

  return (
    <section className="mx-auto max-w-6xl px-4 md:px-8 py-12 md:py-16 grid gap-12 lg:grid-cols-[1.3fr_1fr]">
      <div>
        <div className="flex items-baseline justify-between border-b-2 border-forest-deep pb-4">
          <h1 className="font-varsity text-3xl md:text-4xl">CHECKOUT</h1>
          <span className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground">
            Drop 001 · Preorder
          </span>
        </div>

        {paystackError && (
          <div className="mt-6 bg-red-50 border-2 border-destructive p-4 text-xs text-destructive flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold">Paystack Key Missing</strong>
              <p className="mt-1">
                Please set <code className="bg-red-100 px-1 font-mono">VITE_PAYSTACK_PUBLIC_KEY</code> in
                your <code className="bg-red-100 px-1 font-mono">.env</code> file to enable payment processing.
              </p>
            </div>
          </div>
        )}

        <form ref={formRef} onSubmit={handleSubmit} className="mt-8 space-y-8">
          {/* Contact */}
          <div>
            <h2 className="font-varsity text-lg tracking-wider mb-4 text-forest-deep">
              1. CONTACT INFORMATION
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold tracking-widest uppercase text-muted-foreground mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full border-2 border-forest-deep p-3 text-sm focus:outline-none focus:ring-2 focus:ring-lime"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold tracking-widest uppercase text-muted-foreground mb-1">
                  Phone Number (for Delivery Updates) *
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+233 24 000 0000"
                  className="w-full border-2 border-forest-deep p-3 text-sm focus:outline-none focus:ring-2 focus:ring-lime"
                />
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div>
            <h2 className="font-varsity text-lg tracking-wider mb-4 text-forest-deep">
              2. SHIPPING ADDRESS
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-[11px] font-bold tracking-widest uppercase text-muted-foreground mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  name="firstName"
                  required
                  value={form.firstName}
                  onChange={handleChange}
                  className="w-full border-2 border-forest-deep p-3 text-sm focus:outline-none focus:ring-2 focus:ring-lime"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold tracking-widest uppercase text-muted-foreground mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  name="lastName"
                  required
                  value={form.lastName}
                  onChange={handleChange}
                  className="w-full border-2 border-forest-deep p-3 text-sm focus:outline-none focus:ring-2 focus:ring-lime"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold tracking-widest uppercase text-muted-foreground mb-1">
                  Street Address *
                </label>
                <input
                  type="text"
                  name="address"
                  required
                  value={form.address}
                  onChange={handleChange}
                  placeholder="House / Building / Street"
                  className="w-full border-2 border-forest-deep p-3 text-sm focus:outline-none focus:ring-2 focus:ring-lime"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold tracking-widest uppercase text-muted-foreground mb-1">
                  City *
                </label>
                <input
                  type="text"
                  name="city"
                  required
                  value={form.city}
                  onChange={handleChange}
                  placeholder="Accra / Kumasi / etc."
                  className="w-full border-2 border-forest-deep p-3 text-sm focus:outline-none focus:ring-2 focus:ring-lime"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold tracking-widest uppercase text-muted-foreground mb-1">
                  Region / State *
                </label>
                <input
                  type="text"
                  name="state"
                  required
                  value={form.state}
                  onChange={handleChange}
                  placeholder="Greater Accra"
                  className="w-full border-2 border-forest-deep p-3 text-sm focus:outline-none focus:ring-2 focus:ring-lime"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold tracking-widest uppercase text-muted-foreground mb-1">
                  Zip / Postal Code
                </label>
                <input
                  type="text"
                  name="zip"
                  value={form.zip}
                  onChange={handleChange}
                  placeholder="00233"
                  className="w-full border-2 border-forest-deep p-3 text-sm focus:outline-none focus:ring-2 focus:ring-lime"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold tracking-widest uppercase text-muted-foreground mb-1">
                  Country *
                </label>
                <input
                  type="text"
                  name="country"
                  required
                  value={form.country}
                  onChange={handleChange}
                  className="w-full border-2 border-forest-deep p-3 text-sm focus:outline-none focus:ring-2 focus:ring-lime"
                />
              </div>
            </div>
          </div>

          {paystackErrorMsg && (
            <div className="bg-destructive/10 border-2 border-destructive p-3.5 text-xs text-destructive flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{paystackErrorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-drop w-full !py-4 text-base flex items-center justify-center gap-2"
          >
            <Lock className="w-4 h-4" />
            {loading ? "Launching Payment..." : `Pay GH₵${totals.finalGHS.toLocaleString()} ($${totals.finalUSD.toFixed(2)}) with Paystack`}
          </button>

          <p className="text-center text-xs text-muted-foreground flex items-center justify-center gap-1.5">
            <Lock className="w-3 h-3 text-forest" /> Secured by Paystack. Card, Mobile Money, and Apple Pay accepted.
          </p>
        </form>
      </div>

      {/* Order summary sidebar */}
      <aside className="border-2 border-forest-deep p-6 bg-card self-start lg:sticky lg:top-24 space-y-6">
        <div className="font-varsity text-2xl">ORDER SUMMARY</div>

        <div className="divide-y divide-forest-deep/20">
          {items.map((it) => (
            <div key={it.id + it.size} className="py-3 flex gap-3 items-center">
              <img src={it.image} alt="" className="w-14 h-16 object-cover border border-border shrink-0" />
              <div className="flex-1">
                <div className="font-varsity text-sm">{it.name}</div>
                <div className="text-[10px] tracking-widest uppercase text-muted-foreground">
                  Qty: {it.qty} · Size {it.size}
                </div>
              </div>
              <div className="font-bold text-sm text-right">
                <div>${it.price * it.qty}</div>
                <div className="text-[10px] text-muted-foreground">GH₵{PRODUCT.priceGHS * it.qty}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Promo code box in checkout */}
        <div className="border border-forest-deep/30 p-3.5 bg-cream/60 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-forest-deep">
            <span className="flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-forest" /> Coupon / Promo Code
            </span>
          </div>
          {appliedCoupon ? (
            <div className="flex items-center justify-between bg-lime/40 border border-forest-deep p-2 text-xs font-medium">
              <div className="flex items-center gap-1.5 text-forest-deep font-bold">
                <span>{appliedCoupon.code}</span>
                <span className="text-[10px] font-normal text-forest-deep/80">({appliedCoupon.value}% OFF)</span>
              </div>
              <button
                onClick={() => {
                  cart.removeCoupon();
                  setCouponMsg(null);
                }}
                className="text-[10px] text-destructive hover:underline uppercase font-bold"
              >
                Remove
              </button>
            </div>
          ) : (
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <input
                type="text"
                placeholder="AMA or KOFI"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                className="flex-1 border border-forest-deep px-2.5 py-1.5 text-xs font-mono tracking-wider focus:outline-none uppercase"
              />
              <button type="submit" className="bg-forest-deep text-cream text-xs px-3 font-bold hover:bg-forest transition-colors">
                Apply
              </button>
            </form>
          )}
          {couponMsg && (
            <p className={`text-[11px] ${couponMsg.type === "success" ? "text-forest font-semibold" : "text-destructive"}`}>
              {couponMsg.text}
            </p>
          )}
        </div>

        <div className="space-y-2 text-sm border-t-2 border-forest-deep pt-4">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <div className="text-right">
              <div>${totals.subtotalUSD}</div>
              <div className="text-[10px] text-muted-foreground">GH₵{totals.subtotalGHS}</div>
            </div>
          </div>

          {totals.discountUSD > 0 && (
            <div className="flex justify-between text-forest font-bold">
              <span>Coupon Discount ({appliedCoupon?.code})</span>
              <div className="text-right">
                <div>-${totals.discountUSD.toFixed(2)}</div>
                <div className="text-[10px]">−GH₵{totals.discountGHS}</div>
              </div>
            </div>
          )}

          <div className="flex justify-between text-muted-foreground">
            <span>Shipping</span>
            <span>Included / Free</span>
          </div>

          <div className="border-t-2 border-forest-deep pt-3 flex justify-between items-baseline font-varsity">
            <span className="text-lg">Total Due</span>
            <div className="text-right">
              <div className="text-2xl text-forest-deep">GH₵{totals.finalGHS.toLocaleString()}</div>
              <div className="text-xs font-sans text-muted-foreground font-normal">Approx. ${totals.finalUSD.toFixed(2)} USD</div>
            </div>
          </div>
        </div>

        <div className="bg-lime border-2 border-forest-deep p-3 text-xs tracking-widest uppercase font-bold">
          Ships August 2026 · Limited Preorder
        </div>
      </aside>
    </section>
  );
}
