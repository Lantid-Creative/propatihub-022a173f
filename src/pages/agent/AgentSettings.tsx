import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User, Shield, Lock, CheckCircle } from "lucide-react";

const specializations = [
  "Residential",
  "Commercial",
  "Land",
  "Short-Let",
  "Luxury",
  "Off-Plan",
  "Industrial",
  "Mixed-Use",
];

const AgentSettings = () => {
  const { profile, user } = useAuth();
  const { toast } = useToast();

  // Profile form
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // Agent profile form
  const [agentProfile, setAgentProfile] = useState<any>(null);
  const [licenseNumber, setLicenseNumber] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [savingAgent, setSavingAgent] = useState(false);

  // Password
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setPhone(profile.phone || "");
      setBio(profile.bio || "");
      setCity(profile.city || "");
      setState(profile.state || "");
    }
  }, [profile]);

  useEffect(() => {
    if (!user) return;
    supabase.from("agent_profiles").select("*").eq("user_id", user.id).single().then(({ data }) => {
      if (data) {
        setAgentProfile(data);
        setLicenseNumber(data.license_number || "");
        setSpecialization(data.specialization || "");
        setExperienceYears(String(data.experience_years || ""));
      }
    });
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user) return;
    setSavingProfile(true);
    const { error } = await supabase.from("profiles").update({
      full_name: fullName,
      phone,
      bio,
      city,
      state,
    }).eq("user_id", user.id);
    if (error) {
      toast({ 
        title: "Profile Save Error", 
        description: error.message || "We encountered an issue while saving your profile. Please try again.", 
        variant: "destructive" 
      });
    } else {
      toast({ 
        title: "Profile Updated", 
        description: "Your public-facing profile information has been successfully saved.",
        className: "bg-primary text-primary-foreground border-none",
      });
    }
    setSavingProfile(false);
  };

  const handleSaveAgentProfile = async () => {
    if (!user) return;
    setSavingAgent(true);
    const payload = {
      license_number: licenseNumber || null,
      specialization: specialization || null,
      experience_years: parseInt(experienceYears) || 0,
    };
    if (agentProfile) {
      const { error } = await supabase.from("agent_profiles").update(payload).eq("user_id", user.id);
      if (error) {
        toast({ 
          title: "Update Failed", 
          description: error.message || "We encountered an issue while updating your professional profile.", 
          variant: "destructive" 
        });
      } else {
        toast({ 
          title: "Agent Profile Updated", 
          description: "Your professional agent details have been successfully updated.",
          className: "bg-primary text-primary-foreground border-none",
        });
      }
    } else {
      const { error } = await supabase.from("agent_profiles").insert({ ...payload, user_id: user.id });
      if (error) {
        toast({ 
          title: "Creation Failed", 
          description: error.message || "We encountered an issue while setting up your professional profile.", 
          variant: "destructive" 
        });
      } else {
        toast({ 
          title: "Agent Profile Created", 
          description: "Your professional profile has been initialized and is ready for verification.",
          className: "bg-primary text-primary-foreground border-none",
        });
      }
    }
    setSavingAgent(false);
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      toast({ 
        title: "Password Security Requirement", 
        description: "For your safety, please ensure your password is at least 6 characters long.", 
        variant: "destructive" 
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ 
        title: "Password Mismatch", 
        description: "The two passwords you entered do not match. Please re-enter them.", 
        variant: "destructive" 
      });
      return;
    }
    setSavingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      toast({ 
        title: "Password Update Error", 
        description: error.message || "We could not update your password at this time. Please try again.", 
        variant: "destructive" 
      });
    } else {
      toast({ 
        title: "Password Changed Successfully", 
        description: "Your security credentials have been updated.",
        className: "bg-primary text-primary-foreground border-none",
      });
      setNewPassword("");
      setConfirmPassword("");
    }
    setSavingPassword(false);
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground font-body text-sm">Manage your profile and account settings</p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Personal Info */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-accent" />
              <div>
                <CardTitle className="text-lg">Personal Information</CardTitle>
                <CardDescription className="text-xs">Your public-facing profile details</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-body font-medium block mb-1.5">Full Name</label>
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Doe" />
              </div>
              <div>
                <label className="text-sm font-body font-medium block mb-1.5">Phone</label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+234 800 000 0000" />
              </div>
            </div>
            <div>
              <label className="text-sm font-body font-medium block mb-1.5">Bio</label>
              <Textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell buyers about yourself, your experience, and areas you specialise in..." rows={4} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-body font-medium block mb-1.5">City</label>
                <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Lagos" />
              </div>
              <div>
                <label className="text-sm font-body font-medium block mb-1.5">State</label>
                <Input value={state} onChange={(e) => setState(e.target.value)} placeholder="Lagos" />
              </div>
            </div>
            <div>
              <label className="text-sm font-body font-medium block mb-1.5">Email</label>
              <Input value={user?.email || ""} disabled />
              <p className="text-[10px] text-muted-foreground font-body mt-1">Email cannot be changed</p>
            </div>
            <Button onClick={handleSaveProfile} disabled={savingProfile}>
              {savingProfile ? "Saving..." : "Save Profile"}
            </Button>
          </CardContent>
        </Card>

        {/* Agent Profile */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-accent" />
                <div>
                  <CardTitle className="text-lg">Agent Profile</CardTitle>
                  <CardDescription className="text-xs">Professional details for verification</CardDescription>
                </div>
              </div>
              {agentProfile?.verified ? (
                <Badge className="bg-primary/10 text-primary gap-1">
                  <CheckCircle className="w-3 h-3" /> Verified
                </Badge>
              ) : (
                <Badge variant="secondary">Pending Verification</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-body font-medium block mb-1.5">License Number</label>
              <Input value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} placeholder="e.g. NIS/REG/2024/12345" />
              <p className="text-[10px] text-muted-foreground font-body mt-1">Your real estate license or registration number</p>
            </div>
            <div>
              <label className="text-sm font-body font-medium block mb-1.5">Specialization</label>
              <Select value={specialization} onValueChange={setSpecialization}>
                <SelectTrigger><SelectValue placeholder="Select your specialization" /></SelectTrigger>
                <SelectContent>
                  {specializations.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-body font-medium block mb-1.5">Years of Experience</label>
              <Input type="number" value={experienceYears} onChange={(e) => setExperienceYears(e.target.value)} placeholder="5" min="0" max="50" />
            </div>
            <Button onClick={handleSaveAgentProfile} disabled={savingAgent}>
              {savingAgent ? "Saving..." : agentProfile ? "Update Agent Profile" : "Create Agent Profile"}
            </Button>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-accent" />
              <div>
                <CardTitle className="text-lg">Change Password</CardTitle>
                <CardDescription className="text-xs">Update your account password</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-body font-medium block mb-1.5">New Password</label>
              <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" minLength={6} />
            </div>
            <div>
              <label className="text-sm font-body font-medium block mb-1.5">Confirm Password</label>
              <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" />
            </div>
            <Button variant="outline" onClick={handleChangePassword} disabled={savingPassword}>
              {savingPassword ? "Updating..." : "Change Password"}
            </Button>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle className="text-lg text-destructive">Danger Zone</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-body text-muted-foreground mb-3">
              Deleting your account will remove all your listings, inquiries, and data permanently.
            </p>
            <Button variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => toast({ 
              title: "Account Deletion Request", 
              description: "To ensure the security of your data, account deletions are handled manually. Please email support@propatihub.ng with your request." 
            })}>
              Delete Account
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AgentSettings;
