import HeroSection from "@/components/HeroSection";
import FeaturedProperties from "@/components/FeaturedProperties";
import ToolsSection from "@/components/ToolsSection";
import OwnerCTASection from "@/components/OwnerCTASection";
import PMShowcaseSection from "@/components/PMShowcaseSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import DigitalDocsSection from "@/components/DigitalDocsSection";
import LegalContractSection from "@/components/LegalContractSection";
import DisputeSection from "@/components/DisputeSection";
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
      <OwnerCTASection />
      <PMShowcaseSection />
      <HowItWorksSection />
      <DigitalDocsSection />
      <LegalContractSection />
      <DisputeSection />
      <TrustSection />
      <LocationsSection />
      <ExploreSection />
      <AlertSection />
      <Footer />
    </div>
  );
};

export default Index;
