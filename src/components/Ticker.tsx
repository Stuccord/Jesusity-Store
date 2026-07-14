type Props = {
  text?: string;
  variant?: "dark" | "lime";
  speed?: "normal" | "fast";
};

export function Ticker({
  text = "ONLY ON PREORDER  ✦  WWW.CLOVERMADESTUDIOS.STORE  ✦  THE ENDLESS PURSUIT OF THE SON OF GOD  ✦  JESUSITY DROP 001  ✦",
  variant = "dark",
  speed = "normal",
}: Props) {
  const bg = variant === "dark" ? "bg-forest-deep" : "bg-lime";
  const fg = variant === "dark" ? "text-cream" : "text-forest-deep";
  const anim = speed === "fast" ? "animate-marquee-fast" : "animate-marquee";
  const repeated = Array.from({ length: 6 }).map((_, i) => (
    <span key={i} className="mx-6 inline-block">
      {text}
    </span>
  ));
  return (
    <div className={`${bg} ${fg} overflow-hidden border-y-2 border-forest-deep py-3`}>
      <div className={`whitespace-nowrap ${anim} flex`}>
        <div className="font-varsity text-sm tracking-widest uppercase flex shrink-0">
          {repeated}
        </div>
        <div className="font-varsity text-sm tracking-widest uppercase flex shrink-0" aria-hidden>
          {repeated}
        </div>
      </div>
    </div>
  );
}
