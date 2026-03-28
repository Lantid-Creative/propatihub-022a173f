import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { VerificationProfile, VerificationType } from "@/types/verification";

export function useVerification(verificationType: VerificationType) {
  const { user } = useAuth();
  const [verification, setVerification] = useState<VerificationProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVerification = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("kyc-verification", {
        body: { action: "get_verification", verification_type: verificationType },
      });
      if (fnError) throw fnError;
      setVerification(data.verification);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load verification");
    } finally {
      setLoading(false);
    }
  }, [user, verificationType]);

  useEffect(() => {
    fetchVerification();
  }, [fetchVerification]);

  const createVerification = async (fields: Record<string, unknown>) => {
    const { data, error: fnError } = await supabase.functions.invoke("kyc-verification", {
      body: { action: "create_verification", verification_type: verificationType, ...fields },
    });
    if (fnError) throw fnError;
    setVerification(data.verification);
    return data.verification;
  };

  const saveStep = async (verificationId: string, step: string, fields: Record<string, unknown>) => {
    const { data, error: fnError } = await supabase.functions.invoke("kyc-verification", {
      body: { action: "save_step", verification_id: verificationId, step, fields },
    });
    if (fnError) throw fnError;
    setVerification(data.verification);
    return data.verification;
  };

  const createLivenessSession = async (verificationId: string) => {
    const { data, error: fnError } = await supabase.functions.invoke("kyc-verification", {
      body: { action: "create_liveness_session", verification_id: verificationId },
    });
    if (fnError) throw fnError;
    return data;
  };

  const verifyLivenessResult = async (verificationId: string, sessionId: string) => {
    const { data, error: fnError } = await supabase.functions.invoke("kyc-verification", {
      body: { action: "verify_liveness_result", verification_id: verificationId, session_id: sessionId },
    });
    if (fnError) throw fnError;
    return data;
  };

  const submitVerification = async (verificationId: string) => {
    const { data, error: fnError } = await supabase.functions.invoke("kyc-verification", {
      body: { action: "submit_verification", verification_id: verificationId, verification_type: verificationType },
    });
    if (fnError) throw fnError;
    setVerification(data.verification);
    return data;
  };

  const uploadDocument = async (
    verificationId: string,
    documentType: string,
    file: File,
  ) => {
    if (!user) throw new Error("Not authenticated");

    const bucket = documentType.includes("business") || documentType.includes("cac")
      ? "verification-business-documents"
      : documentType.includes("selfie") || documentType.includes("liveness")
      ? "verification-selfies"
      : "verification-id-documents";

    const filePath = `${user.id}/${verificationId}/${documentType}_${Date.now()}.${file.name.split(".").pop()}`;

    const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });
    if (uploadError) throw uploadError;

    // Record document in DB
    const { error: dbError } = await supabase.from("verification_documents").insert({
      verification_id: verificationId,
      user_id: user.id,
      document_type: documentType,
      file_path: filePath,
      file_name: file.name,
      file_size: file.size,
      mime_type: file.type,
    });
    if (dbError) throw dbError;

    await fetchVerification();
  };

  return {
    verification,
    loading,
    error,
    createVerification,
    saveStep,
    createLivenessSession,
    verifyLivenessResult,
    submitVerification,
    uploadDocument,
    refetch: fetchVerification,
  };
}

export function useVerificationStatus(verificationType: VerificationType) {
  const { user } = useAuth();
  const [isVerified, setIsVerified] = useState(false);
  const [status, setStatus] = useState<string>("not_started");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const check = async () => {
      try {
        const { data } = await supabase.functions.invoke("kyc-verification", {
          body: { action: "get_verification", verification_type: verificationType },
        });
        if (data?.verification) {
          setStatus(data.verification.status);
          setIsVerified(data.verification.status === "approved");
        }
      } catch {
        // Fail silently
      } finally {
        setLoading(false);
      }
    };
    check();
  }, [user, verificationType]);

  return { isVerified, status, loading };
}
