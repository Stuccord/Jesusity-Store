import { createFileRoute } from "@tanstack/react-router";
import { Star } from "lucide-react";

export const Route = createFileRoute("/reviews")({
  head: () => ({
    meta: [
      { title: "Reviews & Waitlist — Jesusity" },
      {
        name: "description",
        content:
          "See what the Jesusity waitlist is saying. Be one of the first to wear Drop 001.",
      },
      { property: "og:title", content: "Reviews & Waitlist — Jesusity" },
      { property: "og:description", content: "Voices from the endless pursuit." },
    ],
    links: [{ rel: "canonical", href: "/reviews" }],
  }),
  component: Reviews,
});

const list = [
  {
    q: "Been waiting for Christian streetwear that doesn't feel corny. Clovermade actually gets it — the fit, the print, the vibe.",
    n: "Kenji R.",
    h: "Los Angeles, CA",
  },
  {
    q: "The GOD of the EAST back print is unreal. Scripture without shouting it. Bought two.",
    n: "Maria A.",
    h: "Miami, FL",
  },
  {
    q: "Ordered. Already telling my group chat. Take my money — this is what I've been waiting for.",
    n: "J. Phillips",
    h: "Atlanta, GA",
  },
  {
    q: "Preorder culture done right. Transparent ship date, quality feels premium in the mockups. Locked in.",
    n: "Sam O.",
    h: "London, UK",
  },
  {
    q: "The phonetic spelling on the front — /jee-suhz-i-tee/ — that's the detail that sold me. It's a statement.",
    n: "Nadia K.",
    h: "Toronto, CA",
  },
  {
    q: "Heavyweight, oversized, and rooted. That's the trifecta. First drop from Clovermade won't be the last for me.",
    n: "Elijah C.",
    h: "Brooklyn, NY",
  },
];

function Reviews() {
  return (
    <>
      <section className="mx-auto max-w-6xl px-4 md:px-8 py-16 md:py-24">
        <div className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
          From the Pursuit
        </div>
        <h1 className="mt-2 font-varsity text-5xl md:text-7xl leading-none">
          FIRST WEARERS.
          <br />
          <span className="text-forest">FIRST WORDS.</span>
        </h1>
        <div className="mt-4 flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star key={i} className="w-5 h-5 fill-forest text-forest" />
          ))}
          <span className="text-sm font-bold tracking-widest uppercase ml-2">
            Waitlist · 1,200+ people
          </span>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {list.map((r, i) => (
            <blockquote key={i} className="border-2 border-forest-deep p-6 bg-card">
              <div className="flex gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-4 h-4 fill-lime text-forest-deep" />
                ))}
              </div>
              <p className="text-base leading-relaxed">"{r.q}"</p>
              <div className="mt-4 font-varsity text-sm">{r.n}</div>
              <div className="text-[11px] tracking-widest uppercase text-muted-foreground">
                {r.h}
              </div>
            </blockquote>
          ))}
        </div>
      </section>
      <section className="bg-forest-deep text-cream">
        <div className="mx-auto max-w-3xl px-4 md:px-8 py-20 text-center">
          <h2 className="font-varsity text-4xl md:text-5xl">JOIN THE WAITLIST.</h2>
          <p className="mt-4 text-cream/80">
            Get notified when Drop 002 releases — new colorway, new chapter.
          </p>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="mt-8 flex max-w-md mx-auto border-2 border-lime"
          >
            <input
              type="email"
              required
              placeholder="you@email.com"
              className="flex-1 bg-transparent px-4 py-3 text-sm placeholder:text-cream/50 focus:outline-none"
            />
            <button className="bg-lime text-forest-deep px-6 text-xs font-bold tracking-widest uppercase">
              Notify Me
            </button>
          </form>
        </div>
      </section>
    </>
  );
}
