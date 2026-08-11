// A pragmatic (not fully RFC-5322) email check — good enough to reject
// obvious junk without rejecting real addresses.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email) {
  return typeof email === "string" && EMAIL_RE.test(email.trim()) && email.length <= 254;
}
