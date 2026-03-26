import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const AlertSection = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);

  const handleCreateAlert = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    if (!email.trim()) {
      toast({ title: "Enter a location or keyword", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("saved_searches").insert({
      user_id: user.id,
      name: email.trim(),
      filters: { keyword: email.trim() },
      alert_enabled: true,
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Alert created!", description: "You'll be notified when matching properties are listed." });
      setEmail("");
    }
    setSaving(false);
  };

  return (
    <section className="py-20 px-6">
      <div className="max-w-4xl mx-auto bg-primary rounded-2xl p-10 md:p-16 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/5 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10">
          <div className="w-14 h-14 rounded-2xl gold-gradient flex items-center justify-center mx-auto mb-6">
            <Mail className="w-7 h-7 text-accent-foreground" />
          </div>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-primary-foreground mb-4">
            Never Miss a New Listing
          </h2>
          <p className="text-primary-foreground/70 font-body mb-8 max-w-md mx-auto">
            Set up property alerts and be the first to know when new homes hit the market in your preferred area
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateAlert()}
              placeholder="Enter a location e.g. Lekki, Abuja..."
              className="flex-1 px-4 py-3 rounded-lg bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/40 outline-none font-body text-sm focus:border-accent transition-colors"
            />
            <button
              onClick={handleCreateAlert}
              disabled={saving}
              className="gold-gradient text-accent-foreground px-6 py-3 rounded-lg font-body font-semibold hover:opacity-90 transition-opacity whitespace-nowrap disabled:opacity-50"
            >
              {saving ? "Saving..." : "Create Alert"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AlertSection;
