import { AboutSection } from "@/components/sections/about-section";
import { FeatureGrid } from "@/components/sections/feature-grid";
import { HeroSection } from "@/components/sections/hero-section";
import { HowItWorksSection } from "@/components/sections/how-it-works-section";
import { Navbar } from "@/components/layout/navbar";

export default function HomePage() {
  return (
    <main className="relative overflow-hidden">
      <Navbar />
      <HeroSection />
      <FeatureGrid />
      <HowItWorksSection />
      <AboutSection />
    </main>
  );
}
