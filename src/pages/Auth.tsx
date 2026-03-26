import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Building2, User, Home, Users, ArrowLeft, ArrowRight } from "lucide-react";
import logoDark from "@/assets/logo-dark.png";
import logoLight from "@/assets/logo-light.png";

type AccountType = "buyer" | "agent" | "agency" | "owner";

const accountTypes: { value: AccountType; label: string; description: string; icon: React.ReactNode }[] = [
  {
    value: "buyer",
    label: "Buyer / Renter",
    description: "I'm looking to buy or rent a property",
    icon: <User className="w-6 h-6" />,
  },
  {
    value: "owner",
    label: "Property Owner",
    description: "I want to list my property for sale or rent",
    icon: <Home className="w-6 h-6" />,
  },
  {
    value: "agent",
    label: "Estate Agent",
    description: "I'm a licensed estate agent managing listings",
    icon: <Users className="w-6 h-6" />,
  },
  {
    value: "agency",
    label: "Agency",
    description: "I represent a real estate agency with multiple agents",
    icon: <Building2 className="w-6 h-6" />,
  },
];

const roleMap: Record<AccountType, string> = {
  buyer: "user",
  owner: "user",
  agent: "agent",
  agency: "agency",
};

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [signupStep, setSignupStep] = useState(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [accountType, setAccountType] = useState<AccountType | null>(null);
  const [agencyName, setAgencyName] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        // Fetch role and redirect
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
          const role = roles?.[0]?.role;
          if (role === "admin") navigate("/admin");
          else if (role === "agent") navigate("/agent");
          else if (role === "agency") navigate("/agency");
          else navigate("/dashboard");
        }
      } else {
        if (!accountType) return;
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              phone,
              account_type: accountType,
              role: roleMap[accountType],
              agency_name: agencyName || undefined,
              license_number: licenseNumber || undefined,
            },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        toast({ title: "Account created!", description: "Check your email to verify your account." });
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const resetSignup = () => {
    setIsLogin(true);
    setSignupStep(1);
    setAccountType(null);
    setAgencyName("");
    setLicenseNumber("");
    setPhone("");
    setFullName("");
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative items-center justify-center">
        <div className="p-12 text-primary-foreground max-w-lg">
          <div className="mb-8">
            <img src={logoDark} alt="PropatiHub" className="h-10 w-auto" />
          </div>
          <h1 className="text-4xl font-display font-bold mb-4">
            Nigeria's Premier Property Marketplace
          </h1>
          <p className="text-primary-foreground/70 font-body text-lg">
            Buy, rent, or list properties across Lagos, Abuja, Port Harcourt and all 36 states.
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 flex justify-center">
            <Link to="/">
              <img src={logoLight} alt="PropatiHub" className="h-9 w-auto" />
            </Link>
          </div>

          {isLogin ? (
            /* ─── LOGIN ─── */
            <>
              <h2 className="text-2xl font-display font-bold text-foreground mb-2">Welcome back</h2>
              <p className="text-muted-foreground font-body mb-8">Sign in to access your dashboard</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-body font-medium text-foreground block mb-1.5">Email</label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
                </div>
                <div>
                  <label className="text-sm font-body font-medium text-foreground block mb-1.5">Password</label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={6}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Please wait..." : "Sign In"}
                </Button>
              </form>
              <p className="text-center text-sm text-muted-foreground font-body mt-6">
                Don't have an account?{" "}
                <button onClick={() => { setIsLogin(false); setSignupStep(1); }} className="text-accent font-medium hover:underline">
                  Sign up
                </button>
              </p>
            </>
          ) : signupStep === 1 ? (
            /* ─── SIGNUP STEP 1: CHOOSE ACCOUNT TYPE ─── */
            <>
              <h2 className="text-2xl font-display font-bold text-foreground mb-2">Create your account</h2>
              <p className="text-muted-foreground font-body mb-6">What would you like to use PropatiHub for?</p>

              <div className="space-y-3">
                {accountTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setAccountType(type.value)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                      accountType === type.value
                        ? "border-accent bg-accent/5 shadow-sm"
                        : "border-border hover:border-accent/40 hover:bg-muted/50"
                    }`}
                  >
                    <div className={`p-2.5 rounded-lg ${accountType === type.value ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"}`}>
                      {type.icon}
                    </div>
                    <div>
                      <p className="font-body font-semibold text-foreground">{type.label}</p>
                      <p className="text-sm text-muted-foreground">{type.description}</p>
                    </div>
                  </button>
                ))}
              </div>

              <Button
                className="w-full mt-6"
                disabled={!accountType}
                onClick={() => setSignupStep(2)}
              >
                Continue <ArrowRight className="w-4 h-4 ml-2" />
              </Button>

              <p className="text-center text-sm text-muted-foreground font-body mt-6">
                Already have an account?{" "}
                <button onClick={resetSignup} className="text-accent font-medium hover:underline">
                  Sign in
                </button>
              </p>
            </>
          ) : (
            /* ─── SIGNUP STEP 2: DETAILS ─── */
            <>
              <button onClick={() => setSignupStep(1)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground font-body mb-4 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <h2 className="text-2xl font-display font-bold text-foreground mb-2">
                Your details
              </h2>
              <p className="text-muted-foreground font-body mb-6">
                Signing up as <span className="font-semibold text-accent">{accountTypes.find(t => t.value === accountType)?.label}</span>
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-body font-medium text-foreground block mb-1.5">Full Name</label>
                  <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Doe" required />
                </div>
                <div>
                  <label className="text-sm font-body font-medium text-foreground block mb-1.5">Phone Number</label>
                  <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+234 800 000 0000" required />
                </div>

                {accountType === "agency" && (
                  <div>
                    <label className="text-sm font-body font-medium text-foreground block mb-1.5">Agency Name</label>
                    <Input value={agencyName} onChange={(e) => setAgencyName(e.target.value)} placeholder="Your agency name" required />
                  </div>
                )}

                {accountType === "agent" && (
                  <div>
                    <label className="text-sm font-body font-medium text-foreground block mb-1.5">License Number <span className="text-muted-foreground font-normal">(optional)</span></label>
                    <Input value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} placeholder="e.g. NIESV/2024/001" />
                  </div>
                )}

                <div>
                  <label className="text-sm font-body font-medium text-foreground block mb-1.5">Email</label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
                </div>
                <div>
                  <label className="text-sm font-body font-medium text-foreground block mb-1.5">Password</label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={6}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Please wait..." : "Create Account"}
                </Button>
              </form>

              <p className="text-center text-sm text-muted-foreground font-body mt-6">
                Already have an account?{" "}
                <button onClick={resetSignup} className="text-accent font-medium hover:underline">
                  Sign in
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
