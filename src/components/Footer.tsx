import { Link } from "@tanstack/react-router";
import { Instagram, Twitter, Youtube } from "lucide-react";
import { Ticker } from "./Ticker";

export function Footer() {
  return (
    <footer className="mt-24">
      <Ticker
        text="STAY IN THE PURSUIT  ✦  DROP 001 · JESUSITY · FOREST GREEN  ✦  CLOVERMADE STUDIOS  ✦"
        variant="lime"
      />
      <div className="bg-forest-deep text-cream">
        <div className="mx-auto max-w-7xl px-4 md:px-8 py-16 grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="font-logo text-5xl text-cream leading-none">Jesusity</div>
            <p className="mt-4 max-w-sm text-sm text-cream/70">
              The endless pursuit of the Son of God. A faith-rooted streetwear label from
              Clovermade Studios. Made in limited drops.
            </p>
            <form
              className="mt-6 flex max-w-sm border-2 border-cream"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="email"
                required
                placeholder="you@email.com"
                className="flex-1 bg-transparent px-3 py-3 text-sm placeholder:text-cream/50 focus:outline-none"
              />
              <button
                type="submit"
                className="bg-lime text-forest-deep px-4 text-xs font-bold tracking-widest uppercase hover:bg-cream transition-colors"
              >
                Notify
              </button>
            </form>
            <p className="text-[11px] text-cream/50 mt-2 tracking-widest uppercase">
              Get first access to Drop 002.
            </p>
          </div>
          <div>
            <div className="font-varsity text-sm tracking-widest">SHOP</div>
            <ul className="mt-4 space-y-2 text-sm text-cream/80">
              <li>
                <Link to="/" className="hover:text-lime">
                  Drop 001
                </Link>
              </li>
              <li>
                <Link to="/product" className="hover:text-lime">
                  The Tee
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-lime">
                  Bag
                </Link>
              </li>
              <li>
                <Link to="/checkout" className="hover:text-lime">
                  Checkout
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <div className="font-varsity text-sm tracking-widest">INFO</div>
            <ul className="mt-4 space-y-2 text-sm text-cream/80">
              <li>
                <Link to="/about" className="hover:text-lime">
                  About
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-lime">
                  Preorder FAQ
                </Link>
              </li>
              <li>
                <Link to="/reviews" className="hover:text-lime">
                  Reviews
                </Link>
              </li>
              <li>
                <Link to="/legal" className="hover:text-lime">
                  Shipping & Returns
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-cream/15">
          <div className="mx-auto max-w-7xl px-4 md:px-8 py-6 flex flex-col md:flex-row items-center gap-4 justify-between">
            <div className="text-[11px] tracking-[0.25em] uppercase text-cream/50">
              © {new Date().getFullYear()} Clovermade Studios. All rights reserved.
            </div>
            <div className="flex items-center gap-3">
              <div className="text-[10px] tracking-widest uppercase text-cream/50 mr-2">
                Secure checkout
              </div>
              {["VISA", "MC", "AMEX", "APPLE", "SHOP"].map((p) => (
                <span
                  key={p}
                  className="text-[10px] tracking-widest font-bold border border-cream/40 px-2 py-1"
                >
                  {p}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-4">
              <a href="#" aria-label="Instagram" className="hover:text-lime">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" aria-label="Twitter" className="hover:text-lime">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" aria-label="YouTube" className="hover:text-lime">
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
