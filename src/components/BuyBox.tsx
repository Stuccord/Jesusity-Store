import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { PRODUCT, type Size } from "@/lib/product";
import { cart } from "@/lib/cart-store";
import { ShieldCheck, Truck, Clock } from "lucide-react";

export function BuyBox({ compact = false }: { compact?: boolean }) {
  const [size, setSize] = useState<Size | null>(null);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const onAdd = () => {
    if (!size) return;
    cart.add({
      id: PRODUCT.id,
      name: PRODUCT.name,
      size,
      price: PRODUCT.price,
      qty,
      image: PRODUCT.images.front,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div className="space-y-6">
      {!compact && (
        <>
          <div>
            <div className="text-[11px] tracking-[0.3em] uppercase text-muted-foreground">
              Drop 001 · Forest Green
            </div>
            <h1 className="font-varsity text-4xl md:text-5xl leading-[0.95] mt-2">
              THE JESUSITY TEE
            </h1>
            <div className="mt-2 text-sm tracking-widest uppercase text-muted-foreground">
              Forest Green Colorway
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <div className="font-varsity text-3xl">GH₵{PRODUCT.priceGHS}</div>
            <div className="text-xs tracking-widest uppercase text-muted-foreground">
              (~${PRODUCT.price} USD)
            </div>
          </div>
        </>
      )}

      <div>
        <div className="flex items-baseline justify-between mb-3">
          <div className="text-xs font-bold tracking-[0.2em] uppercase">Size</div>
          <div className="text-[11px] tracking-widest uppercase text-muted-foreground">
            Runs oversized — size down for a fitted look
          </div>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {PRODUCT.sizes.map((s) => (
            <button
              key={s}
              onClick={() => setSize(s)}
              className={`py-3 border-2 font-varsity text-lg tracking-wide transition-colors ${
                size === s
                  ? "bg-forest-deep text-cream border-forest-deep"
                  : "border-forest-deep hover:bg-forest-deep hover:text-cream"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="inline-flex items-center border-2 border-forest-deep">
          <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-3 py-3">
            −
          </button>
          <span className="px-4 font-bold">{qty}</span>
          <button onClick={() => setQty((q) => q + 1)} className="px-3 py-3">
            +
          </button>
        </div>
        <button
          onClick={onAdd}
          disabled={!size}
          className="btn-drop flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {added ? "Added to Bag ✓" : size ? "Add to Bag" : "Select a Size"}
        </button>
      </div>

      {/* Delivery promise */}
      <div className="border-2 border-forest-deep bg-lime px-4 py-3">
        <div className="flex items-center gap-2 font-varsity text-sm text-forest-deep">
          <Clock className="w-4 h-4 shrink-0" />
          DELIVERY IN 3 WORKING DAYS
        </div>
        <div className="text-[11px] tracking-wider uppercase mt-1 text-forest-deep/70 leading-snug">
          Relative to proximity — no matter how far.{" "}
          <span className="font-bold">Jesus rose on the 3rd Day.</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-[10px] tracking-widest uppercase">
        <div className="flex items-center gap-2 border border-border p-2">
          <ShieldCheck className="w-4 h-4 text-forest" />
          Secure Pay
        </div>
        <div className="flex items-center gap-2 border border-border p-2">
          <Truck className="w-4 h-4 text-forest" />
          Fast Ship
        </div>
        <div className="flex items-center gap-2 border border-border p-2">
          <Clock className="w-4 h-4 text-forest" />3 Days Max
        </div>
      </div>

      {!compact && (
        <Link
          to="/product"
          className="block text-center text-xs tracking-[0.2em] uppercase underline underline-offset-4"
        >
          Full product details →
        </Link>
      )}
    </div>
  );
}
