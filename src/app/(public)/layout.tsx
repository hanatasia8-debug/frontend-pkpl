import { Navbar } from "@/widgets/navbar/navbar";
import { Footer } from "@/widgets/footer/footer";
import { ScrollRevealProvider } from "@/shared/ui/scroll-reveal-provider";
import { KknMemorialProvider } from "@/features/kkn-memorial/ui/kkn-memorial-provider";

/**
 * Every public route renders live CMS content through the mandatory
 * Page → Service → API → Database chain. That chain calls this app's own
 * Route Handlers over HTTP, which by definition cannot work while the page is
 * being prerendered at build time (no server is listening yet, and the request
 * origin is unknown). Prerendering these routes would bake permanently empty
 * sections into the HTML, so the whole public segment renders per request.
 *
 * NOTE: `dynamic` is removed once Cache Components is enabled — if
 * `cacheComponents` is ever turned on in `next.config.ts`, replace this with
 * `await connection()` (from `next/server`) at the top of each data-fetching
 * component instead.
 */
export const dynamic = "force-dynamic";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ScrollRevealProvider />
      <KknMemorialProvider />
      <Navbar />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  );
}

