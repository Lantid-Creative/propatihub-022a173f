import heroImg from "@/assets/hero-landing.jpg";
import Navbar from "./Navbar";
import HeroSearch from "./HeroSearch";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-[85vh] flex flex-col">
      <img
        src={heroImg}
        alt="Happy Nigerian family celebrating new home"
        className="absolute inset-0 w-full h-full object-cover"
        width={1920}
        height={1080}
      />
      <div className="hero-gradient absolute inset-0" />

      <Navbar />

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pt-16">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-white text-center max-w-4xl leading-[1.1] mb-5">
          Just ask <span className="text-accent">PropatiHub</span>
        </h1>
        <p className="text-white/80 font-body text-lg md:text-xl text-center max-w-xl mb-10">
          Find homes to buy or rent and check house prices
        </p>

        <HeroSearch />

        {/* Valuation CTA bar inside search */}
        <div className="w-full max-w-2xl mt-0">
          <div className="bg-primary rounded-b-xl px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Home className="w-5 h-5 text-accent shrink-0" />
              <div>
                <p className="text-primary-foreground font-body font-semibold text-sm">
                  Want to know your home's value?
                </p>
                <p className="text-primary-foreground/60 font-body text-xs">
                  Discover your latest PropatiHub house price estimate in just a few clicks.
                </p>
              </div>
            </div>
            <Link to="/property-valuation">
              <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold whitespace-nowrap">
                Get an instant valuation
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
