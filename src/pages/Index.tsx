import HeroSection from "@/components/HeroSection";
import FeaturedProperties from "@/components/FeaturedProperties";
import ToolsSection from "@/components/ToolsSection";
import LocationsSection from "@/components/LocationsSection";
import ExploreSection from "@/components/ExploreSection";
import AlertSection from "@/components/AlertSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <FeaturedProperties />
      <ToolsSection />
      <LocationsSection />
      <ExploreSection />
      <AlertSection />
      <Footer />
    </div>
  );
};

export default Index;
