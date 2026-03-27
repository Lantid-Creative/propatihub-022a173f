import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

const GoToTopButton = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={`fixed bottom-6 right-6 z-50 p-3 rounded-full bg-accent text-accent-foreground shadow-xl border border-border/50 backdrop-blur-sm transition-all duration-300 ease-in-out hover:scale-110 hover:shadow-2xl ${
        visible
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 translate-y-4 pointer-events-none"
      }`}
      aria-label="Go to top"
    >
      <ArrowUp size={20} strokeWidth={2.5} />
    </button>
  );
};

export default GoToTopButton;
