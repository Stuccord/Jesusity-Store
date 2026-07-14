import { useEffect, useState } from "react";

interface TimeLeft {
  d: number;
  h: number;
  m: number;
  s: number;
  done: boolean;
}

function diff(target: number): TimeLeft {
  const now = Date.now();
  const ms = Math.max(0, target - now);
  return {
    d: Math.floor(ms / 86400000),
    h: Math.floor((ms / 3600000) % 24),
    m: Math.floor((ms / 60000) % 60),
    s: Math.floor((ms / 1000) % 60),
    done: ms === 0,
  };
}

// Stable SSR placeholder — always "not done", all zeros.
// The client useEffect will immediately replace this with real values.
const SSR_PLACEHOLDER: TimeLeft = { d: 0, h: 0, m: 0, s: 0, done: false };

export function Countdown({ iso, compact = false }: { iso: string; compact?: boolean }) {
  const target = new Date(iso).getTime();

  // Start with a stable SSR-safe value; hydrate on the client.
  const [t, setT] = useState<TimeLeft>(SSR_PLACEHOLDER);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setT(diff(target));
    const id = setInterval(() => setT(diff(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  // Render a non-changing skeleton until the client mounts —
  // this avoids the SSR vs client Date.now() mismatch.
  if (!mounted) {
    return (
      <div className="inline-flex items-center gap-4 md:gap-6 bg-forest-deep px-5 py-3 border-2 border-forest-deep">
        {(["Days", "Hrs", "Min", "Sec"] as const).map((label, i) => (
          <span key={label} className="flex flex-col items-center">
            <span className={`font-varsity ${compact ? "text-2xl" : "text-4xl md:text-5xl"} leading-none text-cream`}>
              --
            </span>
            <span className="text-[10px] tracking-[0.2em] uppercase text-cream/70 mt-1">{label}</span>
            {i < 3 && <></>}
          </span>
        ))}
      </div>
    );
  }

  if (t.done) {
    return compact ? (
      <div className="inline-flex items-center gap-2 bg-forest-deep px-4 py-2 border-2 border-forest-deep">
        <span className="font-varsity text-sm text-lime tracking-widest uppercase">
          Preorder Closed
        </span>
      </div>
    ) : (
      <div className="inline-flex flex-col items-center gap-1 bg-forest-deep px-6 py-4 border-2 border-lime">
        <span className="font-varsity text-2xl md:text-3xl text-lime tracking-widest uppercase">
          Preorder Closed
        </span>
        <span className="text-[10px] tracking-[0.25em] uppercase text-cream/60">
          This window has ended
        </span>
      </div>
    );
  }

  const cell = (n: number, label: string) => (
    <div className="flex flex-col items-center">
      <div
        className={`font-varsity ${compact ? "text-2xl" : "text-4xl md:text-5xl"} leading-none text-cream`}
      >
        {String(n).padStart(2, "0")}
      </div>
      <div className="text-[10px] tracking-[0.2em] uppercase text-cream/70 mt-1">{label}</div>
    </div>
  );

  return (
    <div className="inline-flex items-center gap-4 md:gap-6 bg-forest-deep px-5 py-3 border-2 border-forest-deep">
      {cell(t.d, "Days")}
      <span className="text-cream/40 font-varsity">:</span>
      {cell(t.h, "Hrs")}
      <span className="text-cream/40 font-varsity">:</span>
      {cell(t.m, "Min")}
      <span className="text-cream/40 font-varsity">:</span>
      {cell(t.s, "Sec")}
    </div>
  );
}

/**
 * Returns true once the client has mounted AND the deadline has passed.
 * Always returns false during SSR to avoid hydration mismatches.
 */
export function useIsPreorderClosed(iso: string): boolean {
  const target = new Date(iso).getTime();
  // Default to false (open) — safe for SSR, no hydration mismatch.
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    // Immediately evaluate on mount
    if (Date.now() >= target) {
      setClosed(true);
      return;
    }
    // Poll every second until it closes
    const id = setInterval(() => {
      if (Date.now() >= target) {
        setClosed(true);
        clearInterval(id);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [target]);

  return closed;
}
