import { Link } from "react-router-dom";
import { GraduationCap, MapPin, Shield, ArrowRight, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import nyscIllustration from "@/assets/nysc-housing-illustration.jpg";

const highlights = [
  { icon: MapPin, text: "Near NYSC secretariats & CDS venues" },
  { icon: Shield, text: "Verified & vetted listings" },
  { icon: GraduationCap, text: "Budget-friendly for corps members" },
];

const NYSCBanner = () => (
  <section className="relative overflow-hidden bg-primary">
    {/* Decorative background pattern */}
    <div className="absolute inset-0 opacity-[0.06]">
      <div className="absolute top-6 left-10 w-40 h-40 rounded-full border-2 border-primary-foreground" />
      <div className="absolute bottom-4 right-16 w-56 h-56 rounded-full border-2 border-primary-foreground" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full border border-primary-foreground" />
    </div>

    <div className="relative max-w-6xl mx-auto px-6 py-14 md:py-16 flex flex-col gap-10">
      <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
        {/* Left: Icon badge */}
        <div className="shrink-0 flex items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-accent/20 border border-accent/30">
          <GraduationCap className="w-10 h-10 md:w-12 md:h-12 text-accent" />
        </div>

        {/* Centre: Copy */}
        <div className="flex-1 text-center md:text-left">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-accent mb-2">
            For Corps Members
          </span>
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-primary-foreground mb-3">
            Find NYSC-Friendly Housing Across Nigeria
          </h2>
          <p className="text-primary-foreground/70 max-w-xl mb-5">
            Affordable, verified accommodation close to your place of primary assignment — available in all 36 states + FCT.
          </p>

          <ul className="flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-2 mb-6">
            {highlights.map((h) => (
              <li key={h.text} className="flex items-center gap-2 text-sm text-primary-foreground/80">
                <h.icon className="w-4 h-4 text-accent" />
                {h.text}
              </li>
            ))}
          </ul>

          <Button
            asChild
            size="lg"
            className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold rounded-xl px-8"
          >
            <Link to="/nysc-housing">
              Browse NYSC Housing
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Corps member testimonial */}
      <div className="relative bg-primary-foreground/10 rounded-xl p-6 md:p-8 border border-primary-foreground/10 max-w-3xl mx-auto md:mx-0 md:ml-32">
        <Quote className="absolute -top-3 left-6 w-8 h-8 text-accent fill-accent/20" />
        <blockquote className="text-primary-foreground/90 text-sm md:text-base italic leading-relaxed mb-4">
          "I was posted to Enugu and had no idea where to stay. PropatiHub helped me find a safe, affordable place
          just 10 minutes from my PPA within my first week. Absolute lifesaver for corps members!"
        </blockquote>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-sm font-semibold text-accent">
            IS
          </div>
          <div>
            <p className="text-sm font-semibold text-primary-foreground">Ibrahim Sule</p>
            <p className="text-xs text-primary-foreground/60">NYSC Member, Batch C · Enugu</p>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default NYSCBanner;
