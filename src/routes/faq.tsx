import { createFileRoute } from "@tanstack/react-router";
import { FAQ } from "@/components/FAQ";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "Preorder FAQ — Jesusity | Clovermade Studios" },
      {
        name: "description",
        content:
          "Answers about the Jesusity preorder — ship dates, sizing, fit, fabric, colorways, returns and more.",
      },
      { property: "og:title", content: "Preorder FAQ — Jesusity" },
      {
        property: "og:description",
        content: "Everything you need to know before you preorder the Jesusity Tee.",
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
              name: "What does preorder mean and when will I receive my order?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Preorder means you reserve your tee before we print it. Drop 001 preorders close July 27, 2026 — ships August 2026.",
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
    q: "What does preorder mean and when will I get my order?",
    a: "Preorder means you're reserving your tee before it's produced. Drop 001 preorders close on July 27, 2026, then we go straight into production. Estimated ship window: August 2026. You'll get a tracking email the day yours ships.",
  },
  {
    q: "Why isn't this available for immediate purchase?",
    a: "Because we don't overproduce. Drops are made to demand — you commit, we print, you get first. No warehouse full of unsold inventory, no restocks after the window closes. It also lets us keep the quality up and the run intentional.",
  },
  {
    q: "What's the fit like — should I size up or down?",
    a: "The Jesusity Tee runs oversized and boxy by design. If you like a drop-shoulder streetwear silhouette, order your normal size. If you want it more fitted, size down one. Chest measurements: S 22\" · M 24\" · L 26\" · XL 28\" · XXL 30\".",
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
    q: "How much is shipping and where do you ship?",
    a: "Domestic US shipping is a flat rate calculated at checkout. We ship worldwide — international rates apply based on destination.",
  },
  {
    q: "What's your return policy?",
    a: "Because every tee is made to order for the preorder run, sales are final on sizing changes after the window closes. Defective or misprinted items are replaced free of charge — reach out within 14 days of delivery.",
  },
  {
    q: "How do I care for it?",
    a: "Cold wash inside out, hang dry, low iron on the reverse. Never tumble dry the prints — heavyweight cotton and screen prints last longest when you treat them right.",
  },
  {
    q: "Can I cancel my preorder?",
    a: "Yes — cancellations are open until the preorder window closes and production begins. After that, cancellations aren't possible because the tee has already been printed for you.",
  },
];

function FAQPage() {
  return (
    <section className="mx-auto max-w-4xl px-4 md:px-8 py-16 md:py-24">
      <div className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
        The Preorder Handbook
      </div>
      <h1 className="mt-2 font-varsity text-5xl md:text-7xl leading-none">
        FAQ.
        <br />
        <span className="text-forest">READ FIRST.</span>
      </h1>
      <p className="mt-6 max-w-2xl text-foreground/80">
        Drop culture works when everyone knows what they're signing up for. Here's every answer
        upfront.
      </p>
      <div className="mt-10">
        <FAQ items={items} />
      </div>
    </section>
  );
}
