import { createFileRoute, Link } from "@tanstack/react-router";
import { Ticker } from "@/components/Ticker";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Clovermade Studios — The Endless Pursuit" },
      {
        name: "description",
        content:
          "Clovermade Studios makes faith-rooted streetwear for a generation raised on sneakers and scripture. Read the story behind Jesusity.",
      },
      { property: "og:title", content: "About Clovermade Studios" },
      {
        property: "og:description",
        content: "Faith-rooted streetwear for the endless pursuit.",
      },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: About,
});

function About() {
  return (
    <>
      <section className="mx-auto max-w-4xl px-4 md:px-8 py-20 md:py-28 text-center">
        <div className="font-logo text-7xl md:text-8xl text-forest-deep leading-none">
          Clovermade
        </div>
        <div className="mt-1 text-[11px] tracking-[0.4em] uppercase text-muted-foreground">
          Studios
        </div>
        <h1 className="mt-8 font-varsity text-4xl md:text-6xl leading-tight">
          FAITH ON THE FRONT.
          <br />
          <span className="text-forest">CULTURE ON THE COLLAR.</span>
        </h1>
      </section>
      <Ticker />
      <section className="mx-auto max-w-3xl px-4 md:px-8 py-20 space-y-8 text-lg leading-relaxed">
        <p>
          Clovermade Studios was born from a simple frustration: Christian apparel that looked like
          it belonged in a giftshop instead of a rotation. We grew up in sneakers and streetwear.
          We also grew up in scripture. The two never had to compete — but the merch never caught
          up.
        </p>
        <p>
          <strong className="font-varsity text-forest-deep text-xl block">
            SO WE BUILT WHAT WE WISHED EXISTED.
          </strong>
          Heavyweight cotton. Oversized fits. Screen-printed graphics that carry weight. Every
          drop is a chapter of the same story: the endless pursuit of the Son of God.
        </p>
        <p>
          <em className="text-forest">Jesusity</em> — a word we made for the way we live. It's
          not a slogan and it's not a season. It's a pursuit. And it doesn't end.
        </p>
        <div className="border-l-4 border-lime pl-6 py-2">
          <div className="font-varsity text-xl">DROP 001 · JESUSITY TEE</div>
          <div className="text-sm text-muted-foreground mt-1 tracking-widest uppercase">
            Forest Green · Preorder · Ships August 2026
          </div>
        </div>
        <div className="pt-6 text-center">
          <Link to="/product" className="btn-drop">
            Shop Drop 001
          </Link>
        </div>
      </section>
    </>
  );
}
