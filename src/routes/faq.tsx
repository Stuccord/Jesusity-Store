import { createFileRoute } from "@tanstack/react-router";
import { FAQ } from "@/components/FAQ";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — Jesusity Tee | Clovermade Studios" },
      {
        name: "description",
        content:
          "Answers about the Jesusity Tee — delivery time, sizing, fit, fabric, colorways, returns and more.",
      },
      { property: "og:title", content: "FAQ — Jesusity Tee | Clovermade Studios" },
      {
        property: "og:description",
        content: "Everything you need to know before ordering the Jesusity Tee.",
      },
    ],
    links: [{ rel: "canonical", href: "/faq" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: "How long does delivery take?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Relative to proximity, delivery takes at most THREE WORKING DAYS no matter how far. Jesus rose on the 3rd Day — your tee will too.",
              },
            },
          ],
        }),
      },
    ],
  }),
  component: FAQPage,
});

const items = [
  {
    q: "How long does delivery take?",
    a: "Relative to proximity, delivery takes at most THREE WORKING DAYS no matter how far you are. Jesus rose up on the 3rd Day — and so will your tee. You'll get a tracking email the day yours ships.",
  },
  {
    q: "Do you ship internationally?",
    a: "Yes — we ship worldwide. The three working day promise applies no matter the destination.",
  },
  {
    q: "What's the fit like — should I size up or down?",
    a: 'The Jesusity Tee runs oversized and boxy by design. If you like a drop-shoulder streetwear silhouette, order your normal size. If you want it more fitted, size down one. Chest measurements: S 22" · M 24" · L 26" · XL 28" · XXL 30".',
  },
  {
    q: "What's the meaning behind 'GOD of the EAST'?",
    a: "It's a nod to Matthew 2:2 — the wise men followed a rising star in the East to worship Christ. It's a picture of the endless pursuit: chasing the Son across distance, doubt, and time.",
  },
  {
    q: "Will there be other colorways or designs?",
    a: "Yes. Drop 001 is Forest Green only — a single limited run. New colorways and designs release as separate drops. Join the notify list at the bottom of any page to hear about Drop 002 first.",
  },
  {
    q: "How much is shipping?",
    a: "Shipping is free and included in the price. Delivery is at most three working days.",
  },
  {
    q: "What's your return policy?",
    a: "Each tee is made with intention. Defective or misprinted items are replaced free of charge — reach out within 14 days of delivery. Sizing returns are accepted if the tee is unworn and in original condition.",
  },
  {
    q: "How do I care for it?",
    a: "Cold wash inside out, hang dry, low iron on the reverse. Never tumble dry the prints — heavyweight cotton and screen prints last longest when you treat them right.",
  },
  {
    q: "Can I cancel my order?",
    a: "Yes — orders can be cancelled within 12 hours of purchase if they haven't been packed yet. Contact us immediately at support@clovermadestudios.store.",
  },
];

function FAQPage() {
  return (
    <section className="mx-auto max-w-4xl px-4 md:px-8 py-16 md:py-24">
      <div className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
        The Order Handbook
      </div>
      <h1 className="mt-2 font-varsity text-5xl md:text-7xl leading-none">
        FAQ.
        <br />
        <span className="text-forest">READ FIRST.</span>
      </h1>
      <p className="mt-6 max-w-2xl text-foreground/80">
        Every question answered before you order. We don't hide anything.
      </p>
      <div className="mt-10">
        <FAQ items={items} />
      </div>
    </section>
  );
}
