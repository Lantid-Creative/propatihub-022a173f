import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { user, hasRole } = useAuth();

  const getDashboardLink = () => {
    if (hasRole("admin")) return "/admin";
    if (hasRole("agency")) return "/agency";
    if (hasRole("agent")) return "/agent";
    return "/dashboard";
  };

  return (
    <nav className="absolute top-0 left-0 right-0 z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
            <span className="text-accent-foreground font-display font-bold text-lg">P</span>
          </div>
          <span className="font-display text-xl font-bold text-primary-foreground">
            PropatiHub
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {["Find Agent", "New Developments", "Commercial", "Blog"].map((item) => (
            <a
              key={item}
              href="#"
              className="text-primary-foreground/80 hover:text-primary-foreground font-body text-sm font-medium transition-colors"
            >
              {item}
            </a>
          ))}
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
          {["Find Agent", "New Developments", "Commercial", "Blog"].map((item) => (
            <a
              key={item}
              href="#"
              className="block py-3 px-4 text-foreground font-body text-sm font-medium hover:bg-muted rounded-lg transition-colors"
            >
              {item}
            </a>
          ))}
          {user ? (
            <Link
              to={getDashboardLink()}
              className="block py-3 px-4 text-foreground font-body text-sm font-medium hover:bg-muted rounded-lg transition-colors"
            >
              Dashboard
            </Link>
          ) : (
            <Link
              to="/auth"
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
