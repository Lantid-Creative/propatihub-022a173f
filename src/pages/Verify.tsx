import { useEffect } from "react";
import PageSEO from "@/components/PageSEO";
import VerificationWizard from "@/components/verification/VerificationWizard";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const Verify = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [user, loading, navigate]);

  if (!user) return null;

  return (
    <>
      <PageSEO title="Identity Verification | PropatiHub" description="Verify your identity to access all PropatiHub features securely." />
      <div className="min-h-screen bg-background py-12 px-4">
        <VerificationWizard />
      </div>
    </>
  );
};

export default Verify;
