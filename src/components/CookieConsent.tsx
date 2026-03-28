import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Cookie } from "lucide-react";

const COOKIE_KEY = "propatihub_cookie_consent";

const CookieConsent = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_KEY);
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    localStorage.setItem(COOKIE_KEY, "accepted");
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem(COOKIE_KEY, "declined");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 p-2 sm:p-4 animate-in slide-in-from-bottom-4 duration-500">
      <div className="max-w-4xl mx-auto bg-card border border-border rounded-xl shadow-lg p-3 sm:p-5 flex flex-col sm:flex-row items-center sm:items-center gap-3 sm:gap-4">
        <Cookie className="w-5 h-5 sm:w-6 sm:h-6 text-accent shrink-0" />
        <p className="text-[11px] sm:text-sm text-muted-foreground flex-1 text-center sm:text-left leading-tight sm:leading-normal">
          We use cookies to enhance your experience and analyse traffic.
          Read our{" "}
          <Link to="/privacy" className="text-accent underline underline-offset-2 hover:text-accent/80">
            Privacy Policy
          </Link>.
        </p>
        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-center">
          <Button variant="outline" size="sm" className="h-7 px-3 text-[10px] sm:h-9 sm:px-4 sm:text-xs" onClick={decline}>
            Decline
          </Button>
          <Button size="sm" className="h-7 px-3 text-[10px] sm:h-9 sm:px-4 sm:text-xs" onClick={accept}>
            Accept All
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
