import { useState } from "react";
import { ChevronDown } from "lucide-react";

export type QA = { q: string; a: string };

export function FAQ({ items }: { items: QA[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="divide-y-2 divide-forest-deep border-y-2 border-forest-deep">
      {items.map((it, i) => (
        <div key={i}>
          <button
            className="w-full flex items-center justify-between text-left py-5 gap-4"
            onClick={() => setOpen(open === i ? null : i)}
          >
            <span className="font-varsity text-lg md:text-xl leading-tight">{it.q}</span>
            <ChevronDown
              className={`w-5 h-5 shrink-0 transition-transform ${open === i ? "rotate-180" : ""}`}
            />
          </button>
          {open === i && (
            <div className="pb-6 text-sm md:text-base text-foreground/80 max-w-3xl leading-relaxed">
              {it.a}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
