import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PRODUCT } from "@/lib/product";
import { Ticker } from "@/components/Ticker";
import { BuyBox } from "@/components/BuyBox";
import { Countdown, useIsPreorderClosed } from "@/components/Countdown";
import { FAQ } from "@/components/FAQ";
import { Star, Package, Timer, Sparkles, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Jesusity Tee — Drop 001 Preorder | Clovermade Studios" },
      {
        name: "description",
        content:
          "The Jesusity Tee — an oversized heavyweight cotton faith-rooted streetwear drop. Front: JESUSITY varsity arc. Back: GOD of the EAST (Matthew 2:2). Preorder now.",
      },
      { property: "og:title", content: "Jesusity Tee — Drop 001 Preorder" },
      {
        property: "og:description",
        content:
          "Oversized heavyweight cotton tee. Faith-rooted streetwear from Clovermade Studios. Limited preorder.",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Product",
          name: PRODUCT.name,
          description:
            "Oversized boxy-fit heavyweight cotton tee. Front: JESUSITY varsity arc with 'ENDLESS PURSUIT'. Back: GOD of the EAST (Matthew 2:2). Preorder-only faith-rooted streetwear from Clovermade Studios.",
          brand: { "@type": "Brand", name: "Clovermade Studios" },
          offers: {
            "@type": "Offer",
            price: PRODUCT.price,
            priceCurrency: PRODUCT.currency,
            availability: "https://schema.org/PreOrder",
          },
        }),
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <>
      <Ticker />
      <Hero />
      <MeaningSection />
      <FrontBackReveal />
      <WhyPreorder />
      <Ticker
        text="LIMITED RUN  ✦  DROP 001  ✦  FOREST GREEN COLORWAY  ✦  SHIPS AUGUST 2026  ✦"
        variant="lime"
      />
      <ProductDetails />
      <BuySection />
      <BrandStory />
      <ReviewsPreview />
      <FAQSection />
      <FinalCTA />
    </>
  );
}

function Hero() {
  const isClosed = useIsPreorderClosed(PRODUCT.preorderCloseISO);
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 md:px-8 py-12 md:py-20 grid gap-10 lg:grid-cols-[1.05fr_1fr] items-center">
        <div>
          <div className="inline-flex items-center gap-2 border-2 border-forest-deep px-3 py-1 text-[10px] font-bold tracking-[0.3em] uppercase">
            <span className={`w-2 h-2 rounded-full ${isClosed ? "bg-muted-foreground" : "bg-lime animate-pulse"}`} />
            {isClosed ? "Drop 001 · Closed" : "Drop 001 · Now on Preorder"}
          </div>
          <h1 className="mt-6 font-varsity text-[clamp(4rem,14vw,10rem)] leading-[0.85] text-forest-deep uppercase tracking-tight">
            Jesusity
          </h1>
          <div className="mt-2 inline-block bg-forest-deep text-cream px-4 py-2 font-varsity text-sm md:text-base tracking-widest">
            THE ENDLESS PURSUIT OF THE SON OF GOD
          </div>
          <p className="mt-6 max-w-lg text-base md:text-lg text-foreground/80 leading-relaxed">
            An oversized heavyweight cotton tee cut for the culture, rooted in scripture. This is
            Christian streetwear without the churchy clip-art — a hype-drop for the ones still
            chasing.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            {isClosed ? (
              <span className="inline-flex items-center gap-2 border-2 border-muted-foreground text-muted-foreground px-8 py-4 font-bold text-xs tracking-[0.08em] uppercase opacity-60 cursor-not-allowed">
                Preorder Closed
              </span>
            ) : (
              <Link to="/product" className="btn-drop">
                Preorder Now <ArrowRight className="w-4 h-4" />
              </Link>
            )}
            <Link to="/about" className="btn-outline-dark">
              The Story
            </Link>
          </div>
          <div className="mt-10">
            <div className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground mb-2">
              {isClosed ? "Preorder window" : "Preorder window closes in"}
            </div>
            <Countdown iso={PRODUCT.preorderCloseISO} />
          </div>
        </div>
        <div className="relative">
          <div className="absolute -inset-4 bg-lime -z-10 translate-x-4 translate-y-4 border-2 border-forest-deep" />
          <div className="border-2 border-forest-deep bg-card">
            <img
              src={PRODUCT.images.front}
              alt="Jesusity Tee front view — varsity arc wordmark on forest green heavyweight cotton"
              width={1200}
              height={1408}
              className="w-full h-auto"
            />
          </div>
          <div className="absolute -bottom-6 -left-4 md:-left-8 bg-cream border-2 border-forest-deep px-4 py-3 rotate-[-4deg]">
            <div className="font-varsity text-xs md:text-sm">${PRODUCT.price} · FOREST GREEN</div>
          </div>
        </div>
      </div>
    </section>
  );
}

function MeaningSection() {
  return (
    <section className="bg-forest-deep text-cream">
      <div className="mx-auto max-w-7xl px-4 md:px-8 py-20 md:py-28 text-center">
        <div className="text-[10px] tracking-[0.4em] uppercase text-lime">The Word</div>
        <div className="mt-6 font-varsity text-5xl md:text-7xl lg:text-8xl leading-none">
          JESUSITY
        </div>
        <div className="mt-4 text-lg md:text-2xl font-mono text-cream/70">/jee-suhz-i-tee/</div>
        <div className="mt-8 mx-auto max-w-2xl border-t-2 border-lime pt-8">
          <div className="font-varsity text-2xl md:text-4xl text-lime">ENDLESS PURSUIT</div>
          <p className="mt-4 text-base md:text-lg text-cream/80 leading-relaxed">
            <em>noun.</em> The lifelong chase of the Son of God — a devotion without a finish line.
            Not a moment, not a movement — a way of walking.
          </p>
        </div>
      </div>
    </section>
  );
}

function FrontBackReveal() {
  const [view, setView] = useState<"front" | "back">("front");
  return (
    <section className="mx-auto max-w-7xl px-4 md:px-8 py-20 md:py-28">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
        <div>
          <div className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
            The Prints
          </div>
          <h2 className="mt-2 font-varsity text-4xl md:text-6xl leading-none">
            FRONT & BACK.
            <br />
            <span className="text-forest">SCRIPTURE-ROOTED.</span>
          </h2>
        </div>
        <div className="inline-flex border-2 border-forest-deep">
          {(["front", "back"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-6 py-3 font-bold text-xs tracking-widest uppercase transition-colors ${
                view === v ? "bg-forest-deep text-cream" : "hover:bg-forest-deep/10"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-2 items-center">
        <div className="relative border-2 border-forest-deep bg-card overflow-hidden">
          <img
            src={view === "front" ? PRODUCT.images.promo : PRODUCT.images.back}
            alt={view === "front" ? "Jesusity front print" : "GOD of the EAST back print"}
            width={1200}
            height={1408}
            className="w-full h-auto transition-opacity duration-500"
            loading="lazy"
          />
        </div>

        {view === "front" ? (
          <div>
            <div className="text-[10px] tracking-[0.3em] uppercase text-forest">Front</div>
            <h3 className="mt-2 font-varsity text-3xl md:text-4xl">THE VARSITY ARC</h3>
            <p className="mt-4 text-base text-foreground/80 leading-relaxed">
              Bold JESUSITY collegiate wordmark arced across the chest in cream, printed on
              heavyweight forest cotton. Below: the phonetic — <em>/jee-suhz-i-tee/</em> — and the
              definition that started it all: <strong>ENDLESS PURSUIT</strong>.
            </p>
            <div className="mt-6 border-l-4 border-lime pl-4 py-2">
              <div className="font-varsity text-sm">A NAME. A DEFINITION. A WAY.</div>
            </div>
          </div>
        ) : (
          <div>
            <div className="text-[10px] tracking-[0.3em] uppercase text-forest">Back</div>
            <h3 className="mt-2 font-varsity text-3xl md:text-4xl">GOD of the EAST</h3>
            <p className="mt-4 text-base text-foreground/80 leading-relaxed">
              A large lime graphic filling the back — a callback to the wise men who traveled toward
              a rising star. Devotion in motion. Faith across borders.
            </p>
            <div className="mt-6 border-l-4 border-lime pl-4 py-3 italic text-foreground/90">
              "For we have seen a star in the East, and are come to worship Him."
              <div className="mt-2 not-italic font-varsity text-sm">— MATTHEW 2:2</div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function WhyPreorder() {
  const items = [
    {
      icon: Package,
      title: "MADE-TO-ORDER",
      body: "Every tee in Drop 001 is printed once the preorder window closes. No warehouse overstock, no throwaway inventory.",
    },
    {
      icon: Timer,
      title: "LIMITED WINDOW",
      body: "Preorders close on the drop date. When the window shuts, this colorway won't restock — the next drop will be new.",
    },
    {
      icon: Sparkles,
      title: "BUILT IN CULTURE",
      body: "Drop culture is honest: you commit, you wait, you wear it first. That's how we build.",
    },
  ];
  return (
    <section className="bg-cream border-y-2 border-forest-deep">
      <div className="mx-auto max-w-7xl px-4 md:px-8 py-20 md:py-24">
        <div className="max-w-2xl">
          <div className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
            Why Preorder
          </div>
          <h2 className="mt-2 font-varsity text-4xl md:text-6xl leading-none">
            WE DROP.
            <br />
            <span className="text-forest">WE DON'T RESTOCK.</span>
          </h2>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {items.map((it) => (
            <div
              key={it.title}
              className="border-2 border-forest-deep p-6 bg-card hover:bg-forest-deep hover:text-cream transition-colors group"
            >
              <it.icon className="w-8 h-8 text-forest group-hover:text-lime" />
              <div className="mt-4 font-varsity text-xl">{it.title}</div>
              <p className="mt-3 text-sm text-foreground/70 group-hover:text-cream/80 leading-relaxed">
                {it.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductDetails() {
  const rows = [
    ["Fabric", "100% heavyweight cotton · 240 gsm"],
    ["Fit", "Oversized · boxy · drop-shoulder"],
    ["Print", "Screen printed · cream front / lime back"],
    ["Origin", "Designed in the US · ethically produced"],
    ["Care", "Cold wash inside out · hang dry · low iron"],
  ];
  return (
    <section className="mx-auto max-w-7xl px-4 md:px-8 py-20 md:py-24 grid gap-12 lg:grid-cols-2 items-center">
      <div className="relative">
        <div className="border-2 border-forest-deep">
          <img
            src={PRODUCT.images.detail}
            alt="God of the East back print detail"
            width={1000}
            height={1000}
            className="w-full h-auto"
            loading="lazy"
          />
        </div>
      </div>
      <div>
        <div className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
          Product Details
        </div>
        <h2 className="mt-2 font-varsity text-4xl md:text-5xl leading-none">
          BUILT HEAVY.
          <br />
          BUILT TO STAY.
        </h2>
        <dl className="mt-8 divide-y divide-border border-y border-border">
          {rows.map(([k, v]) => (
            <div key={k} className="grid grid-cols-[120px_1fr] py-4 gap-6">
              <dt className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground">{k}</dt>
              <dd className="text-sm md:text-base">{v}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-8 bg-lime border-2 border-forest-deep p-4">
          <div className="font-varsity text-sm">SIZE GUIDE</div>
          <div className="text-xs mt-1 text-forest-deep/80">
            Chest (S) 22" · (M) 24" · (L) 26" · (XL) 28" · (XXL) 30". Runs oversized — size down for
            a fitted look.
          </div>
        </div>
      </div>
    </section>
  );
}

function BuySection() {
  return (
    <section id="buy" className="bg-forest-deep text-cream">
      <div className="mx-auto max-w-7xl px-4 md:px-8 py-20 md:py-28 grid gap-12 lg:grid-cols-2 items-start">
        <div className="grid grid-cols-2 gap-3">
          <img
            src={PRODUCT.images.front}
            alt="Front"
            className="w-full h-auto border-2 border-lime"
            loading="lazy"
          />
          <img
            src={PRODUCT.images.back}
            alt="Back"
            className="w-full h-auto border-2 border-lime"
            loading="lazy"
          />
          <img
            src={PRODUCT.images.lifestyle}
            alt="On-body"
            className="col-span-2 w-full h-auto border-2 border-lime"
            loading="lazy"
          />
        </div>
        <div className="bg-cream text-forest-deep p-6 md:p-10 border-2 border-lime">
          <BuyBox />
        </div>
      </div>
    </section>
  );
}

function BrandStory() {
  return (
    <section className="mx-auto max-w-5xl px-4 md:px-8 py-20 md:py-28 text-center">
      <div className="font-logo text-6xl md:text-7xl text-forest-deep">Clovermade</div>
      <div className="mt-1 text-[11px] tracking-[0.4em] uppercase text-muted-foreground">
        Studios
      </div>
      <h2 className="mt-6 font-varsity text-3xl md:text-5xl leading-tight max-w-3xl mx-auto">
        WE'RE BUILDING FAITH-ROOTED STREETWEAR THAT DOESN'T ASK FOR PERMISSION.
      </h2>
      <p className="mt-6 text-base md:text-lg text-foreground/80 max-w-2xl mx-auto leading-relaxed">
        Clovermade Studios exists for a generation that grew up in sneakers and scripture. We drop
        pieces that carry the weight of both — cut like the culture, rooted in the Word. Every
        graphic is intentional. Every drop is a chapter.
      </p>
      <Link to="/about" className="btn-outline-dark mt-8">
        Read the Full Story
      </Link>
    </section>
  );
}

function ReviewsPreview() {
  return (
    <section className="bg-cream border-y-2 border-forest-deep">
      <div className="mx-auto max-w-7xl px-4 md:px-8 py-20 md:py-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <div className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
              First Wearers
            </div>
            <h2 className="mt-2 font-varsity text-4xl md:text-5xl">BE THE FIRST TO WEAR IT.</h2>
          </div>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} className="w-5 h-5 fill-lime text-forest-deep" />
            ))}
            <span className="text-xs font-bold tracking-widest uppercase ml-2">
              Waitlist · 1,200+
            </span>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              q: "Been waiting for Christian streetwear that doesn't feel corny. Clovermade actually gets it.",
              n: "— @kenji.r",
            },
            {
              q: "The GOD of the EAST back print is unreal. Scripture on the sleeve without shouting it.",
              n: "— @mariaa",
            },
            {
              q: "Ordered. Already telling my group chat. Take my money.",
              n: "— @jphillips",
            },
          ].map((r) => (
            <blockquote key={r.n} className="border-2 border-forest-deep p-6 bg-card">
              <div className="flex gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-4 h-4 fill-forest text-forest" />
                ))}
              </div>
              <p className="text-base leading-relaxed">"{r.q}"</p>
              <div className="mt-4 text-xs font-bold tracking-widest uppercase">{r.n}</div>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQSection() {
  const items = [
    {
      q: "What does preorder mean and when will I get my order?",
      a: "Preorder means you're reserving your tee before it's produced. Drop 001 preorders close on July 27, 2026, then we go straight into production. Estimated ship window: August 2026. You'll get a tracking email the day yours ships.",
    },
    {
      q: "Why isn't this just available to buy right now?",
      a: "Because we don't overproduce. Drops are made to demand — you commit, we print, you get first. No warehouse full of unsold inventory, no restocks after the window closes.",
    },
    {
      q: "What's the fit like — should I size up or down?",
      a: "The Jesusity Tee runs oversized and boxy by design. If you like a true drop-shoulder streetwear fit, order your normal size. If you want it more fitted, size down one.",
    },
    {
      q: "What's the meaning behind 'GOD of the EAST'?",
      a: "It's a nod to Matthew 2:2 — the wise men followed a rising star in the East to worship Christ. It's a picture of the endless pursuit: chasing the Son across distance, doubt, and time.",
    },
    {
      q: "Will there be other colorways or designs?",
      a: "Yes. Drop 001 is Forest Green only. New colorways and designs drop as separate chapters. Get on the notify list at the bottom of the page to hear it first.",
    },
  ];
  return (
    <section className="mx-auto max-w-5xl px-4 md:px-8 py-20 md:py-24">
      <div className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground">FAQ</div>
      <h2 className="mt-2 font-varsity text-4xl md:text-6xl mb-10 leading-none">
        BEFORE YOU
        <br />
        <span className="text-forest">COMMIT.</span>
      </h2>
      <FAQ items={items} />
      <div className="mt-8 text-center">
        <Link to="/faq" className="btn-outline-dark">
          All FAQs
        </Link>
      </div>
    </section>
  );
}

function FinalCTA() {
  const isClosed = useIsPreorderClosed(PRODUCT.preorderCloseISO);
  return (
    <section className="relative bg-lime border-y-2 border-forest-deep overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 md:px-8 py-24 md:py-32 text-center relative">
        <div className="text-[10px] tracking-[0.4em] uppercase">
          {isClosed ? "Drop 001" : "Last Call"}
        </div>
        <h2 className="mt-4 font-varsity text-5xl md:text-8xl leading-[0.9] text-forest-deep">
          {isClosed ? (
            <>
              THE WINDOW
              <br />
              <span className="text-shadow-cream">HAS CLOSED.</span>
            </>
          ) : (
            <>
              THE PURSUIT
              <br />
              <span className="text-shadow-cream">DOESN'T WAIT.</span>
            </>
          )}
        </h2>
        <p className="mt-6 max-w-xl mx-auto text-base md:text-lg text-forest-deep/80">
          {isClosed
            ? "Drop 001 has ended. The Forest Green colorway is no longer available. Stay tuned for the next chapter."
            : "Drop 001 closes when the countdown hits zero. Once the window shuts, this colorway is gone."}
        </p>
        <div className="mt-8 flex flex-col items-center gap-6">
          <Countdown iso={PRODUCT.preorderCloseISO} />
          {isClosed ? (
            <Link to="/about" className="btn-drop !bg-forest-deep !text-lime !border-lime">
              Read the Story <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <Link to="/product" className="btn-drop !bg-forest-deep !text-lime !border-lime">
              Preorder the Jesusity Tee <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
