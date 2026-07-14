import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PRODUCT } from "@/lib/product";
import { BuyBox } from "@/components/BuyBox";
import { Ticker } from "@/components/Ticker";
import { useIsPreorderClosed } from "@/components/Countdown";

export const Route = createFileRoute("/product")({
  head: () => ({
    meta: [
      { title: "The Jesusity Tee — Full Details | Clovermade Studios" },
      {
        name: "description",
        content:
          "Heavyweight 240gsm cotton. Oversized boxy fit. Front varsity arc + back GOD of the EAST print. Full sizing, fabric and print detail.",
      },
      { property: "og:title", content: "The Jesusity Tee — Full Details" },
      {
        property: "og:description",
        content: "Heavyweight cotton preorder tee. Oversized boxy fit. Screen-printed graphics.",
      },
    ],
    links: [{ rel: "canonical", href: "/product" }],
  }),
  component: ProductPage,
});

const gallery = [
  { src: PRODUCT.images.front, label: "Front" },
  { src: PRODUCT.images.back, label: "Back" },
  { src: PRODUCT.images.lifestyle, label: "On-body" },
  { src: PRODUCT.images.promo, label: "Preorder Promo" },
];

function ProductPage() {
  const [active, setActive] = useState(0);
  const isClosed = useIsPreorderClosed(PRODUCT.preorderCloseISO);
  return (
    <>
      <Ticker text={isClosed ? "THE JESUSITY TEE  ✶  DROP 001  ✶  PREORDER CLOSED  ✶" : "THE JESUSITY TEE  ✶  DROP 001  ✶  PREORDER  ✶"} />
      <section className="mx-auto max-w-7xl px-4 md:px-8 py-12 md:py-16 grid gap-10 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <div className="border-2 border-forest-deep bg-card">
            <img
              src={gallery[active].src}
              alt={`${PRODUCT.name} ${gallery[active].label}`}
              className="w-full h-auto"
            />
          </div>
          <div className="mt-4 grid grid-cols-4 gap-2">
            {gallery.map((g, i) => (
              <button
                key={g.label}
                onClick={() => setActive(i)}
                className={`border-2 ${active === i ? "border-lime" : "border-forest-deep"} bg-card overflow-hidden`}
                aria-label={g.label}
              >
                <img src={g.src} alt={g.label} className="w-full h-auto" loading="lazy" />
              </button>
            ))}
          </div>
        </div>
        <div className="lg:sticky lg:top-24 self-start">
          <BuyBox />
        </div>
      </section>

      <section className="bg-forest-deep text-cream">
        <div className="mx-auto max-w-6xl px-4 md:px-8 py-20 md:py-24 grid gap-10 md:grid-cols-2">
          <div>
            <div className="text-[10px] tracking-[0.3em] uppercase text-lime">Fabric</div>
            <h2 className="mt-2 font-varsity text-4xl">240 GSM HEAVYWEIGHT COTTON</h2>
            <p className="mt-4 text-cream/80 leading-relaxed">
              Dense, structured, and built to hold its shape wear after wear. This isn't a
              lightweight tee that curls after two washes — it's the kind of tee that gets better
              the more you live in it.
            </p>
          </div>
          <div>
            <div className="text-[10px] tracking-[0.3em] uppercase text-lime">Fit</div>
            <h2 className="mt-2 font-varsity text-4xl">OVERSIZED · BOXY · DROP-SHOULDER</h2>
            <p className="mt-4 text-cream/80 leading-relaxed">
              Cut wide through the body with a boxy hem. Sits high on the sleeve for a proper
              streetwear silhouette. Runs oversized on purpose — size down if you want it fitted.
            </p>
          </div>
          <div>
            <div className="text-[10px] tracking-[0.3em] uppercase text-lime">Print</div>
            <h2 className="mt-2 font-varsity text-4xl">SCREEN PRINTED IN LAYERS</h2>
            <p className="mt-4 text-cream/80 leading-relaxed">
              Front: JESUSITY collegiate arc in cream with drop-shadow. Back: oversized GOD of the
              EAST graphic in lime. Both hand-pulled for depth and grain that digital print can't
              fake.
            </p>
          </div>
          <div>
            <div className="text-[10px] tracking-[0.3em] uppercase text-lime">Sizing (Chest)</div>
            <h2 className="mt-2 font-varsity text-4xl">S · M · L · XL · XXL</h2>
            <div className="mt-4 grid grid-cols-5 gap-1 text-center">
              {[
                ["S", "22\""],
                ["M", "24\""],
                ["L", "26\""],
                ["XL", "28\""],
                ["XXL", "30\""],
              ].map(([s, w]) => (
                <div key={s} className="border border-cream/30 p-3">
                  <div className="font-varsity">{s}</div>
                  <div className="text-[11px] text-cream/70 mt-1">{w}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
