import AboutUsSection from "@/components/about-us-section";
import FaqSection from "@/components/faq-section";
import Hero from "@/components/hero";
import HowItWorksSection from "@/components/how-it-works-section";
export default function Home() {
  return (
    <main>
      <Hero />
      <HowItWorksSection />
      <AboutUsSection />
      <FaqSection />
    </main>
  );
}
