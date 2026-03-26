import { Phone, Mail, MapPin } from "lucide-react";
import logoDark from "@/assets/logo-dark.png";

const footerLinks = {
  "Property Types": ["Houses for Sale", "Flats for Rent", "Land for Sale", "Commercial", "Short Let"],
  Locations: ["Lagos", "Abuja", "Port Harcourt", "Ibadan", "Enugu", "Kano"],
  Company: ["About Us", "Careers", "Blog", "Press", "Contact"],
  Support: ["Help Centre", "Agent Portal", "Advertise", "Terms of Service", "Privacy Policy"],
};

const Footer = () => {
  return (
    <footer className="bg-foreground text-background py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-6 gap-10 mb-12">
          <div className="md:col-span-2">
            <div className="mb-4">
              <img src={logoDark} alt="PropatiHub" className="h-8 w-auto" />
            </div>
            <p className="text-background/60 font-body text-sm leading-relaxed mb-6">
              Nigeria's most trusted property platform. Find verified homes, land, and commercial properties across all 36 states.
            </p>
            <div className="space-y-2">
              <a href="#" className="flex items-center gap-2 text-background/60 hover:text-background font-body text-sm transition-colors">
                <Phone className="w-4 h-4" /> +234 (0) 800 PROPATI
              </a>
              <a href="#" className="flex items-center gap-2 text-background/60 hover:text-background font-body text-sm transition-colors">
                <Mail className="w-4 h-4" /> hello@propatihub.ng
              </a>
              <a href="#" className="flex items-center gap-2 text-background/60 hover:text-background font-body text-sm transition-colors">
                <MapPin className="w-4 h-4" /> Victoria Island, Lagos
              </a>
            </div>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-display font-bold text-sm mb-4">{title}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-background/50 hover:text-background font-body text-sm transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-background/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-background/40 font-body text-xs">
            © 2026 PropatiHub. All rights reserved.
          </p>
          <p className="text-background/40 font-body text-xs">
            Built with 🇳🇬 for Nigerians
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
