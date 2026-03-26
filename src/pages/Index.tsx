import HeroSection from "@/components/HeroSection";
import FeaturedProperties from "@/components/FeaturedProperties";
import ToolsSection from "@/components/ToolsSection";
import PMShowcaseSection from "@/components/PMShowcaseSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import DigitalDocsSection from "@/components/DigitalDocsSection";
import LegalContractSection from "@/components/LegalContractSection";
import LocationsSection from "@/components/LocationsSection";
import ExploreSection from "@/components/ExploreSection";
import AlertSection from "@/components/AlertSection";
import TrustSection from "@/components/TrustSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <FeaturedProperties />
      <ToolsSection />
      <PMShowcaseSection />
      <HowItWorksSection />
      <DigitalDocsSection />
      <LegalContractSection />
      <TrustSection />
      <LocationsSection />
      <ExploreSection />
      <AlertSection />
      <Footer />
    </div>
  );
};

export default Index;
