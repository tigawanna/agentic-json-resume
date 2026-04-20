import { useScrollReveal } from "@/hooks/useScrollReveal";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import PipelineSection from "@/components/PipelineSection";
import FooterSection from "@/components/FooterSection";

const Index = () => {
  useScrollReveal();

  return (
    <div className="min-h-dvh bg-background bg-grid">
      <Navbar />
      <HeroSection />
      <PipelineSection />
      <FooterSection />
    </div>
  );
};

export default Index;
