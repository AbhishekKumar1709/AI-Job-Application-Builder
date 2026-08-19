import { SiteHeader } from "@/components/SiteHeader";
import { Hero } from "@/components/Hero";
import { Roadmap } from "@/components/Roadmap";
import { SiteFooter } from "@/components/SiteFooter";

export default function Home() {
  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <Roadmap />
      </main>
      <SiteFooter />
    </div>
  );
}
