import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PRODUCT } from "@/lib/product";
import { useIsPreorderClosed } from "./Countdown";

export function MobilePreorderBar() {
  const [show, setShow] = useState(false);
  const isClosed = useIsPreorderClosed(PRODUCT.preorderCloseISO);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`md:hidden fixed bottom-0 inset-x-0 z-30 border-t-2 border-forest-deep bg-cream transition-transform ${show ? "translate-y-0" : "translate-y-full"}`}
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="flex-1">
          <div className="font-varsity text-sm leading-none">JESUSITY TEE</div>
          <div className="text-[10px] tracking-widest uppercase text-muted-foreground mt-0.5">
            {isClosed ? "Preorder Closed" : `$${PRODUCT.price} · Preorder`}
          </div>
        </div>
        {isClosed ? (
          <span className="font-varsity text-xs tracking-widest uppercase border-2 border-muted-foreground text-muted-foreground px-4 py-3 opacity-60">
            Closed
          </span>
        ) : (
          <Link to="/product" className="btn-drop !py-3 !px-5 text-xs">
            Preorder
          </Link>
        )}
      </div>
    </div>
  );
}
