import { Menu, X } from "lucide-react";
import DarkModeToggle from "./DarkModeToggle";
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "next-themes";
import logoDark from "@/assets/logo-dark.png";
import logoLight from "@/assets/logo-light.png";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, hasRole } = useAuth();
  const { theme } = useTheme();
  const location = useLocation();
  const isHome = location.pathname === "/";

  // Body scroll locking when menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [open]);

  // Handle scroll listener
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

  // Determine if the navbar should have a solid background
  const isSolid = scrolled || open;

  // Determine current logo based on theme and solid state
  // When menu is open, we always use solid background matching theme
  const currentLogo = !isSolid || theme === "dark" ? logoDark : logoLight;
  
  // Use specialized colors for the Hero overlay vs the solid scrolled/open header
  const textColor = !isSolid ? "text-white" : "text-foreground";
  const mutedTextColor = !isSolid ? "text-white/80" : "text-foreground/70";

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300 ${
        isSolid
          ? "border-border bg-background shadow-md h-20"
          : "border-transparent bg-background/0 backdrop-blur-none h-20"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <img src={currentLogo} alt="PropatiHub" className="h-9 w-auto max-w-[140px] sm:max-w-none transition-all duration-300" />
        </Link>

        <div className="hidden lg:flex items-center gap-10">
          {navLinks.map((item) => (
            <Link
              key={item.label}
              to={item.href}
              className={`${mutedTextColor} hover:text-accent font-body text-sm font-semibold transition-colors relative group`}
            >
              {item.label}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
          <div className={`h-6 w-px mx-2 ${scrolled ? 'bg-border' : 'bg-border/20'}`} />
          <DarkModeToggle className={textColor} />
          {user ? (
            <Link
              to={getDashboardLink()}
              className="bg-primary text-primary-foreground px-6 py-2.5 rounded-full font-body text-sm font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
            >
              Dashboard
            </Link>
          ) : (
            <Link
              to="/auth"
              className="bg-primary text-primary-foreground px-6 py-2.5 rounded-full font-body text-sm font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
            >
              Sign in
            </Link>
          )}
        </div>

        <div className="flex items-center gap-4 lg:hidden">
          <DarkModeToggle className={textColor} />
          <button
            onClick={() => setOpen(!open)}
            className={`${textColor} p-1 transition-transform active:scale-90`}
            aria-label="Toggle menu"
          >
            {open ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden absolute top-20 left-0 right-0 w-full grid transition-all duration-500 ease-in-out z-50 ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0 pointer-events-none"
        }`}
      >
        <div className="overflow-y-auto max-h-[calc(100vh-80px)] min-h-0 bg-background border-b border-border shadow-2xl scrollbar-hide">
          <div className="flex flex-col gap-1 p-4 pb-12">
            {navLinks.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between py-4 px-6 text-foreground font-body text-lg font-bold hover:bg-muted rounded-2xl transition-all active:scale-[0.98]"
              >
                {item.label}
                <span className="text-accent opacity-50">→</span>
              </Link>
            ))}
            <div className="h-px bg-border my-6 mx-4" />
            <div className="px-4 space-y-4">
              {user ? (
                <Link
                  to={getDashboardLink()}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center py-5 px-6 bg-primary text-primary-foreground font-body text-lg font-bold rounded-2xl shadow-xl shadow-primary/20 transition-transform active:scale-95"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <Link
                  to="/auth"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center py-5 px-6 bg-primary text-primary-foreground font-body text-lg font-bold rounded-2xl shadow-xl shadow-primary/20 transition-transform active:scale-95"
                >
                  Sign in to your account
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
