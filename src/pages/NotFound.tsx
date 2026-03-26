import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="text-center max-w-md">
        <p className="text-8xl font-display font-bold text-accent mb-4">404</p>
        <h1 className="text-2xl font-display font-bold text-foreground mb-2">Page not found</h1>
        <p className="text-muted-foreground font-body mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex gap-3 justify-center">
          <Link to="/">
            <Button><Home className="w-4 h-4 mr-2" /> Go Home</Button>
          </Link>
          <Link to="/properties">
            <Button variant="outline"><Search className="w-4 h-4 mr-2" /> Browse Properties</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
