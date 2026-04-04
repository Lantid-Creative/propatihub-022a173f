import { createRoot } from "react-dom/client";
import { ThemeProvider } from "next-themes";
import "./index.css";

const root = createRoot(document.getElementById("root")!);

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  // Diagnostic log for production troubleshooting
  console.warn("PropatiHub initialization error: Supabase environment variables are missing.", {
    urlFound: !!supabaseUrl,
    keyFound: !!supabaseKey
  });
  
  // Backend env vars missing — show friendly message instead of blank screen
  document.getElementById("root")!.innerHTML = `
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;font-family:system-ui,sans-serif;background:#fafaf9;padding:2rem;">
      <div style="max-width:480px;text-align:center;padding:2rem;border:1px solid #e5e5e5;border-radius:1rem;background:#fff;">
        <h1 style="font-size:1.5rem;font-weight:700;margin-bottom:0.75rem;color:#1a1a2e;">PropatiHub is launching soon!</h1>
        <p style="color:#71717a;font-size:0.95rem;line-height:1.6;">We're putting the finishing touches on Nigeria's premier property platform. Please check back shortly.</p>
        <button onclick="location.reload()" style="margin-top:1.25rem;padding:0.6rem 2rem;border-radius:0.5rem;background:#16a34a;color:#fff;border:none;cursor:pointer;font-size:0.9rem;font-weight:600;">Refresh</button>
      </div>
    </div>
  `;
} else {
  import("./App").then(({ default: App }) => {
    root.render(
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <App />
      </ThemeProvider>
    );
  });
}
