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
      className={`fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300 ${
        scrolled
          ? "border-border bg-background/95 backdrop-blur-sm shadow-sm"
          : "border-transparent bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex h-16 items-center justify-between">
        <Link to="/">
          <img src={logoDark} alt="PropatiHub" className="h-8 w-auto max-w-[120px] sm:max-w-none" />
        </Link>

        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((item) => (
            <Link
              key={item.label}
              to={item.href}
              className="text-foreground/70 hover:text-foreground font-body text-sm font-medium transition-colors"
            >
              {item.label}
            </Link>
          ))}
          <DarkModeToggle />
          {user ? (
            <Link
              to={getDashboardLink()}
              className="border border-border text-foreground px-5 py-2 rounded-lg font-body text-sm font-medium hover:bg-muted transition-colors"
            >
              Dashboard
            </Link>
          ) : (
            <Link
              to="/auth"
              className="border border-border text-foreground px-5 py-2 rounded-lg font-body text-sm font-medium hover:bg-muted transition-colors"
            >
              Sign in
            </Link>
          )}
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <DarkModeToggle />
          <button
            onClick={() => setOpen(!open)}
            className="text-foreground"
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <div
        className={`lg:hidden absolute top-full left-0 right-0 w-full grid transition-[grid-template-rows] duration-300 ease-out z-50 ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0 pointer-events-none"
        }`}
      >
        <div className="overflow-hidden min-h-0">
          <div className="border-t border-border bg-background/95 backdrop-blur-md text-foreground shadow-xl">
            <div className="flex flex-col gap-1 px-4 sm:px-6 py-4">
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
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
