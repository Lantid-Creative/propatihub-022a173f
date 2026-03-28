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
          id_number_raw: id_number || null,
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
        updates.id_number_raw = fields.id_number;
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
        .maybeSingle();

      if (error) throw error;
      if (!data) return jsonResponse({ error: "Verification profile not found" }, 404);

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
      const azureEndpoint = normalizeAzureEndpoint(Deno.env.get("AZURE_FACE_API_ENDPOINT"));

      if (!azureKey || !azureEndpoint) {
        return jsonResponse({ error: "Azure Face API is not configured correctly." }, 500);
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
        const azureError = mapAzureFaceError(errText, "Failed to create liveness session.");
        console.error("Azure session creation failed:", errText);
        return jsonResponse({
          error: azureError.message,
          code: azureError.code,
        }, azureError.status);
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
      const azureEndpoint = normalizeAzureEndpoint(Deno.env.get("AZURE_FACE_API_ENDPOINT"));
      const livenessThreshold = parseFloat(Deno.env.get("KYC_LIVENESS_THRESHOLD") || "0.95");

      if (!azureKey || !azureEndpoint) {
        return jsonResponse({ error: "Azure Face API is not configured correctly." }, 500);
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
        const azureError = mapAzureFaceError(errText, "Failed to fetch liveness result.");
        console.error("Azure result fetch failed:", errText);
        return jsonResponse({
          error: azureError.message,
          code: azureError.code,
        }, azureError.status);
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
    // ACTION: restart_verification (reset status for resubmission)
    // ============================================================
    if (action === "restart_verification") {
      const { verification_id } = body as any;

      const { data: current } = await adminClient
        .from("verification_profiles")
        .select("attempt_count, max_attempts, verification_type")
        .eq("id", verification_id)
        .eq("user_id", user.id)
        .single();

      if (current?.attempt_count >= (current?.max_attempts || 3)) {
        return jsonResponse({ error: "Maximum attempts reached. Please contact support." }, 403);
      }

      const { data, error } = await adminClient
        .from("verification_profiles")
        .update({
          status: "in_progress",
          resubmission_notes: null,
          rejection_reason: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", verification_id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;

      await adminClient.from("verification_audit_logs").insert({
        verification_id,
        user_id: user.id,
        action: "restarted",
        actor_id: user.id,
        actor_role: "user",
        details: { verification_type: current?.verification_type },
      });

      return jsonResponse({ verification: data });
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

      // Generate signed URLs for documents
      const docsWithSignedUrls = await Promise.all(
        (verificationRes.data?.verification_documents || []).map(async (doc: any) => {
          if (!doc.file_path) return doc;
          const bucket = doc.document_type.includes("business") || doc.document_type.includes("cac")
            ? "verification-business-documents"
            : doc.document_type.includes("selfie") || doc.document_type.includes("liveness")
            ? "verification-selfies"
            : "verification-id-documents";
          const { data: signedUrl } = await adminClient.storage
            .from(bucket)
            .createSignedUrl(doc.file_path, 300);
          return { ...doc, signed_url: signedUrl?.signedUrl || null };
        })
      );

      // Generate signed URLs for biometric images
      const biometricsWithUrls = await Promise.all(
        (biometricRes.data || []).map(async (b: any) => {
          if (!b.image_path) return b;
          const { data: signedUrl } = await adminClient.storage
            .from("verification-selfies")
            .createSignedUrl(b.image_path, 300);
          return { ...b, signed_url: signedUrl?.signedUrl || null };
        })
      );

      // Fetch user email/phone
      const { data: userDataRes } = await adminClient.auth.admin.getUserById(
        verificationRes.data.user_id
      );

      return jsonResponse({
        verification: { ...verificationRes.data, verification_documents: docsWithSignedUrls },
        user_email: userDataRes?.user?.email,
        user_phone: userDataRes?.user?.phone,
        audit_logs: auditRes.data,
        biometric_results: biometricsWithUrls,
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

function normalizeAzureEndpoint(value?: string | null) {
  if (!value) return null;
  return value.endsWith("/") ? value : `${value}/`;
}

function mapAzureFaceError(raw: string, fallbackMessage: string) {
  const parsed = safeJsonParse(raw);
  const error = parsed?.error;
  const innerMessage = error?.innererror?.message as string | undefined;
  const message = error?.message as string | undefined;
  const combined = `${message || ""} ${innerMessage || ""}`.toLowerCase();

  if (combined.includes("face.f0") || combined.includes("do not have access to this operation")) {
    return {
      status: 422,
      code: "AZURE_FACE_TIER_UNSUPPORTED",
      message: "Your Azure Face API resource is on a tier that does not support liveness detection. Upgrade it to Face S0 and try again.",
    };
  }

  if (combined.includes("unsupportedfeature") || combined.includes("livenessdetection") || combined.includes("apply for access")) {
    return {
      status: 422,
      code: "AZURE_LIVENESS_NOT_ENABLED",
      message: "Azure liveness detection is not enabled for this Face resource yet. Apply for LivenessDetection access in Azure, then retry.",
    };
  }

  return {
    status: 502,
    code: error?.code || "AZURE_FACE_ERROR",
    message: message || fallbackMessage,
  };
}

function safeJsonParse(value: string) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
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
  const fromName = Deno.env.get("BREVO_FROM_NAME") || "PropatiHub";
  const fromEmail = Deno.env.get("BREVO_FROM") || "info@propatihub.com";

  if (!brevoKey) {
    console.warn("BREVO_API_KEY not set, skipping email");
    return;
  }

  const SITE_URL = "https://propatihub.lovable.app";
  const B = {
    primary: "#1f5f3f",
    primaryLight: "#e8f5ee",
    accent: "#d4922e",
    fg: "#162a1f",
    muted: "#6b7d72",
    bg: "#faf8f4",
    white: "#ffffff",
    border: "#e5e0d6",
    radius: "12px",
  };

  const wrap = (body: string) => `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:${B.bg};font-family:'DM Sans',Inter,-apple-system,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:${B.bg};padding:40px 20px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:${B.white};border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
<tr><td style="background:linear-gradient(135deg,${B.primary} 0%,#2a7a54 100%);padding:28px 40px;text-align:center;">
<h1 style="margin:0;font-family:'Playfair Display',Georgia,serif;font-size:26px;font-weight:700;color:${B.white};">pro<span style="color:${B.accent};">pati</span><span style="font-size:13px;vertical-align:super;color:${B.accent};">HUB</span></h1>
</td></tr>
<tr><td style="padding:36px 40px;">${body}</td></tr>
<tr><td style="padding:20px 40px;background:${B.primaryLight};border-top:1px solid ${B.border};text-align:center;">
<p style="margin:0;font-size:12px;color:${B.muted};">
<a href="${SITE_URL}/terms" style="color:${B.primary};text-decoration:none;">Terms</a> · <a href="${SITE_URL}/privacy" style="color:${B.primary};text-decoration:none;">Privacy</a> · <a href="${SITE_URL}/contact" style="color:${B.primary};text-decoration:none;">Support</a>
</p>
<p style="margin:8px 0 0;font-size:11px;color:#b0b5b2;">© ${new Date().getFullYear()} PropatiHub. All rights reserved.</p>
</td></tr>
</table></td></tr></table></body></html>`;

  const btn = (text: string, url: string, color = B.primary) =>
    `<table width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0;"><tr><td align="center"><a href="${url}" style="display:inline-block;background:${color};color:${B.white};padding:14px 36px;border-radius:${B.radius};text-decoration:none;font-weight:600;font-size:15px;box-shadow:0 4px 12px rgba(31,95,63,0.2);">${text}</a></td></tr></table>`;

  const g = (name: string) => `<p style="font-size:16px;color:${B.fg};line-height:1.6;margin:0 0 14px;">Hi ${name},</p>`;
  const p = (text: string) => `<p style="font-size:15px;color:${B.fg};line-height:1.7;margin:0 0 14px;">${text}</p>`;

  const subjects: Record<string, string> = {
    verification_started: "🔐 Your Identity Verification Has Started — PropatiHub",
    submission_received: "📋 Verification Submitted — Under Review",
    verification_approved: "✅ Identity Verified — Full Access Unlocked",
    verification_rejected: "⚠️ Verification Update — Action Required",
    resubmission_requested: "📝 Verification Update — Resubmission Needed",
  };

  const bodies: Record<string, string> = {
    verification_started: wrap(`
      ${g(vars.name)}
      ${p(`Your <strong>${vars.verificationType}</strong> identity verification has been initiated. Complete all required steps to unlock full platform access.`)}
      ${p("This usually takes just a few minutes. Have your ID document ready.")}
      ${btn("Continue Verification", `${SITE_URL}/verify`)}
      <p style="font-size:13px;color:${B.muted};margin-top:20px;padding-top:14px;border-top:1px solid ${B.border};">Need help? <a href="${SITE_URL}/contact" style="color:${B.primary};">Contact our support team</a></p>
    `),
    submission_received: wrap(`
      ${g(vars.name)}
      ${p(`We've received your <strong>${vars.verificationType}</strong> verification submission. Our team will review it within <strong>24 hours</strong>.`)}
      ${p("You'll receive an email notification once the review is complete.")}
      <div style="background:${B.primaryLight};border-left:4px solid ${B.primary};padding:16px;border-radius:0 8px 8px 0;margin:20px 0;">
        <p style="margin:0;font-size:14px;color:${B.fg};">💡 <strong>Tip:</strong> Make sure your notification settings are enabled so you don't miss our update.</p>
      </div>
      <p style="font-size:13px;color:${B.muted};margin-top:20px;padding-top:14px;border-top:1px solid ${B.border};">— The PropatiHub Verification Team</p>
    `),
    verification_approved: wrap(`
      ${g(vars.name)}
      <div style="text-align:center;margin:24px 0;">
        <div style="display:inline-block;background:#dcfce7;border-radius:50%;padding:16px;">
          <span style="font-size:40px;">✅</span>
        </div>
      </div>
      ${p("Congratulations! Your identity has been <strong>successfully verified</strong>. You now have full access to all PropatiHub features.")}
      ${p("You can now:")}
      <ul style="font-size:15px;color:${B.fg};line-height:2.2;padding-left:20px;margin:0 0 16px;">
        <li>Place bids on auction properties</li>
        <li>Message verified agents directly</li>
        <li>List properties for sale or rent</li>
        <li>Access escrow and digital contracts</li>
      </ul>
      ${btn("Go to Dashboard", `${SITE_URL}/dashboard`, "#16a34a")}
      <p style="font-size:13px;color:${B.muted};margin-top:20px;padding-top:14px;border-top:1px solid ${B.border};">— The PropatiHub Team</p>
    `),
    verification_rejected: wrap(`
      ${g(vars.name)}
      ${p("We were unable to approve your verification submission. Here's why:")}
      <div style="background:#fef2f2;border-left:4px solid #ef4444;padding:16px;border-radius:0 8px 8px 0;margin:20px 0;">
        <p style="margin:0;font-size:14px;color:#991b1b;"><strong>Reason:</strong> ${vars.reason}</p>
      </div>
      ${p("You can resubmit your verification with corrected information. Please review the reason above and make the necessary changes.")}
      ${btn("Resubmit Verification", `${SITE_URL}/verify`)}
      <p style="font-size:13px;color:${B.muted};margin-top:20px;padding-top:14px;border-top:1px solid ${B.border};">Need help? <a href="${SITE_URL}/contact" style="color:${B.primary};">Contact support</a></p>
    `),
    resubmission_requested: wrap(`
      ${g(vars.name)}
      ${p("We need some updates to your verification submission before we can proceed:")}
      <div style="background:${B.primaryLight};border-left:4px solid ${B.accent};padding:16px;border-radius:0 8px 8px 0;margin:20px 0;">
        <p style="margin:0;font-size:14px;color:${B.fg};"><strong>What's needed:</strong> ${vars.reason}</p>
      </div>
      ${p("Please update your submission at your earliest convenience.")}
      ${btn("Update Verification", `${SITE_URL}/verify`)}
      <p style="font-size:13px;color:${B.muted};margin-top:20px;padding-top:14px;border-top:1px solid ${B.border};">— The PropatiHub Verification Team</p>
    `),
  };

  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": brevoKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender: { name: fromName, email: fromEmail },
        to: [{ email: to }],
        subject: subjects[template] || "PropatiHub — Verification Update",
        htmlContent: bodies[template] || bodies.submission_received,
      }),
    });
    if (!res.ok) {
      console.error("Brevo error:", res.status, await res.text());
    }
  } catch (e) {
    console.error("Brevo email error:", e);
  }
}
