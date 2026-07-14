import { Link } from "@tanstack/react-router";
import { ShoppingBag, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useCart, cartCount } from "@/lib/cart-store";
import { CartDrawer } from "./CartDrawer";

export function Nav() {
  const items = useCart();
  const count = cartCount(items);
  const [open, setOpen] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { to: "/", label: "Shop" },
    { to: "/product", label: "The Tee" },
    { to: "/about", label: "About" },
    { to: "/faq", label: "FAQ" },
    { to: "/reviews", label: "Reviews" },
  ] as const;

  return (
    <>
      <header
        className={`sticky top-0 z-40 bg-cream/95 backdrop-blur border-b-2 border-forest-deep transition-shadow ${scrolled ? "shadow-[0_4px_0_0_var(--color-forest-deep)]" : ""}`}
      >
        <div className="mx-auto max-w-7xl px-4 md:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-baseline gap-2">
            <span className="font-logo text-3xl leading-none text-forest-deep">Clovermade</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="text-xs font-bold tracking-[0.2em] uppercase text-forest-deep hover:text-forest transition-colors"
                activeProps={{ className: "text-forest border-b-2 border-lime pb-1" }}
                activeOptions={{ exact: l.to === "/" }}
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDrawer(true)}
              aria-label="Open cart"
              className="relative inline-flex items-center gap-2 border-2 border-forest-deep px-3 py-2 hover:bg-forest-deep hover:text-cream transition-colors"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="text-xs font-bold tracking-widest uppercase hidden sm:inline">
                Cart
              </span>
              {count > 0 && (
                <span className="absolute -top-2 -right-2 bg-lime text-forest-deep text-[10px] font-bold w-5 h-5 rounded-full grid place-items-center border-2 border-forest-deep">
                  {count}
                </span>
              )}
            </button>
            <button
              className="md:hidden border-2 border-forest-deep p-2"
              onClick={() => setOpen((o) => !o)}
              aria-label="Menu"
            >
              {open ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
        {open && (
          <nav className="md:hidden border-t-2 border-forest-deep bg-cream">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="block px-6 py-4 text-sm font-bold tracking-[0.2em] uppercase border-b border-border"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        )}
      </header>
      <CartDrawer open={drawer} onClose={() => setDrawer(false)} />
    </>
  );
}
