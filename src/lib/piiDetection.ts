/**
 * PII Detection System
 * Detects and blocks personal information in chat messages to keep transactions on-platform.
 */

interface PIIMatch {
  type: "phone" | "email" | "social" | "bank";
  label: string;
  match: string;
}

// Nigerian phone patterns: +234, 0XXX, various formats
const PHONE_PATTERNS = [
  /(?:\+?234|0)\s*[789]\s*[01]\s*\d[\s.-]?\d[\s.-]?\d[\s.-]?\d[\s.-]?\d[\s.-]?\d[\s.-]?\d[\s.-]?\d/gi,
  /(?:\+?234|0)\s*[789]\s*[01]\s*\d{8}/gi,
  /\b0[789][01]\d{8}\b/g,
  /\+234\s*\d[\s.-]?\d[\s.-]?\d[\s.-]?\d[\s.-]?\d[\s.-]?\d[\s.-]?\d[\s.-]?\d[\s.-]?\d[\s.-]?\d/gi,
  // International formats
  /\+\d{1,3}\s*\d[\s.-]?\d[\s.-]?\d[\s.-]?\d[\s.-]?\d[\s.-]?\d[\s.-]?\d[\s.-]?\d[\s.-]?\d[\s.-]?\d/gi,
  // Spelled out numbers to evade filters
  /\b(?:zero|one|two|three|four|five|six|seven|eight|nine)[\s,.-]+(?:zero|one|two|three|four|five|six|seven|eight|nine)[\s,.-]+(?:zero|one|two|three|four|five|six|seven|eight|nine)/gi,
  // "call me" / "text me" / "reach me" patterns with numbers
  /(?:call|text|reach|contact|whatsapp|message)\s+(?:me\s+)?(?:on|at|@)?\s*[\d\s.-]{7,}/gi,
];

const EMAIL_PATTERNS = [
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi,
  // Obfuscated: "name at gmail dot com"
  /[a-zA-Z0-9._%+-]+\s*(?:at|@)\s*[a-zA-Z0-9.-]+\s*(?:dot|\.)\s*(?:com|ng|net|org|co|io)/gi,
  // "my email is" pattern
  /(?:my\s+)?email\s*(?:is|:)\s*\S+/gi,
];

const SOCIAL_MEDIA_PATTERNS = [
  // Instagram
  /(?:instagram|insta|ig)\s*(?:handle|@|:|\s)\s*@?[a-zA-Z0-9_.]{2,30}/gi,
  /(?:follow|add|find)\s+(?:me\s+)?(?:on\s+)?(?:instagram|insta|ig)\s*(?:@|:)?\s*@?[a-zA-Z0-9_.]{2,}/gi,
  // WhatsApp
  /(?:whatsapp|whats\s*app|wa)\s*(?:me|number|:|\s)\s*[\d\s+.-]{7,}/gi,
  /(?:chat|message|text)\s+(?:me\s+)?(?:on\s+)?(?:whatsapp|whats\s*app)/gi,
  // Telegram
  /(?:telegram|tg)\s*(?:@|:|handle|\s)\s*@?[a-zA-Z0-9_]{2,30}/gi,
  // Facebook
  /(?:facebook|fb)\s*(?:@|:|handle|\/|\s)\s*@?[a-zA-Z0-9_.]{2,}/gi,
  // Twitter/X
  /(?:twitter|x\.com)\s*(?:@|:|handle|\/|\s)\s*@?[a-zA-Z0-9_]{2,}/gi,
  // Snapchat
  /(?:snapchat|snap)\s*(?:@|:|handle|\s)\s*@?[a-zA-Z0-9_.]{2,}/gi,
  // Generic @handle
  /@[a-zA-Z0-9_.]{3,30}(?:\s|$)/g,
];

const BANK_PATTERNS = [
  // Account numbers (10-digit Nigerian bank account numbers)
  /\b\d{10}\b/g,
  // Bank name + number
  /(?:gtb|gtbank|first\s*bank|uba|access|zenith|sterling|wema|fcmb|fidelity|polaris|stanbic|union|ecobank|keystone|heritage)\s*(?:bank)?\s*(?:account|acc|acct)?\s*(?:number|no|#|:)?\s*\d{10}/gi,
  // "my account" patterns
  /(?:my\s+)?(?:account|acc|acct)\s*(?:number|no|#|:)\s*\d{10}/gi,
  // "send to" with numbers
  /(?:send|transfer|pay)\s+(?:to|into)\s+\d{10}/gi,
  // Sort code patterns
  /(?:sort\s*code|routing)\s*(?::|is)?\s*\d{6}/gi,
];

export const detectPII = (text: string): PIIMatch[] => {
  const matches: PIIMatch[] = [];
  const normalizedText = text.replace(/\s+/g, " ");

  for (const pattern of PHONE_PATTERNS) {
    const found = normalizedText.match(new RegExp(pattern));
    if (found) {
      found.forEach((m) => matches.push({ type: "phone", label: "Phone number", match: m.trim() }));
    }
  }

  for (const pattern of EMAIL_PATTERNS) {
    const found = normalizedText.match(new RegExp(pattern));
    if (found) {
      found.forEach((m) => matches.push({ type: "email", label: "Email address", match: m.trim() }));
    }
  }

  for (const pattern of SOCIAL_MEDIA_PATTERNS) {
    const found = normalizedText.match(new RegExp(pattern));
    if (found) {
      found.forEach((m) => matches.push({ type: "social", label: "Social media handle", match: m.trim() }));
    }
  }

  for (const pattern of BANK_PATTERNS) {
    const found = normalizedText.match(new RegExp(pattern));
    if (found) {
      // Only flag 10-digit numbers if they look like account numbers (not prices/areas)
      found.forEach((m) => {
        const trimmed = m.trim();
        // Skip if it's just a standalone 10-digit number without context
        if (/^\d{10}$/.test(trimmed)) {
          // Check if surrounded by bank-related context
          const idx = normalizedText.indexOf(trimmed);
          const surrounding = normalizedText.substring(Math.max(0, idx - 40), idx + trimmed.length + 40).toLowerCase();
          if (/bank|account|acc|acct|transfer|send|pay|gtb|uba|access|zenith|first|sterling/i.test(surrounding)) {
            matches.push({ type: "bank", label: "Bank account details", match: trimmed });
          }
        } else {
          matches.push({ type: "bank", label: "Bank account details", match: trimmed });
        }
      });
    }
  }

  // Deduplicate
  const unique = matches.filter((m, i, arr) => arr.findIndex((a) => a.match === m.match && a.type === m.type) === i);
  return unique;
};

export const containsPII = (text: string): boolean => {
  return detectPII(text).length > 0;
};

export const getPIIWarningMessage = (matches: PIIMatch[]): string => {
  const types = [...new Set(matches.map((m) => m.label))];
  return `Your message contains ${types.join(", ").toLowerCase()}. For your security, all communication and transactions must stay within PropatiHub.`;
};

export const maskPII = (text: string): string => {
  let masked = text;
  const matches = detectPII(text);
  for (const m of matches) {
    masked = masked.replace(m.match, "●".repeat(Math.min(m.match.length, 12)));
  }
  return masked;
};
