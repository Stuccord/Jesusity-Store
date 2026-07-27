import { Link } from "@tanstack/react-router";
import { X, Minus, Plus, Trash2, Tag, Check, AlertCircle } from "lucide-react";
import { useCart, useAppliedCoupon, cart, cartTotalsWithCoupon } from "@/lib/cart-store";
import { PRODUCT } from "@/lib/product";
import { useState } from "react";

export function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const items = useCart();
  const appliedCoupon = useAppliedCoupon();
  const totals = cartTotalsWithCoupon(items, PRODUCT.priceGHS, appliedCoupon);

  const [couponInput, setCouponInput] = useState("");
  const [couponMsg, setCouponMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

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

  return (
    <div
      className={`fixed inset-0 z-50 transition-opacity ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
      aria-hidden={!open}
    >
      <div className="absolute inset-0 bg-forest-deep/60" onClick={onClose} />
      <aside
        className={`absolute right-0 top-0 h-full w-full sm:w-[420px] bg-cream border-l-2 border-forest-deep flex flex-col transition-transform ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b-2 border-forest-deep bg-forest-deep text-cream">
          <div>
            <div className="font-varsity text-lg leading-none">YOUR BAG</div>
            <div className="text-[10px] tracking-[0.25em] uppercase text-cream/70 mt-1">
              Preorder Drop 001
            </div>
          </div>
          <button onClick={onClose} aria-label="Close cart" className="p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-16">
              <div className="font-varsity text-2xl text-forest-deep">Bag's empty.</div>
              <p className="text-sm text-muted-foreground mt-2 max-w-[240px]">
                Nothing to pursue yet. The drop closes soon — grab yours before it's gone.
              </p>
              <button
                onClick={onClose}
                className="btn-drop mt-6 !py-3 !px-6 text-xs"
              >
                Shop the Drop
              </button>
            </div>
          ) : (
            items.map((it) => (
              <div
                key={it.id + it.size}
                className="flex gap-3 border-2 border-forest-deep bg-card p-3"
              >
                <img src={it.image} alt="" className="w-20 h-24 object-cover" />
                <div className="flex-1">
                  <div className="font-varsity text-sm">{it.name}</div>
                  <div className="text-[10px] tracking-widest uppercase text-muted-foreground mt-0.5">
                    {PRODUCT.colorway} · Size {it.size}
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="inline-flex items-center border-2 border-forest-deep">
                      <button
                        onClick={() => cart.updateQty(it.id, it.size, it.qty - 1)}
                        className="p-1.5"
                        aria-label="Decrease"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 text-xs font-bold">{it.qty}</span>
                      <button
                        onClick={() => cart.updateQty(it.id, it.size, it.qty + 1)}
                        className="p-1.5"
                        aria-label="Increase"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="text-sm font-bold">${it.price * it.qty}</div>
                  </div>
                </div>
                <button
                  onClick={() => cart.remove(it.id, it.size)}
                  aria-label="Remove"
                  className="text-muted-foreground hover:text-destructive self-start"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t-2 border-forest-deep p-5 space-y-4 bg-card">
            {/* Promo Code Input */}
            <div className="border border-forest-deep/30 p-3 bg-cream/50 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-forest-deep">
                <span className="flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-forest" /> Promo / Coupon Code
                </span>
                <span className="text-[10px] text-muted-foreground font-normal">Try: AMA, KOFI</span>
              </div>
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-lime/30 border border-forest-deep p-2 text-xs font-medium">
                  <div className="flex items-center gap-1.5 text-forest-deep font-bold">
                    <Check className="w-3.5 h-3.5 text-forest" />
                    <span>{appliedCoupon.code}</span>
                    <span className="text-[10px] font-normal text-muted-foreground">({appliedCoupon.value}% OFF)</span>
                  </div>
                  <button
                    onClick={() => {
                      cart.removeCoupon();
                      setCouponMsg(null);
                    }}
                    className="text-[10px] text-destructive underline uppercase font-bold"
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
                    className="flex-1 border border-forest-deep px-2.5 py-1.5 text-xs font-mono tracking-wider focus:outline-none focus:ring-1 focus:ring-forest-deep uppercase"
                  />
                  <button type="submit" className="bg-forest-deep text-cream text-xs px-3 font-bold hover:bg-forest transition-colors">
                    Apply
                  </button>
                </form>
              )}
              {couponMsg && (
                <p className={`text-[11px] flex items-center gap-1 ${couponMsg.type === "success" ? "text-forest font-semibold" : "text-destructive"}`}>
                  {couponMsg.type === "error" && <AlertCircle className="w-3 h-3 shrink-0" />}
                  {couponMsg.text}
                </p>
              )}
            </div>

            <div className="text-[11px] tracking-[0.2em] uppercase text-forest-deep bg-lime border-2 border-forest-deep px-3 py-2">
              Preorder · {PRODUCT.shipEstimate}
            </div>

            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${totals.subtotalUSD}</span>
              </div>
              {totals.discountUSD > 0 && (
                <div className="flex justify-between text-forest font-medium">
                  <span>Discount ({appliedCoupon?.code})</span>
                  <span>-${totals.discountUSD.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between items-baseline pt-2 border-t border-forest-deep/20 font-varsity">
                <span className="text-lg">Total</span>
                <span className="text-2xl">${totals.finalUSD.toFixed(2)}</span>
              </div>
            </div>

            <Link to="/checkout" onClick={onClose} className="btn-drop w-full">
              Checkout
            </Link>
          </div>
        )}
      </aside>
    </div>
  );
}
