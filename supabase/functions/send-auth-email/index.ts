import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SITE_URL = "https://propatihub.lovable.app";
const LOGO_URL = `${SITE_URL}/logo-email.png`;

// Brand colors from PropatiHub design system
const BRAND = {
  primary: "#1f5f3f",       // hsl(152, 45%, 22%)
  primaryLight: "#e8f5ee",
  accent: "#d4922e",        // hsl(38, 80%, 55%)
  accentLight: "#fef7ec",
  foreground: "#162a1f",    // hsl(160, 30%, 10%)
  muted: "#6b7d72",         // hsl(160, 10%, 45%)
  background: "#faf8f4",    // hsl(40, 33%, 97%)
  white: "#ffffff",
  border: "#e5e0d6",
  radius: "12px",
};

function emailWrapper(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PropatiHub</title>
</head>
<body style="margin:0;padding:0;background-color:${BRAND.background};font-family:'DM Sans',Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND.background};padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:${BRAND.white};border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, ${BRAND.primary} 0%, #2a7a54 100%);padding:32px 40px;text-align:center;">
              <h1 style="margin:0;font-family:'Playfair Display',Georgia,serif;font-size:28px;font-weight:700;color:${BRAND.white};letter-spacing:-0.5px;">
                pro<span style="color:${BRAND.accent};">pati</span><span style="font-size:14px;vertical-align:super;color:${BRAND.accent};">HUB</span>
              </h1>
              <p style="margin:6px 0 0;font-size:12px;color:rgba(255,255,255,0.7);letter-spacing:1.5px;text-transform:uppercase;">Nigeria's Premier Property Marketplace</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;background:${BRAND.primaryLight};border-top:1px solid ${BRAND.border};">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="text-align:center;">
                    <p style="margin:0 0 8px;font-size:13px;color:${BRAND.muted};">
                      Buy · Rent · Sell · Bid — across all 36 states + FCT
                    </p>
                    <p style="margin:0 0 12px;font-size:12px;color:${BRAND.muted};">
                      <a href="${SITE_URL}/terms" style="color:${BRAND.primary};text-decoration:none;">Terms</a> &nbsp;·&nbsp;
                      <a href="${SITE_URL}/privacy" style="color:${BRAND.primary};text-decoration:none;">Privacy</a> &nbsp;·&nbsp;
                      <a href="${SITE_URL}/contact" style="color:${BRAND.primary};text-decoration:none;">Support</a>
                    </p>
                    <p style="margin:0;font-size:11px;color:#b0b5b2;">
                      © ${new Date().getFullYear()} PropatiHub. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function ctaButton(text: string, url: string, color: string = BRAND.primary): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" style="margin:32px 0;">
    <tr>
      <td align="center">
        <a href="${url}" style="display:inline-block;background:${color};color:${BRAND.white};padding:14px 40px;border-radius:${BRAND.radius};text-decoration:none;font-weight:600;font-size:16px;letter-spacing:0.3px;box-shadow:0 4px 12px rgba(31,95,63,0.25);">${text}</a>
      </td>
    </tr>
  </table>`;
}

function greeting(name: string): string {
  return `<p style="font-size:16px;color:${BRAND.foreground};line-height:1.6;margin:0 0 16px;">Hi${name ? ` ${name}` : ""},</p>`;
}

function paragraph(text: string): string {
  return `<p style="font-size:15px;color:${BRAND.foreground};line-height:1.7;margin:0 0 16px;">${text}</p>`;
}

function smallNote(text: string): string {
  return `<p style="font-size:13px;color:${BRAND.muted};line-height:1.6;margin:24px 0 0;padding-top:16px;border-top:1px solid ${BRAND.border};">${text}</p>`;
}

interface EmailTemplate {
  subject: string;
  html: string;
}

function getSignupConfirmationEmail(name: string, confirmUrl: string): EmailTemplate {
  return {
    subject: "Verify Your Email — Welcome to PropatiHub 🏠",
    html: emailWrapper(`
      ${greeting(name)}
      ${paragraph("Welcome to <strong>PropatiHub</strong> — Nigeria's premier property marketplace! You're one step away from accessing thousands of properties across all 36 states + FCT.")}
      ${paragraph("Please verify your email address to activate your account:")}
      ${ctaButton("Verify My Email", confirmUrl)}
      ${paragraph("Once verified, you'll be able to:")}
      <ul style="font-size:15px;color:${BRAND.foreground};line-height:2;padding-left:20px;margin:0 0 16px;">
        <li>Browse and search properties nationwide</li>
        <li>Save favourite listings and set alerts</li>
        <li>Place bids on auction properties</li>
        <li>Connect directly with verified agents</li>
      </ul>
      ${smallNote("This link expires in 24 hours. If you didn't create an account on PropatiHub, you can safely ignore this email.")}
    `),
  };
}

function getPasswordResetEmail(name: string, resetUrl: string): EmailTemplate {
  return {
    subject: "Reset Your Password — PropatiHub",
    html: emailWrapper(`
      ${greeting(name)}
      ${paragraph("We received a request to reset the password for your PropatiHub account. Click the button below to set a new password:")}
      ${ctaButton("Reset Password", resetUrl)}
      ${paragraph("This link will expire in <strong>1 hour</strong> for security reasons.")}
      ${smallNote("If you didn't request a password reset, no action is needed — your account remains secure. If you're concerned about unauthorized access, please <a href=\"" + SITE_URL + "/contact\" style=\"color:" + BRAND.primary + ";\">contact our support team</a>.")}
    `),
  };
}

function getMagicLinkEmail(name: string, magicUrl: string): EmailTemplate {
  return {
    subject: "Your Login Link — PropatiHub",
    html: emailWrapper(`
      ${greeting(name)}
      ${paragraph("Here's your one-time login link for PropatiHub. Click below to sign in instantly:")}
      ${ctaButton("Sign In to PropatiHub", magicUrl)}
      ${smallNote("This link expires in 10 minutes and can only be used once. If you didn't request this, you can safely ignore it.")}
    `),
  };
}

function getEmailChangeEmail(name: string, confirmUrl: string): EmailTemplate {
  return {
    subject: "Confirm Your New Email — PropatiHub",
    html: emailWrapper(`
      ${greeting(name)}
      ${paragraph("You've requested to change the email address associated with your PropatiHub account. Please confirm this change by clicking below:")}
      ${ctaButton("Confirm Email Change", confirmUrl)}
      ${smallNote("If you didn't make this request, please contact our support team immediately at <a href=\"" + SITE_URL + "/contact\" style=\"color:" + BRAND.primary + ";\">support</a>.")}
    `),
  };
}

function getInviteEmail(name: string, inviteUrl: string): EmailTemplate {
  return {
    subject: "You've Been Invited to PropatiHub 🏠",
    html: emailWrapper(`
      ${greeting(name)}
      ${paragraph("You've been invited to join <strong>PropatiHub</strong> — Nigeria's premier property marketplace. Accept the invitation to get started:")}
      ${ctaButton("Accept Invitation", inviteUrl)}
      ${paragraph("PropatiHub helps you buy, rent, sell, and bid on properties across all 36 Nigerian states + FCT with verified agents, escrow protection, and digital contracts.")}
      ${smallNote("If you weren't expecting this invitation, you can safely ignore this email.")}
    `),
  };
}

function getReauthenticationEmail(name: string, token: string): EmailTemplate {
  return {
    subject: "Your Verification Code — PropatiHub",
    html: emailWrapper(`
      ${greeting(name)}
      ${paragraph("For your security, please use the following code to verify your identity:")}
      <div style="text-align:center;margin:32px 0;">
        <div style="display:inline-block;background:${BRAND.primaryLight};border:2px dashed ${BRAND.primary};border-radius:${BRAND.radius};padding:20px 40px;">
          <span style="font-family:'DM Sans',monospace;font-size:36px;font-weight:700;color:${BRAND.primary};letter-spacing:8px;">${token}</span>
        </div>
      </div>
      ${paragraph("This code will expire in <strong>10 minutes</strong>.")}
      ${smallNote("If you didn't request this code, please secure your account by changing your password immediately.")}
    `),
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const brevoKey = Deno.env.get("BREVO_API_KEY");
    const fromName = Deno.env.get("BREVO_FROM_NAME") || "PropatiHub";
    const fromEmail = Deno.env.get("BREVO_FROM") || "info@propatihub.com";

    if (!brevoKey) {
      console.error("BREVO_API_KEY not configured");
      return new Response(JSON.stringify({ error: "Email service not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { type, email, name, confirmation_url, token } = body;

    let template: EmailTemplate;

    switch (type) {
      case "signup":
      case "signup_confirmation":
        template = getSignupConfirmationEmail(name || "", confirmation_url || `${SITE_URL}/auth`);
        break;
      case "recovery":
      case "password_reset":
        template = getPasswordResetEmail(name || "", confirmation_url || `${SITE_URL}/reset-password`);
        break;
      case "magiclink":
      case "magic_link":
        template = getMagicLinkEmail(name || "", confirmation_url || `${SITE_URL}/auth`);
        break;
      case "email_change":
        template = getEmailChangeEmail(name || "", confirmation_url || `${SITE_URL}/auth`);
        break;
      case "invite":
        template = getInviteEmail(name || "", confirmation_url || `${SITE_URL}/auth`);
        break;
      case "reauthentication":
        template = getReauthenticationEmail(name || "", token || "000000");
        break;
      default:
        template = getSignupConfirmationEmail(name || "", confirmation_url || `${SITE_URL}/auth`);
    }

    const brevoRes = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": brevoKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender: { name: fromName, email: fromEmail },
        to: [{ email }],
        subject: template.subject,
        htmlContent: template.html,
      }),
    });

    if (!brevoRes.ok) {
      const errorText = await brevoRes.text();
      console.error("Brevo API error:", brevoRes.status, errorText);
      return new Response(JSON.stringify({ error: "Failed to send email" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Send auth email error:", err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
