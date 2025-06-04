import FaqSection from "@/components/faq-section";
import Hero from "@/components/hero";
import HowItWorksSection from "@/components/how-it-works-section";
import Vision from "@/components/vision";
export default function Home() {
  return (
    <main>
      <Hero />

      <HowItWorksSection />
      <Vision />
      <FaqSection />
    </main>
  );
}
