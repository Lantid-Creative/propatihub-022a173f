import { Menu, X } from "lucide-react";
import DarkModeToggle from "./DarkModeToggle";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import logoDark from "@/assets/logo-dark.png";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, hasRole } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const getDashboardLink = () => {
    if (hasRole("admin")) return "/admin";
    if (hasRole("agency")) return "/agency";
    if (hasRole("agent")) return "/agent";
    return "/dashboard";
  };

  const navLinks = [
    { label: "Buy", href: "/for-sale" },
    { label: "Rent", href: "/to-rent" },
    { label: "Bid", href: "/bid" },
    { label: "House Prices", href: "/house-prices" },
    { label: "Find Agents", href: "/find-agents" },
    { label: "Valuation", href: "/property-valuation" },
  ];

  return (
    <nav
      className={`sticky top-0 left-0 right-0 z-50 px-6 py-4 transition-all duration-300 ${
        scrolled
          ? "bg-primary/95 backdrop-blur-sm shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/">
          <img src={logoDark} alt="PropatiHub" className="h-8 w-auto" />
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((item) => (
            <Link
              key={item.label}
              to={item.href}
              className="text-primary-foreground/80 hover:text-primary-foreground font-body text-sm font-medium transition-colors"
            >
              {item.label}
            </Link>
          ))}
          <DarkModeToggle />
          {user ? (
            <Link
              to={getDashboardLink()}
              className="border border-primary-foreground/30 text-primary-foreground px-5 py-2 rounded-lg font-body text-sm font-medium hover:bg-primary-foreground/10 transition-colors"
            >
              Dashboard
            </Link>
          ) : (
            <Link
              to="/auth"
              className="border border-primary-foreground/30 text-primary-foreground px-5 py-2 rounded-lg font-body text-sm font-medium hover:bg-primary-foreground/10 transition-colors"
            >
              Sign in
            </Link>
          )}
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-primary-foreground"
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden mt-4 bg-card rounded-xl p-4 shadow-xl">
          {navLinks.map((item) => (
            <Link
              key={item.label}
              to={item.href}
              onClick={() => setOpen(false)}
              className="block py-3 px-4 text-foreground font-body text-sm font-medium hover:bg-muted rounded-lg transition-colors"
            >
              {item.label}
            </Link>
          ))}
          {user ? (
            <Link
              to={getDashboardLink()}
              onClick={() => setOpen(false)}
              className="block py-3 px-4 text-foreground font-body text-sm font-medium hover:bg-muted rounded-lg transition-colors"
            >
              Dashboard
            </Link>
          ) : (
            <Link
              to="/auth"
              onClick={() => setOpen(false)}
              className="block py-3 px-4 text-foreground font-body text-sm font-medium hover:bg-muted rounded-lg transition-colors"
            >
              Sign in
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
