import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, ArrowLeft, KeyRound } from "lucide-react";
import logoDark from "@/assets/logo-dark.png";
import logoLight from "@/assets/logo-light.png";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    if (hashParams.get("type") === "recovery") {
      setIsRecovery(true);
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsRecovery(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({ 
        title: "Passwords do not match", 
        description: "Please ensure that both password fields are identical.",
        variant: "destructive" 
      });
      return;
    }
    if (password.length < 6) {
      toast({ 
        title: "Password too short", 
        description: "For your security, please use a password with at least 6 characters.",
        variant: "destructive" 
      });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast({ 
        title: "Password Reset Successful", 
        description: "Your password has been updated. You can now sign in with your new credentials.",
        className: "bg-primary text-primary-foreground border-none",
      });
      navigate("/auth");
    } catch (err: any) {
      toast({ 
        title: "Password Update Failed", 
        description: err.message || "We encountered an issue while updating your password. Please try again or contact support.", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isRecovery) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <KeyRound className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-display font-bold text-foreground mb-2">Invalid Reset Link</h1>
          <p className="text-muted-foreground font-body mb-6">
            This link is invalid or has expired. Please request a new password reset.
          </p>
          <Link to="/auth">
            <Button>Back to Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative items-center justify-center">
        <div className="p-12 text-primary-foreground max-w-lg">
          <div className="mb-8">
            <Link to="/">
              <img src={logoDark} alt="PropatiHub" className="h-10 w-auto" />
            </Link>
          </div>
          <h1 className="text-4xl font-display font-bold mb-4">Reset Your Password</h1>
          <p className="text-primary-foreground/70 font-body text-lg">
            Choose a strong password to secure your PropatiHub account.
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col p-6">
        <div className="lg:hidden flex items-center justify-between mb-8">
          <Link to="/">
            <img src={logoLight} alt="PropatiHub" className="h-9 w-auto" />
          </Link>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-md">
            <h2 className="text-2xl font-display font-bold text-foreground mb-2">Set new password</h2>
            <p className="text-muted-foreground font-body mb-8">Enter your new password below</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-body font-medium text-foreground block mb-1.5">New Password</label>
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
              <div>
                <label className="text-sm font-body font-medium text-foreground block mb-1.5">Confirm Password</label>
                <Input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Updating..." : "Update Password"}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground font-body mt-6">
              <Link to="/auth" className="text-accent font-medium hover:underline flex items-center justify-center gap-1">
                <ArrowLeft className="w-4 h-4" /> Back to Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
