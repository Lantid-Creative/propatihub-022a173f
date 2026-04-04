import heroImg from "@/assets/hero-landing.jpg";
import Navbar from "./Navbar";
import HeroSearch from "./HeroSearch";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-[90vh] flex flex-col justify-center overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={heroImg}
          alt="Happy Nigerian family"
          className="w-full h-full object-cover scale-105 animate-subtle-zoom"
          width={1920}
          height={1080}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-background" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-20 flex flex-col items-center">
        <div className="text-center mb-10 md:mb-16">
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-display font-black text-white leading-tight mb-6 drop-shadow-2xl">
            Just ask <span className="text-accent underline decoration-accent/40 underline-offset-[12px]">PropatiHub</span>
          </h1>
          <p className="text-white/90 font-body text-lg sm:text-xl md:text-2xl max-w-2xl mx-auto leading-relaxed font-medium">
            Find homes to buy or rent and check house prices in Nigeria's most trusted property platform
          </p>
        </div>

        <div className="w-full max-w-3xl transform hover:scale-[1.01] transition-transform duration-500">
          <HeroSearch />
          
          {/* Valuation CTA - Integrated Design */}
          <div className="mt-6">
            <div className="bg-primary/90 backdrop-blur-xl rounded-2xl p-5 sm:p-7 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl border border-white/10 group">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-2xl bg-accent/20 flex items-center justify-center shrink-0 group-hover:rotate-12 transition-transform">
                  <Home className="w-6 h-6 text-accent" />
                </div>
                <div className="text-center sm:text-left">
                  <p className="text-primary-foreground font-body font-bold text-base sm:text-lg">
                    Want to know your home's value?
                  </p>
                  <p className="text-primary-foreground/70 font-body text-xs sm:text-sm mt-1">
                    Discover your latest PropatiHub house price estimate in just a few clicks.
                  </p>
                </div>
              </div>
              <Link to="/property-valuation" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto bg-accent text-accent-foreground hover:bg-accent/90 font-bold text-sm uppercase tracking-widest px-8 h-12 rounded-xl border-b-4 border-accent-foreground/10 active:border-b-0 active:translate-y-1 transition-all">
                  Get instant valuation
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
