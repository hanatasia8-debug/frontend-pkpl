import { Navbar } from "@/widgets/navbar/navbar";
import { Footer } from "@/widgets/footer/footer";
import { ScrollRevealProvider } from "@/shared/ui/scroll-reveal-provider";

export const dynamic = "force-dynamic";

export default function SubmitLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ScrollRevealProvider />
      <Navbar />
      <main className="min-h-screen pt-16">{children}</main>
      <Footer />
    </>
  );
}
