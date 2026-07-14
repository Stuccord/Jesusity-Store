import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { PRODUCT, type Size } from "@/lib/product";
import { cart } from "@/lib/cart-store";
import { Countdown, useIsPreorderClosed } from "./Countdown";
import { ShieldCheck, Truck, RotateCcw } from "lucide-react";

export function BuyBox({ compact = false }: { compact?: boolean }) {
  const [size, setSize] = useState<Size | null>(null);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const isClosed = useIsPreorderClosed(PRODUCT.preorderCloseISO);

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
              Drop 001 · Preorder
            </div>
            <h1 className="font-varsity text-4xl md:text-5xl leading-[0.95] mt-2">
              THE JESUSITY TEE
            </h1>
            <div className="mt-2 text-sm tracking-widest uppercase text-muted-foreground">
              Forest Green Colorway
            </div>
          </div>
          <div className="flex items-baseline gap-3">
            <div className="font-varsity text-3xl">${PRODUCT.price}</div>
            <div className="text-xs tracking-widest uppercase text-muted-foreground">USD</div>
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
              onClick={() => !isClosed && setSize(s)}
              disabled={isClosed}
              aria-disabled={isClosed}
              className={`py-3 border-2 font-varsity text-lg tracking-wide transition-colors ${
                isClosed
                  ? "border-border text-muted-foreground cursor-not-allowed opacity-50"
                  : size === s
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
        <div className={`inline-flex items-center border-2 ${isClosed ? "border-border opacity-50" : "border-forest-deep"}`}>
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            disabled={isClosed}
            className="px-3 py-3 disabled:cursor-not-allowed"
          >
            −
          </button>
          <span className="px-4 font-bold">{qty}</span>
          <button
            onClick={() => setQty((q) => q + 1)}
            disabled={isClosed}
            className="px-3 py-3 disabled:cursor-not-allowed"
          >
            +
          </button>
        </div>
        <button
          onClick={onAdd}
          disabled={!size || isClosed}
          className="btn-drop flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isClosed
            ? "Preorder Closed"
            : added
              ? "Added to Bag ✓"
              : size
                ? "Preorder Now"
                : "Select a Size"}
        </button>
      </div>

      <div className={`border-2 px-4 py-3 ${isClosed ? "border-muted-foreground bg-muted" : "border-forest-deep bg-lime"}`}>
        <div className={`font-varsity text-sm ${isClosed ? "text-muted-foreground" : "text-forest-deep"}`}>
          {isClosed ? "This drop has closed" : PRODUCT.shipEstimate}
        </div>
        <div className={`text-[11px] tracking-widest uppercase mt-1 ${isClosed ? "text-muted-foreground" : "text-forest-deep/70"}`}>
          {isClosed ? "Drop 001 is no longer available for preorder" : "Preorder window closes in"}
        </div>
        <div className="mt-2">
          <Countdown iso={PRODUCT.preorderCloseISO} compact />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-[10px] tracking-widest uppercase">
        <div className="flex items-center gap-2 border border-border p-2">
          <ShieldCheck className="w-4 h-4 text-forest" />
          Secure Checkout
        </div>
        <div className="flex items-center gap-2 border border-border p-2">
          <Truck className="w-4 h-4 text-forest" />
          Worldwide Ship
        </div>
        <div className="flex items-center gap-2 border border-border p-2">
          <RotateCcw className="w-4 h-4 text-forest" />
          Fit Guarantee
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
