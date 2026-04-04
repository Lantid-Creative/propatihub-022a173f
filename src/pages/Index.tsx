import PageSEO from "@/components/PageSEO";
import HeroSection from "@/components/HeroSection";
import NYSCBanner from "@/components/NYSCBanner";
import FeaturedProperties from "@/components/FeaturedProperties";
import ToolsSection from "@/components/ToolsSection";
import OwnerCTASection from "@/components/OwnerCTASection";
import PMShowcaseSection from "@/components/PMShowcaseSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import DigitalDocsSection from "@/components/DigitalDocsSection";
import LegalContractSection from "@/components/LegalContractSection";
import DisputeSection from "@/components/DisputeSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import LocationsSection from "@/components/LocationsSection";
import ExploreSection from "@/components/ExploreSection";
import AlertSection from "@/components/AlertSection";
import LatestNewsSection from "@/components/LatestNewsSection";
import TrustSection from "@/components/TrustSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background pb-32">
      <PageSEO
        title="PropatiHub — Buy, Rent & Manage Properties in Nigeria"
        description="Nigeria's trusted property platform. Browse verified listings, manage rentals with escrow protection, and find estate agents across all 36 states + FCT."
        canonical="/"
      />
      <HeroSection />
      
      <div className="flex flex-col gap-24 md:gap-32 mt-24 md:mt-32">
        <FeaturedProperties />
        <ToolsSection />
        <OwnerCTASection />
        <PMShowcaseSection />
        <HowItWorksSection />
        <DigitalDocsSection />
        <LegalContractSection />
        <DisputeSection />
        <TestimonialsSection />
        <NYSCBanner />
        <TrustSection />
        <LocationsSection />
        <ExploreSection />
        <LatestNewsSection />
        <AlertSection />
      </div>
    </div>
  );
};

export default Index;
