import { useEffect, useMemo } from "react";
import PageSEO from "@/components/PageSEO";
import VerificationWizard from "@/components/verification/VerificationWizard";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import type { VerificationType } from "@/types/verification";

const roleToVerificationType: Record<string, VerificationType> = {
  user: "customer",
  agent: "agent",
  agency: "agency",
  owner: "owner",
  admin: "customer",
};

const Verify = () => {
  const { user, loading, roles, rolesLoading, accountType } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [user, loading, navigate]);

  const autoType = useMemo<VerificationType | undefined>(() => {
    if (rolesLoading) return undefined;
    
    // 1. Check specific account_type from metadata (highest priority)
    if (accountType && roleToVerificationType[accountType]) {
      return roleToVerificationType[accountType];
    }

    // 2. Fallback to roles if metadata is missing
    if (roles.length > 0) {
      for (const role of ["agency", "agent", "user", "admin"] as const) {
        if (roles.includes(role)) return roleToVerificationType[role];
      }
    }
    
    return "customer";
  }, [roles, rolesLoading, accountType]);

  if (!user || rolesLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <PageSEO title="Identity Verification | PropatiHub" description="Verify your identity to access all PropatiHub features securely." />
      <div className="min-h-screen bg-background py-12 px-4">
        <VerificationWizard defaultType={autoType} />
      </div>
    </>
  );
};

export default Verify;
