import { createRoot } from "react-dom/client";
import { ThemeProvider } from "next-themes";
import "./index.css";

// --- ENVIRONMENT VARIABLE FALLBACKS ---
// This handles cases where Lovable's publish pipeline fails to inject these anon/publishable keys.
const FALLBACKS: Record<string, string> = {
  VITE_SUPABASE_PROJECT_ID: "jszqiycbvusagcmvuvoc",
  VITE_SUPABASE_URL: "https://jszqiycbvusagcmvuvoc.supabase.co",
  VITE_SUPABASE_PUBLISHABLE_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpzenFpeWNidnVzYWdjbXZ1dm9jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0NzY3NjgsImV4cCI6MjA5MDA1Mjc2OH0.DudC8lqHMgzTnUDt5VXXpVrM8PKpMoaZOgsNXm_1VxU",
  VITE_PROPERTY_API_URL: "https://jszqiycbvusagcmvuvoc.supabase.co/functions/v1/property-api",
  VITE_APP_URL: typeof window !== "undefined" ? window.location.origin : "https://propatihub.com",
};

// Patch import.meta.env at runtime if variables are missing
Object.entries(FALLBACKS).forEach(([key, value]) => {
  if (!import.meta.env[key]) {
    // Note: This is an assignment to a property that Vite normally marks as read-only, 
    // but at runtime in the browser it's just an object we can attempt to patch.
    try {
      (import.meta.env as any)[key] = value;
    } catch (e) {
      console.warn(`Failed to patch environment variable ${key}:`, e);
    }
  }
});

const root = createRoot(document.getElementById("root")!);

// Final check before proceeding with initialization
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Critical Failure: Supabase environment variables are still missing after fallback attempt.");

  // Last resort: Show minimal useful error UI
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
  // Use dynamic import to ensure App (and its Supabase client dependency) 
  // only loads AFTER we have ensured env vars exist.
  import("./App").then(({ default: App }) => {
    root.render(
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <App />
      </ThemeProvider>
    );
  }).catch((err) => {
    console.error("Failed to load application module:", err);
  });
}
