// Sends transactional email via Resend's REST API (https://resend.com) —
// plain fetch, no SDK dependency needed.
//
// Requires RESEND_API_KEY in the environment. Without it, this quietly
// no-ops so local development never crashes for lack of an email
// provider — but forgot-password links will only work once it's set.
//
// RESEND_FROM_EMAIL defaults to Resend's shared test address, which works
// immediately with zero setup but only delivers to the account owner's
// own inbox. For real delivery to customers, verify a domain in Resend
// and set RESEND_FROM_EMAIL to an address on that domain.
export async function sendEmail({ to, subject, html }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("RESEND_API_KEY is not set — skipping email send:", subject);
    return { ok: false, skipped: true };
  }

  const from = process.env.RESEND_FROM_EMAIL || "Diamond Kala <onboarding@resend.dev>";

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to, subject, html }),
    });
    if (!res.ok) {
      const text = await res.text();
      console.error("Resend email error:", text);
      return { ok: false };
    }
    return { ok: true };
  } catch (error) {
    console.error("Resend email send failed:", error);
    return { ok: false };
  }
}
