import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerificationRequest {
  action: string;
  [key: string]: unknown;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Get user from JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceKey);
    const body: VerificationRequest = await req.json();
    const { action } = body;

    // ============================================================
    // ACTION: create_verification
    // ============================================================
    if (action === "create_verification") {
      const { verification_type, full_legal_name, date_of_birth, phone, country, id_type, id_number } = body as any;

      // Hash sensitive ID number
      const id_number_hash = id_number ? await hashValue(id_number) : null;
      const id_number_masked = id_number ? maskValue(id_number) : null;

      const { data, error } = await adminClient
        .from("verification_profiles")
        .upsert({
          user_id: user.id,
          verification_type,
          status: "in_progress",
          full_legal_name,
          date_of_birth,
          phone,
          country: country || "Nigeria",
          id_type,
          id_number_hash,
          id_number_masked,
          attempt_count: 1,
          biometric_consent: false,
          document_consent: false,
        }, { onConflict: "user_id,verification_type" })
        .select()
        .single();

      if (error) throw error;

      // Audit log
      await adminClient.from("verification_audit_logs").insert({
        verification_id: data.id,
        user_id: user.id,
        action: "started",
        actor_id: user.id,
        actor_role: "user",
        details: { verification_type },
      });

      return jsonResponse({ verification: data });
    }

    // ============================================================
    // ACTION: save_step (update identity/business details)
    // ============================================================
    if (action === "save_step") {
      const { verification_id, step, fields } = body as any;

      // Hash sensitive fields
      const updates: Record<string, unknown> = { ...fields };
      if (fields.id_number) {
        updates.id_number_hash = await hashValue(fields.id_number);
        updates.id_number_masked = maskValue(fields.id_number);
        delete updates.id_number;
      }
      if (fields.bvn) {
        updates.bvn_hash = await hashValue(fields.bvn);
        updates.bvn_masked = maskValue(fields.bvn);
        delete updates.bvn;
      }
      if (fields.nin) {
        updates.nin_hash = await hashValue(fields.nin);
        updates.nin_masked = maskValue(fields.nin);
        delete updates.nin;
      }

      const { data, error } = await adminClient
        .from("verification_profiles")
        .update(updates)
        .eq("id", verification_id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;

      await adminClient.from("verification_audit_logs").insert({
        verification_id,
        user_id: user.id,
        action: "step_completed",
        actor_id: user.id,
        actor_role: "user",
        details: { step },
      });

      return jsonResponse({ verification: data });
    }

    // ============================================================
    // ACTION: create_liveness_session (Azure Face API)
    // ============================================================
    if (action === "create_liveness_session") {
      const { verification_id } = body as any;

      const azureKey = Deno.env.get("AZURE_FACE_API_KEY");
      const azureEndpointRaw = Deno.env.get("AZURE_FACE_API_ENDPOINT");
      const azureEndpoint = azureEndpointRaw?.endsWith("/") ? azureEndpointRaw : `${azureEndpointRaw}/`;

      if (!azureKey || !azureEndpoint) {
        return jsonResponse({ error: "Azure Face API not configured" }, 500);
      }

      // Record consent
      await adminClient
        .from("verification_profiles")
        .update({
          biometric_consent: true,
          consent_timestamp: new Date().toISOString(),
          status: "awaiting_liveness",
        })
        .eq("id", verification_id)
        .eq("user_id", user.id);

      // Create Azure Face API liveness session
      const sessionResponse = await fetch(
        `${azureEndpoint}face/v1.1-preview.1/detectliveness/singlemodal/sessions`,
        {
          method: "POST",
          headers: {
            "Ocp-Apim-Subscription-Key": azureKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            livenessOperationMode: "Passive",
            sendResultsToClient: true,
            deviceCorrelationId: verification_id,
          }),
        }
      );

      if (!sessionResponse.ok) {
        const errText = await sessionResponse.text();
        console.error("Azure session creation failed:", errText);
        return jsonResponse({ error: "Failed to create liveness session" }, 500);
      }

      const sessionData = await sessionResponse.json();

      await adminClient
        .from("verification_profiles")
        .update({ liveness_session_id: sessionData.sessionId })
        .eq("id", verification_id)
        .eq("user_id", user.id);

      await adminClient.from("verification_audit_logs").insert({
        verification_id,
        user_id: user.id,
        action: "liveness_session_created",
        actor_id: user.id,
        actor_role: "user",
        details: { session_id: sessionData.sessionId },
      });

      return jsonResponse({
        sessionId: sessionData.sessionId,
        authToken: sessionData.authToken,
      });
    }

    // ============================================================
    // ACTION: verify_liveness_result
    // ============================================================
    if (action === "verify_liveness_result") {
      const { verification_id, session_id } = body as any;

      const azureKey = Deno.env.get("AZURE_FACE_API_KEY");
      const azureEndpointRaw2 = Deno.env.get("AZURE_FACE_API_ENDPOINT");
      const azureEndpoint = azureEndpointRaw2?.endsWith("/") ? azureEndpointRaw2 : `${azureEndpointRaw2}/`;
      const livenessThreshold = parseFloat(Deno.env.get("KYC_LIVENESS_THRESHOLD") || "0.95");

      if (!azureKey || !azureEndpoint) {
        return jsonResponse({ error: "Azure Face API not configured" }, 500);
      }

      // Get session result from Azure
      const resultResponse = await fetch(
        `${azureEndpoint}face/v1.1-preview.1/detectliveness/singlemodal/sessions/${session_id}`,
        {
          headers: { "Ocp-Apim-Subscription-Key": azureKey },
        }
      );

      if (!resultResponse.ok) {
        const errText = await resultResponse.text();
        console.error("Azure result fetch failed:", errText);
        return jsonResponse({ error: "Failed to fetch liveness result" }, 500);
      }

      const result = await resultResponse.json();
      const livenessScore = result.result?.response?.body?.livenessDecision === "realface" ? 1.0 : 0.0;
      const livenessPassed = livenessScore >= livenessThreshold;

      // Get current attempt count
      const { data: currentProfile } = await adminClient
        .from("verification_profiles")
        .select("attempt_count, max_attempts")
        .eq("id", verification_id)
        .single();

      const attemptNumber = (currentProfile?.attempt_count || 0) + 1;

      // Record biometric verification
      await adminClient.from("biometric_verifications").insert({
        verification_id,
        user_id: user.id,
        session_id,
        liveness_score: livenessScore,
        liveness_passed: livenessPassed,
        attempt_number: attemptNumber,
        metadata: result,
      });

      // Update profile
      const updateData: Record<string, unknown> = {
        liveness_score: livenessScore,
        biometric_verified: livenessPassed,
        attempt_count: attemptNumber,
      };

      if (livenessPassed) {
        updateData.status = "awaiting_documents";
      } else if (attemptNumber >= (currentProfile?.max_attempts || 3)) {
        updateData.status = "rejected";
        updateData.rejection_reason = "Maximum liveness verification attempts exceeded";
        updateData.rejected_at = new Date().toISOString();
      }

      await adminClient
        .from("verification_profiles")
        .update(updateData)
        .eq("id", verification_id)
        .eq("user_id", user.id);

      await adminClient.from("verification_audit_logs").insert({
        verification_id,
        user_id: user.id,
        action: "liveness_attempt",
        actor_id: user.id,
        actor_role: "user",
        details: {
          session_id,
          liveness_score: livenessScore,
          passed: livenessPassed,
          attempt_number: attemptNumber,
        },
      });

      return jsonResponse({
        passed: livenessPassed,
        score: livenessScore,
        attemptsRemaining: Math.max(0, (currentProfile?.max_attempts || 3) - attemptNumber),
      });
    }

    // ============================================================
    // ACTION: submit_verification
    // ============================================================
    if (action === "submit_verification") {
      const { verification_id, verification_type } = body as any;

      // For customer type - auto approve (no admin review needed)
      const isCustomer = verification_type === "customer";

      const updateData: Record<string, unknown> = {
        submitted_at: new Date().toISOString(),
        document_consent: true,
      };

      if (isCustomer) {
        updateData.status = "approved";
        updateData.approved_at = new Date().toISOString();
      } else {
        updateData.status = "pending_review";
      }

      const { data, error } = await adminClient
        .from("verification_profiles")
        .update(updateData)
        .eq("id", verification_id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;

      await adminClient.from("verification_audit_logs").insert({
        verification_id,
        user_id: user.id,
        action: isCustomer ? "auto_approved" : "submitted",
        actor_id: user.id,
        actor_role: "user",
        details: { verification_type },
      });

      // Send email notification
      await sendBrevoEmail(user.email!, isCustomer ? "verification_approved" : "submission_received", {
        name: data.full_legal_name || "User",
        verificationType: verification_type,
      });

      return jsonResponse({ verification: data, autoApproved: isCustomer });
    }

    // ============================================================
    // ACTION: admin_review (approve/reject/resubmit)
    // ============================================================
    if (action === "admin_review") {
      // Check admin role
      const { data: roles } = await adminClient
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin");

      if (!roles || roles.length === 0) {
        return jsonResponse({ error: "Forbidden" }, 403);
      }

      const { verification_id, decision, reason, notes } = body as any;

      const updateData: Record<string, unknown> = {
        reviewer_id: user.id,
        reviewed_at: new Date().toISOString(),
        admin_notes: notes || null,
      };

      if (decision === "approve") {
        updateData.status = "approved";
        updateData.approved_at = new Date().toISOString();
      } else if (decision === "reject") {
        updateData.status = "rejected";
        updateData.rejection_reason = reason;
        updateData.rejected_at = new Date().toISOString();
      } else if (decision === "resubmit") {
        updateData.status = "needs_resubmission";
        updateData.resubmission_notes = reason;
      }

      const { data, error } = await adminClient
        .from("verification_profiles")
        .update(updateData)
        .eq("id", verification_id)
        .select()
        .single();

      if (error) throw error;

      await adminClient.from("verification_audit_logs").insert({
        verification_id,
        user_id: data.user_id,
        action: `admin_${decision}`,
        actor_id: user.id,
        actor_role: "admin",
        details: { decision, reason, notes },
      });

      // Get user email for notification
      const { data: userData } = await adminClient.auth.admin.getUserById(data.user_id);
      if (userData?.user?.email) {
        const emailType = decision === "approve" ? "verification_approved"
          : decision === "reject" ? "verification_rejected"
          : "resubmission_requested";
        await sendBrevoEmail(userData.user.email, emailType, {
          name: data.full_legal_name || "User",
          reason: reason || "",
          verificationType: data.verification_type,
        });
      }

      return jsonResponse({ verification: data });
    }

    // ============================================================
    // ACTION: get_verification
    // ============================================================
    if (action === "get_verification") {
      const { verification_type } = body as any;

      const { data, error } = await adminClient
        .from("verification_profiles")
        .select("*, verification_documents(*)")
        .eq("user_id", user.id)
        .eq("verification_type", verification_type)
        .maybeSingle();

      return jsonResponse({ verification: data });
    }

    // ============================================================
    // ACTION: admin_list_verifications
    // ============================================================
    if (action === "admin_list_verifications") {
      const { data: roles } = await adminClient
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin");

      if (!roles || roles.length === 0) {
        return jsonResponse({ error: "Forbidden" }, 403);
      }

      const { status_filter, type_filter, search, page = 0, per_page = 20 } = body as any;

      let query = adminClient
        .from("verification_profiles")
        .select("*, verification_documents(*)", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(page * per_page, (page + 1) * per_page - 1);

      if (status_filter) query = query.eq("status", status_filter);
      if (type_filter) query = query.eq("verification_type", type_filter);
      if (search) {
        query = query.or(`full_legal_name.ilike.%${search}%,business_name.ilike.%${search}%,cac_registration_number.ilike.%${search}%,agent_license_number.ilike.%${search}%`);
      }

      const { data, error, count } = await query;
      if (error) throw error;

      // Enrich with user emails
      const enriched = await Promise.all(
        (data || []).map(async (v: any) => {
          const { data: userData } = await adminClient.auth.admin.getUserById(v.user_id);
          return { ...v, user_email: userData?.user?.email || "N/A" };
        })
      );

      return jsonResponse({ verifications: enriched, total: count });
    }

    // ============================================================
    // ACTION: admin_get_verification_detail
    // ============================================================
    if (action === "admin_get_verification_detail") {
      const { data: roles } = await adminClient
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin");

      if (!roles || roles.length === 0) {
        return jsonResponse({ error: "Forbidden" }, 403);
      }

      const { verification_id } = body as any;

      const [verificationRes, auditRes, biometricRes] = await Promise.all([
        adminClient
          .from("verification_profiles")
          .select("*, verification_documents(*)")
          .eq("id", verification_id)
          .single(),
        adminClient
          .from("verification_audit_logs")
          .select("*")
          .eq("verification_id", verification_id)
          .order("created_at", { ascending: false }),
        adminClient
          .from("biometric_verifications")
          .select("*")
          .eq("verification_id", verification_id)
          .order("created_at", { ascending: false }),
      ]);

      if (verificationRes.error) throw verificationRes.error;

      // Get user info
      const { data: userData } = await adminClient.auth.admin.getUserById(verificationRes.data.user_id);

      // Generate signed URLs for documents
      const docsWithUrls = await Promise.all(
        (verificationRes.data.verification_documents || []).map(async (doc: any) => {
          const bucket = doc.document_type.includes("business") || doc.document_type.includes("cac")
            ? "verification-business-documents"
            : doc.document_type.includes("selfie") || doc.document_type.includes("liveness")
            ? "verification-selfies"
            : "verification-id-documents";

          const { data: signedUrl } = await adminClient.storage
            .from(bucket)
            .createSignedUrl(doc.file_path, 300); // 5 min expiry

          return { ...doc, signed_url: signedUrl?.signedUrl || null };
        })
      );

      return jsonResponse({
        verification: { ...verificationRes.data, verification_documents: docsWithUrls },
        user_email: userData?.user?.email,
        user_phone: userData?.user?.phone,
        audit_logs: auditRes.data,
        biometric_results: biometricRes.data,
      });
    }

    return jsonResponse({ error: "Unknown action" }, 400);
  } catch (err: unknown) {
    console.error("KYC verification error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// ============================================================
// Helpers
// ============================================================

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function hashValue(value: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(value);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function maskValue(value: string): string {
  if (value.length <= 4) return "****";
  return "*".repeat(value.length - 4) + value.slice(-4);
}

async function sendBrevoEmail(to: string, template: string, vars: Record<string, string>) {
  const brevoKey = Deno.env.get("BREVO_API_KEY");
  const fromName = Deno.env.get("BREVO_FROM_NAME") || "Propatihub";
  const fromEmail = Deno.env.get("BREVO_FROM") || "info@propatihub.com";

  if (!brevoKey) {
    console.warn("BREVO_API_KEY not set, skipping email");
    return;
  }

  const subjects: Record<string, string> = {
    verification_started: "Your Identity Verification Has Started",
    submission_received: "Verification Submitted — Under Review",
    verification_approved: "✅ Your Identity Has Been Verified",
    verification_rejected: "Verification Update — Action Required",
    resubmission_requested: "Verification Update — Resubmission Needed",
  };

  const bodies: Record<string, string> = {
    verification_started: `<div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:0 auto;padding:40px 24px;background:#fff;">
      <div style="text-align:center;margin-bottom:32px;"><img src="https://propatihub.com/logo.png" alt="PropatiHub" style="height:40px;" /></div>
      <h1 style="font-size:24px;color:#1a1a1a;margin-bottom:16px;">Verification Started</h1>
      <p style="font-size:16px;color:#4a4a4a;line-height:1.6;">Hi ${vars.name},</p>
      <p style="font-size:16px;color:#4a4a4a;line-height:1.6;">Your ${vars.verificationType} identity verification is underway. Complete all required steps to unlock full platform access.</p>
      <div style="margin:32px 0;text-align:center;"><a href="https://propatihub.com/dashboard" style="background:#2563eb;color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600;">Continue Verification</a></div>
      <p style="font-size:13px;color:#999;margin-top:32px;">— The PropatiHub Team</p></div>`,
    submission_received: `<div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:0 auto;padding:40px 24px;background:#fff;">
      <div style="text-align:center;margin-bottom:32px;"><img src="https://propatihub.com/logo.png" alt="PropatiHub" style="height:40px;" /></div>
      <h1 style="font-size:24px;color:#1a1a1a;margin-bottom:16px;">Submission Received</h1>
      <p style="font-size:16px;color:#4a4a4a;line-height:1.6;">Hi ${vars.name},</p>
      <p style="font-size:16px;color:#4a4a4a;line-height:1.6;">We've received your ${vars.verificationType} verification submission. Our team will review it within 24 hours.</p>
      <p style="font-size:13px;color:#999;margin-top:32px;">— The PropatiHub Team</p></div>`,
    verification_approved: `<div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:0 auto;padding:40px 24px;background:#fff;">
      <div style="text-align:center;margin-bottom:32px;"><img src="https://propatihub.com/logo.png" alt="PropatiHub" style="height:40px;" /></div>
      <h1 style="font-size:24px;color:#1a1a1a;margin-bottom:16px;">✅ Verified Successfully</h1>
      <p style="font-size:16px;color:#4a4a4a;line-height:1.6;">Hi ${vars.name},</p>
      <p style="font-size:16px;color:#4a4a4a;line-height:1.6;">Your identity has been verified. You now have full access to all platform features.</p>
      <div style="margin:32px 0;text-align:center;"><a href="https://propatihub.com/dashboard" style="background:#16a34a;color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600;">Go to Dashboard</a></div>
      <p style="font-size:13px;color:#999;margin-top:32px;">— The PropatiHub Team</p></div>`,
    verification_rejected: `<div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:0 auto;padding:40px 24px;background:#fff;">
      <div style="text-align:center;margin-bottom:32px;"><img src="https://propatihub.com/logo.png" alt="PropatiHub" style="height:40px;" /></div>
      <h1 style="font-size:24px;color:#1a1a1a;margin-bottom:16px;">Verification Update</h1>
      <p style="font-size:16px;color:#4a4a4a;line-height:1.6;">Hi ${vars.name},</p>
      <p style="font-size:16px;color:#4a4a4a;line-height:1.6;">Unfortunately, your verification could not be approved. Reason: <strong>${vars.reason}</strong></p>
      <p style="font-size:16px;color:#4a4a4a;line-height:1.6;">You may resubmit your verification with corrected information.</p>
      <div style="margin:32px 0;text-align:center;"><a href="https://propatihub.com/dashboard" style="background:#2563eb;color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600;">Resubmit Verification</a></div>
      <p style="font-size:13px;color:#999;margin-top:32px;">— The PropatiHub Team</p></div>`,
    resubmission_requested: `<div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:0 auto;padding:40px 24px;background:#fff;">
      <div style="text-align:center;margin-bottom:32px;"><img src="https://propatihub.com/logo.png" alt="PropatiHub" style="height:40px;" /></div>
      <h1 style="font-size:24px;color:#1a1a1a;margin-bottom:16px;">Resubmission Required</h1>
      <p style="font-size:16px;color:#4a4a4a;line-height:1.6;">Hi ${vars.name},</p>
      <p style="font-size:16px;color:#4a4a4a;line-height:1.6;">We need some updates to your verification: <strong>${vars.reason}</strong></p>
      <div style="margin:32px 0;text-align:center;"><a href="https://propatihub.com/dashboard" style="background:#2563eb;color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600;">Update Verification</a></div>
      <p style="font-size:13px;color:#999;margin-top:32px;">— The PropatiHub Team</p></div>`,
  };

  try {
    await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": brevoKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender: { name: fromName, email: fromEmail },
        to: [{ email: to }],
        subject: subjects[template] || "PropatiHub Verification Update",
        htmlContent: bodies[template] || bodies.submission_received,
      }),
    });
  } catch (e) {
    console.error("Brevo email error:", e);
  }
}
