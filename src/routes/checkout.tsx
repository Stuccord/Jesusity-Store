import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useCart, cart, cartTotal } from "@/lib/cart-store";
import { PRODUCT } from "@/lib/product";
import { Lock, CheckCircle2, AlertCircle } from "lucide-react";

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
    // Paystack script is loaded globally in __root.tsx — no need to duplicate here
  }),
  component: CheckoutPage,
});

// ─── Types ────────────────────────────────────────────────────────────────────

interface PaystackPopupOptions {
  key: string;
  email: string;
  amount: number; // in kobo/cents (smallest unit)
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

// ─── Form fields ──────────────────────────────────────────────────────────────

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

// ─── Page ────────────────────────────────────────────────────────────────────

function CheckoutPage() {
  const items = useCart();
  const total = cartTotal(items); // display total in USD
  // Paystack charges in GHS — priceGHS × qty per item
  const totalGHS = items.reduce((sum, i) => sum + PRODUCT.priceGHS * i.qty, 0);
  const [placed, setPlaced] = useState(false);
  const [orderRef, setOrderRef] = useState("");
  const [paystackError, setPaystackError] = useState(false);
  const [loading, setLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [form, setForm] = useState<FormValues>(DEFAULT_FORM);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!window.PaystackPop || !PAYSTACK_KEY) {
      setPaystackError(true);
      console.error(
        !PAYSTACK_KEY
          ? "[Clovermade] VITE_PAYSTACK_PUBLIC_KEY is missing from .env"
          : "[Clovermade] window.PaystackPop is not defined — Paystack script may not have loaded"
      );
      return;
    }

    setLoading(true);
    setPaystackError(false);

    const ref = `JESUSITY-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

    const handler = window.PaystackPop.setup({
      key: PAYSTACK_KEY,
      email: form.email,
      phone: form.phone,
      // Paystack GHS — amount in pesewas (smallest unit: 1 GHS = 100 pesewas)
      amount: totalGHS * 100,
      currency: PRODUCT.currencyGHS,
      ref,
      metadata: {
        custom_fields: [
          { display_name: "Order Items", variable_name: "items", value: items.map((i) => `${i.name} ×${i.qty} (${i.size})`).join(", ") },
          { display_name: "Shipping Name", variable_name: "name", value: `${form.firstName} ${form.lastName}` },
          { display_name: "Phone Number", variable_name: "phone", value: form.phone },
          { display_name: "Shipping Address", variable_name: "address", value: `${form.address}, ${form.city}, ${form.state} ${form.zip}, ${form.country}` },
        ],
      },
      callback(response) {
        setOrderRef(response.reference);
        setPlaced(true);
        cart.clear();
        setLoading(false);
      },
      onClose() {
        setLoading(false);
      },
    });

    handler.openIframe();
  };

  // ── Success screen ────────────────────────────────────────────────────────

  if (placed) {
    return (
      <section className="mx-auto max-w-2xl px-4 md:px-8 py-24 text-center">
        <CheckCircle2 className="w-16 h-16 mx-auto text-forest" />
        <div className="mt-4 text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
          Preorder Confirmed
        </div>
        <h1 className="mt-2 font-varsity text-5xl leading-none">YOU'RE IN.</h1>
        <p className="mt-6 text-foreground/80 leading-relaxed">
          Your Jesusity Tee is reserved in Drop 001. A confirmation email is on its way.
          <br />
          <strong className="text-forest-deep">Estimated ship window: {PRODUCT.shipEstimate}.</strong>{" "}
          We'll email tracking the day yours goes out.
        </p>
        <div className="mt-4 text-xs text-muted-foreground font-mono tracking-widest">
          Ref: {orderRef}
        </div>
        <div className="mt-8 bg-lime border-2 border-forest-deep p-4 text-left inline-block">
          <div className="font-varsity text-sm">WHAT HAPPENS NEXT</div>
          <ol className="mt-2 text-xs tracking-widest uppercase space-y-1 text-forest-deep/80">
            <li>1 · Preorder window closes July 27</li>
            <li>2 · Tees go into production</li>
            <li>3 · Ships {PRODUCT.shipEstimate.toLowerCase()}</li>
          </ol>
        </div>
        <div className="mt-10">
          <Link to="/" className="btn-outline-dark">
            Back Home
          </Link>
        </div>
      </section>
    );
  }

  // ── Empty cart ────────────────────────────────────────────────────────────

  if (items.length === 0) {
    return (
      <section className="mx-auto max-w-2xl px-4 md:px-8 py-24 text-center">
        <h1 className="font-varsity text-4xl">NOTHING TO CHECKOUT</h1>
        <p className="mt-4 text-muted-foreground">Add the Jesusity Tee to your bag first.</p>
        <Link to="/" className="btn-drop mt-8">
          Shop the Drop
        </Link>
      </section>
    );
  }

  // ── Checkout form ────────────────────────────────────────────────────────

  return (
    <section className="mx-auto max-w-6xl px-4 md:px-8 py-12 md:py-16">
      {/* Banner */}
      <div className="mb-8 bg-forest-deep text-cream border-2 border-forest-deep p-4 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Lock className="w-5 h-5 text-lime" />
          <div>
            <div className="font-varsity text-sm">PREORDER CHECKOUT</div>
            <div className="text-[11px] tracking-widest uppercase text-cream/70">
              Delayed fulfillment · {PRODUCT.shipEstimate}
            </div>
          </div>
        </div>
        <div className="text-[10px] tracking-widest uppercase text-cream/60">
          You will be charged now to reserve your spot.
        </div>
      </div>

      {paystackError && (
        <div className="mb-6 flex items-center gap-3 border-2 border-destructive bg-destructive/10 p-4 text-sm">
          <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
          <span>
            Payment could not load. Please refresh the page and try again. Make sure your browser
            allows scripts from <code>js.paystack.co</code>.
          </span>
        </div>
      )}

      <form ref={formRef} onSubmit={handleSubmit} className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-8">
          {/* Contact */}
          <Section title="Contact">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field label="Email" name="email" type="email" required placeholder="you@email.com" value={form.email} onChange={handleChange} />
              <Field label="Phone Number" name="phone" type="tel" required placeholder="e.g. +233 24 123 4567" value={form.phone} onChange={handleChange} />
            </div>
          </Section>

          {/* Shipping */}
          <Section title="Shipping">
            <div className="grid grid-cols-2 gap-3">
              <Field label="First name" name="firstName" required value={form.firstName} onChange={handleChange} />
              <Field label="Last name" name="lastName" required value={form.lastName} onChange={handleChange} />
            </div>
            <Field label="Address" name="address" required value={form.address} onChange={handleChange} />
            <div className="grid grid-cols-3 gap-3">
              <Field label="City" name="city" required value={form.city} onChange={handleChange} />
              <Field label="State" name="state" required value={form.state} onChange={handleChange} />
              <Field label="ZIP" name="zip" required value={form.zip} onChange={handleChange} />
            </div>
            <Field label="Country" name="country" required value={form.country} onChange={handleChange} />
          </Section>

          {/* Payment notice */}
          <Section title="Payment">
            <div className="border-2 border-forest-deep bg-card p-4">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-forest" />
                <span className="font-bold tracking-widest uppercase text-xs">
                  Secure payment via Paystack
                </span>
              </div>
              <p className="mt-3 text-sm text-foreground/70 leading-relaxed">
                Clicking <strong>"Place Preorder"</strong> will open the Paystack secure payment
                popup. You will be charged in <strong>Ghana Cedis (GHS)</strong> — your card
                issuer may apply its own USD↔GHS conversion rate.
                Your details are encrypted end-to-end by Paystack.
              </p>
              <div className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground tracking-widest uppercase">
                <span className="inline-block w-2 h-2 rounded-full bg-forest"></span>
                256-bit SSL · PCI DSS Compliant
              </div>
            </div>
          </Section>
        </div>

        {/* Order summary */}
        <aside className="lg:sticky lg:top-24 self-start border-2 border-forest-deep p-6 bg-card space-y-5">
          <div className="font-varsity text-2xl">ORDER</div>
          <div className="space-y-3">
            {items.map((it) => (
              <div key={it.id + it.size} className="flex gap-3">
                <img src={it.image} alt="" className="w-16 h-20 object-cover border border-border" />
                <div className="flex-1">
                  <div className="font-varsity text-sm">{it.name}</div>
                  <div className="text-[11px] tracking-widest uppercase text-muted-foreground">
                    Size {it.size} · Qty {it.qty}
                  </div>
                </div>
                <div className="text-sm font-bold">${it.price * it.qty}</div>
              </div>
            ))}
          </div>
          <div className="border-t-2 border-forest-deep pt-4 space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${total}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Shipping</span>
              <span>Calculated after drop</span>
            </div>
          </div>
          <div className="flex justify-between items-baseline border-t-2 border-forest-deep pt-4">
            <span className="font-varsity text-lg">Total</span>
            <div className="text-right">
              <span className="font-varsity text-3xl">GHS {totalGHS}</span>
              <div className="text-xs text-muted-foreground mt-0.5">(≈ ${total} USD)</div>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-drop w-full disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Opening payment…" : "Place Preorder"}
          </button>
          <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
            By placing your preorder you agree to our{" "}
            <Link to="/legal" className="underline">
              shipping terms
            </Link>
            .
          </p>
        </aside>
      </form>
    </section>
  );
}

// ─── Small helpers ─────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="font-varsity text-xl mb-4">{title.toUpperCase()}</div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Field({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="block">
      <div className="text-[10px] tracking-widest uppercase text-muted-foreground mb-1">
        {label}
      </div>
      <input
        {...props}
        className="w-full border-2 border-forest-deep bg-cream px-3 py-3 text-sm focus:outline-none focus:bg-lime/20"
      />
    </label>
  );
}
