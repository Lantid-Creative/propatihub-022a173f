import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const DarkModeToggle = ({ className = "" }: { className?: string }) => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className={`p-2.5 rounded-xl hover:bg-muted transition-all duration-300 active:scale-95 ${className}`}
      aria-label="Toggle dark mode"
    >
      {theme === "dark" ? (
        <Sun className="w-5 h-5 text-foreground animate-in zoom-in duration-300" />
      ) : (
        <Moon className="w-5 h-5 text-foreground animate-in zoom-in duration-300" />
      )}
    </button>
  );
};

export default DarkModeToggle;
