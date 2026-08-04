import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export function MobileOrderBar() {
  const [show, setShow] = useState(false);

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
            Ships in 3 Working Days
          </div>
        </div>
        <Link to="/product" className="btn-drop !py-3 !px-5 text-xs">
          Order Now
        </Link>
      </div>
    </div>
  );
}
