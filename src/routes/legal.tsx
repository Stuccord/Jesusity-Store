import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/legal")({
  head: () => ({
    meta: [
      { title: "Shipping, Returns & Legal — Clovermade Studios" },
      {
        name: "description",
        content:
          "Order terms, shipping, returns, and privacy for Clovermade Studios and Jesusity drops.",
      },
      { property: "og:title", content: "Legal — Clovermade Studios" },
      { property: "og:description", content: "Terms, shipping, returns and privacy." },
    ],
    links: [{ rel: "canonical", href: "/legal" }],
  }),
  component: Legal,
});

function Legal() {
  return (
    <section className="mx-auto max-w-3xl px-4 md:px-8 py-16 md:py-24 space-y-12">
      <div>
        <div className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
          Legal & Policies
        </div>
        <h1 className="mt-2 font-varsity text-5xl md:text-6xl leading-none">
          FINE PRINT.
          <br />
          <span className="text-forest">STRAIGHT UP.</span>
        </h1>
      </div>

      <Block title="Order Terms">
        Every Jesusity Tee is held in stock and fulfilled directly upon payment confirmation. Your
        card or mobile money account is charged at checkout. Order cancellations are accepted within
        12 hours of purchase prior to dispatch.
      </Block>

      <Block title="Shipping & Delivery">
        Relative to proximity, delivery takes at most THREE WORKING DAYS no matter how far. Jesus
        rose up on the 3rd Day — so your tee will too. Every buyer receives a tracking email/SMS the
        day their order goes out. Free delivery included.
      </Block>

      <Block title="Returns & Exchanges">
        Defective or misprinted items are replaced free of charge within 14 days of delivery — email
        us with your order number and a photo. Sizing exchanges are accepted within 7 days of
        delivery provided the item is unworn and in original condition.
      </Block>

      <Block title="Privacy">
        We only collect what we need to fulfill your order and notify you about future drops. We
        don't sell your data. You can unsubscribe from marketing emails anytime.
      </Block>

      <Block title="Contact">
        For anything:{" "}
        <a className="underline" href="mailto:hello@clovermadestudios.com">
          hello@clovermadestudios.com
        </a>
        .
      </Block>
    </section>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-varsity text-2xl md:text-3xl">{title.toUpperCase()}</h2>
      <p className="mt-3 text-foreground/80 leading-relaxed">{children}</p>
    </div>
  );
}
