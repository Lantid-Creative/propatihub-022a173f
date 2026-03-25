import HeroSection from "@/components/HeroSection";
import LocationsSection from "@/components/LocationsSection";
import FeaturedProperties from "@/components/FeaturedProperties";
import FeaturesSection from "@/components/FeaturesSection";
import AlertSection from "@/components/AlertSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <LocationsSection />
      <FeaturedProperties />
      <FeaturesSection />
      <AlertSection />
      <Footer />
    </div>
  );
};

export default Index;
