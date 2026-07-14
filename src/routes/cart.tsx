import { createFileRoute, Link } from "@tanstack/react-router";
import { useCart, cart, cartTotal } from "@/lib/cart-store";
import { PRODUCT } from "@/lib/product";
import { Minus, Plus, Trash2, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Bag — Jesusity" },
      { name: "description", content: "Review your Jesusity preorder before checkout." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const items = useCart();
  const total = cartTotal(items);
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
                  <button onClick={() => cart.updateQty(it.id, it.size, it.qty - 1)} className="p-2">
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="px-3 text-sm font-bold">{it.qty}</span>
                  <button onClick={() => cart.updateQty(it.id, it.size, it.qty + 1)} className="p-2">
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
      <aside className="lg:sticky lg:top-24 self-start border-2 border-forest-deep p-6 bg-card">
        <div className="font-varsity text-2xl">SUMMARY</div>
        <div className="mt-6 flex justify-between text-sm">
          <span>Subtotal</span>
          <span>${total}</span>
        </div>
        <div className="mt-2 flex justify-between text-sm">
          <span>Shipping</span>
          <span className="text-muted-foreground">Calculated at checkout</span>
        </div>
        <div className="mt-6 border-t-2 border-forest-deep pt-4 flex justify-between items-baseline">
          <span className="font-varsity text-lg">Total</span>
          <span className="font-varsity text-3xl">${total}</span>
        </div>
        <div className="mt-4 bg-lime border-2 border-forest-deep p-3 text-xs tracking-widest uppercase font-bold">
          Preorder · {PRODUCT.shipEstimate}
        </div>
        <Link to="/checkout" className="btn-drop w-full mt-6">
          Checkout <ArrowRight className="w-4 h-4" />
        </Link>
      </aside>
    </section>
  );
}
