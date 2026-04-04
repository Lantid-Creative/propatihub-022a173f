import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  
  // These are the fallback values that will be injected if they are missing from the environment
  const fallbacks = {
    VITE_SUPABASE_PROJECT_ID: "jszqiycbvusagcmvuvoc",
    VITE_SUPABASE_URL: "https://jszqiycbvusagcmvuvoc.supabase.co",
    VITE_SUPABASE_PUBLISHABLE_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpzenFpeWNidnVzYWdjbXZ1dm9jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0NzY3NjgsImV4cCI6MjA5MDA1Mjc2OH0.DudC8lqHMgzTnUDt5VXXpVrM8PKpMoaZOgsNXm_1VxU",
    VITE_PROPERTY_API_URL: "https://jszqiycbvusagcmvuvoc.supabase.co/functions/v1/property-api",
    VITE_APP_URL: "https://propatihub.com",
  };

  return {
    build: {
      chunkSizeWarningLimit: 1500,
    },
    server: {
      host: "::",
      port: 8080,
      hmr: {
        overlay: false,
      },
    },
    plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
      dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
    },
    // We use define to hardcode fallbacks into the resulting build files.
    // This solves the issue where Lovable's publish pipeline doesn't inject VITE_ vars.
    define: {
      "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(env.VITE_SUPABASE_URL || fallbacks.VITE_SUPABASE_URL),
      "import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY": JSON.stringify(env.VITE_SUPABASE_PUBLISHABLE_KEY || fallbacks.VITE_SUPABASE_PUBLISHABLE_KEY),
      "import.meta.env.VITE_SUPABASE_PROJECT_ID": JSON.stringify(env.VITE_SUPABASE_PROJECT_ID || fallbacks.VITE_SUPABASE_PROJECT_ID),
      "import.meta.env.VITE_PROPERTY_API_URL": JSON.stringify(env.VITE_PROPERTY_API_URL || fallbacks.VITE_PROPERTY_API_URL),
      "import.meta.env.VITE_APP_URL": JSON.stringify(env.VITE_APP_URL || fallbacks.VITE_APP_URL),
    },
  };
});
