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
      className={`p-2 rounded-lg hover:bg-primary-foreground/10 transition-colors ${className}`}
      aria-label="Toggle dark mode"
    >
      {theme === "dark" ? (
        <Sun className="w-4 h-4 text-primary-foreground" />
      ) : (
        <Moon className="w-4 h-4 text-primary-foreground" />
      )}
    </button>
  );
};

export default DarkModeToggle;
