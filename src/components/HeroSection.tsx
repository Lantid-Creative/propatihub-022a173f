import heroImg from "@/assets/hero-home.jpg";
import Navbar from "./Navbar";
import HeroSearch from "./HeroSearch";
import { Building2 } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-[90vh] flex flex-col">
      <img
        src={heroImg}
        alt="Luxury Nigerian home"
        className="absolute inset-0 w-full h-full object-cover"
        width={1920}
        height={1080}
      />
      <div className="hero-gradient absolute inset-0" />

      <Navbar />

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pt-20">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-primary-foreground text-center max-w-4xl leading-tight mb-6">
          Find Your Perfect
          <span className="block text-accent">Home in Nigeria</span>
        </h1>
        <p className="text-primary-foreground/70 font-body text-lg md:text-xl text-center max-w-xl mb-10">
          Search thousands of properties across Lagos, Abuja, Port Harcourt and beyond
        </p>

        <HeroSearch />

        <div className="mt-8 flex items-center gap-2 text-primary-foreground/50 font-body text-sm">
          <Building2 className="w-4 h-4" />
          <span>Over 25,000 verified properties listed</span>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
