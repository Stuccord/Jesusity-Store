import { createFileRoute, Link } from "@tanstack/react-router";
import { useCart, useAppliedCoupon, cart, cartTotalsWithCoupon } from "@/lib/cart-store";
import { PRODUCT } from "@/lib/product";
import { Minus, Plus, Trash2, ArrowRight, Tag, Check, AlertCircle } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Bag — Jesusity" },
      { name: "description", content: "Review your Jesusity order before checkout." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const items = useCart();
  const appliedCoupon = useAppliedCoupon();
  const totals = cartTotalsWithCoupon(items, PRODUCT.priceGHS, appliedCoupon);

  const [couponInput, setCouponInput] = useState("");
  const [couponMsg, setCouponMsg] = useState<{ type: "success" | "error"; text: string } | null>(
    null,
  );

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

  if (items.length === 0) {
    return (
      <section className="mx-auto max-w-3xl px-4 md:px-8 py-24 text-center">
        <div className="font-hero text-6xl text-forest-deep">Your bag's empty.</div>
        <p className="mt-4 text-foreground/70">The pursuit starts with a click.</p>
        <Link to="/" className="btn-drop mt-8">
          Back to the Drop
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-4 md:px-8 py-12 md:py-16 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
      <div>
        <h1 className="font-varsity text-4xl md:text-5xl">YOUR BAG</h1>
        <div className="mt-8 divide-y-2 divide-forest-deep border-y-2 border-forest-deep">
          {items.map((it) => (
            <div key={it.id + it.size} className="grid grid-cols-[80px_1fr_auto] gap-4 py-5">
              <img src={it.image} alt="" className="w-20 h-24 object-cover border border-border" />
              <div>
                <div className="font-varsity text-lg">{it.name}</div>
                <div className="text-[11px] tracking-widest uppercase text-muted-foreground mt-1">
                  {PRODUCT.colorway} · Size {it.size}
                </div>
                <div className="mt-3 inline-flex items-center border-2 border-forest-deep">
                  <button
                    onClick={() => cart.updateQty(it.id, it.size, it.qty - 1)}
                    className="p-2"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="px-3 text-sm font-bold">{it.qty}</span>
                  <button
                    onClick={() => cart.updateQty(it.id, it.size, it.qty + 1)}
                    className="p-2"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <div className="text-right">
                <div className="font-varsity text-xl">${it.price * it.qty}</div>
                <button
                  onClick={() => cart.remove(it.id, it.size)}
                  className="mt-3 text-muted-foreground hover:text-destructive"
                  aria-label="Remove"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <aside className="lg:sticky lg:top-24 self-start border-2 border-forest-deep p-6 bg-card space-y-6">
        <div className="font-varsity text-2xl">SUMMARY</div>

        {/* Promo Code box */}
        <div className="border-2 border-forest-deep p-4 bg-cream/60 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-forest-deep">
            <span className="flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-forest" /> Promo / Coupon Code
            </span>
            <span className="text-[10px] text-muted-foreground font-normal">AMA, KOFI</span>
          </div>
          {appliedCoupon ? (
            <div className="flex items-center justify-between bg-lime/40 border-2 border-forest-deep p-2.5 text-xs font-medium">
              <div className="flex items-center gap-2 text-forest-deep font-bold">
                <Check className="w-4 h-4 text-forest" />
                <span>{appliedCoupon.code} Applied</span>
                <span className="text-[11px] font-normal text-forest-deep/80">
                  ({appliedCoupon.value}% OFF)
                </span>
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
                placeholder="Enter AMA or KOFI"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                className="flex-1 border-2 border-forest-deep px-3 py-2 text-xs font-mono tracking-wider focus:outline-none focus:ring-1 focus:ring-forest-deep uppercase"
              />
              <button
                type="submit"
                className="bg-forest-deep text-cream text-xs px-4 font-bold hover:bg-forest transition-colors"
              >
                Apply
              </button>
            </form>
          )}
          {couponMsg && (
            <p
              className={`text-xs flex items-center gap-1.5 ${couponMsg.type === "success" ? "text-forest font-semibold" : "text-destructive"}`}
            >
              {couponMsg.type === "error" && <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
              {couponMsg.text}
            </p>
          )}
        </div>

        <div className="space-y-2 text-sm border-t-2 border-forest-deep pt-4">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>${totals.subtotalUSD}</span>
          </div>
          {totals.discountUSD > 0 && (
            <div className="flex justify-between text-forest font-bold">
              <span>Discount ({appliedCoupon?.code})</span>
              <span>-${totals.discountUSD.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Shipping</span>
            <span>Calculated at checkout</span>
          </div>
        </div>

        <div className="border-t-2 border-forest-deep pt-4 flex justify-between items-baseline">
          <span className="font-varsity text-xl">Total</span>
          <span className="font-varsity text-3xl text-forest-deep">
            ${totals.finalUSD.toFixed(2)}
          </span>
        </div>

        <div className="bg-lime border-2 border-forest-deep p-3 text-xs tracking-widest uppercase font-bold">
          Delivers in {PRODUCT.shipEstimate}
        </div>

        <Link to="/checkout" className="btn-drop w-full">
          Checkout <ArrowRight className="w-4 h-4" />
        </Link>
      </aside>
    </section>
  );
}
