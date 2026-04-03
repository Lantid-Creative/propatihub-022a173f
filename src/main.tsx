import { createRoot } from "react-dom/client";
import { ThemeProvider } from "next-themes";
import "./index.css";

// Guard: if Supabase env vars are missing, show a clear error instead of a blank page
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  const root = document.getElementById("root")!;
  root.innerHTML = `
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;font-family:system-ui,sans-serif;background:#fafaf9;padding:2rem;">
      <div style="max-width:420px;text-align:center;padding:2rem;border:1px solid #e5e5e5;border-radius:1rem;background:#fff;">
        <h1 style="font-size:1.25rem;font-weight:700;margin-bottom:0.5rem;">Configuration Error</h1>
        <p style="color:#71717a;font-size:0.875rem;">The application could not connect to its backend. Please re-publish from Lovable to apply the latest configuration.</p>
        <button onclick="location.reload()" style="margin-top:1rem;padding:0.5rem 1.5rem;border-radius:0.5rem;background:#16a34a;color:#fff;border:none;cursor:pointer;font-size:0.875rem;">Reload</button>
      </div>
    </div>
  `;
} else {
  const root = createRoot(document.getElementById("root")!);

  void import("./App.tsx")
    .then(({ default: App }) => {
      root.render(
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <App />
        </ThemeProvider>
      );
    })
    .catch((error) => {
      console.error("Failed to load application", error);
      const container = document.getElementById("root");
      if (container) {
        container.innerHTML = `
          <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;font-family:system-ui,sans-serif;background:#fafaf9;padding:2rem;">
            <div style="max-width:420px;text-align:center;padding:2rem;border:1px solid #e5e5e5;border-radius:1rem;background:#fff;">
              <h1 style="font-size:1.25rem;font-weight:700;margin-bottom:0.5rem;">Application Error</h1>
              <p style="color:#71717a;font-size:0.875rem;">The app failed to start. Please refresh the page or re-publish the latest version.</p>
              <button onclick="location.reload()" style="margin-top:1rem;padding:0.5rem 1.5rem;border-radius:0.5rem;background:#16a34a;color:#fff;border:none;cursor:pointer;font-size:0.875rem;">Reload</button>
            </div>
          </div>
        `;
      }
    });
}
