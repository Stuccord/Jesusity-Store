import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { MobilePreorderBar } from "@/components/MobilePreorderBar";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4">
      <div className="max-w-md text-center">
        <div className="font-logo text-6xl text-forest-deep">Jesusity</div>
        <h1 className="font-varsity text-7xl text-forest-deep mt-4">404</h1>
        <h2 className="mt-4 text-xl font-bold tracking-widest uppercase">Page Not Found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The endless pursuit continues — but this page doesn't exist.
        </p>
        <div className="mt-6">
          <Link to="/" className="btn-drop">
            Back to the Drop
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4">
      <div className="max-w-md text-center">
        <h1 className="font-varsity text-3xl text-forest-deep">Something Broke</h1>
        <p className="mt-2 text-sm text-muted-foreground">Give it another try or head home.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="btn-drop"
          >
            Try Again
          </button>
          <a href="/" className="btn-outline-dark">
            Go Home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Jesusity — The Endless Pursuit of the Son of God | Clovermade Studios" },
      {
        name: "description",
        content:
          "Preorder the Jesusity Tee — an oversized heavyweight cotton faith-rooted streetwear drop from Clovermade Studios. Limited run. Ships August 2026.",
      },
      { name: "author", content: "Clovermade Studios" },
      { name: "theme-color", content: "#173628" },
      { property: "og:title", content: "Jesusity — Drop 001 | Clovermade Studios" },
      {
        property: "og:description",
        content:
          "The endless pursuit of the Son of God. Preorder the Jesusity Tee in Forest Green — a limited faith-rooted streetwear drop.",
      },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Clovermade Studios" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Jesusity — Drop 001" },
      {
        name: "twitter:description",
        content: "Preorder the Jesusity Tee. Limited faith-rooted streetwear drop.",
      },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Alfa+Slab+One&family=Satisfy&family=UnifrakturMaguntia&family=Space+Grotesk:wght@400;500;600;700&display=swap",
      },
      { rel: "icon", href: "/favicon.png", type: "image/png" },
    ],
    scripts: [
      // Paystack loaded globally so window.PaystackPop is ready on client-side navigation to /checkout
      { src: "https://js.paystack.co/v1/inline.js", async: true },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen flex flex-col bg-cream text-forest-deep">
        <Nav />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
        <MobilePreorderBar />
      </div>
    </QueryClientProvider>
  );
}
