// Thin wrapper around ZarinPal's v4 REST payment gateway.
// Docs: https://docs.zarinpal.com  (sandbox: https://sandbox.zarinpal.com)
//
// Configure via env vars:
//   ZARINPAL_MERCHANT_ID  - your real merchant id from zarinpal.com (36-char UUID)
//   ZARINPAL_SANDBOX      - "true" while testing, "false" (or unset) in production
//
// Without a real merchant id set, this falls back to ZarinPal's public sandbox
// test id so the checkout flow can be exercised end-to-end before the real
// merchant account is ready. Sandbox payments never move real money.
const SANDBOX_TEST_MERCHANT_ID = "00000000-0000-0000-0000-000000000000";

function isSandbox() {
  return process.env.ZARINPAL_SANDBOX === "true" || !process.env.ZARINPAL_MERCHANT_ID;
}

function baseUrl() {
  return isSandbox() ? "https://sandbox.zarinpal.com" : "https://api.zarinpal.com";
}

function merchantId() {
  return process.env.ZARINPAL_MERCHANT_ID || SANDBOX_TEST_MERCHANT_ID;
}

// amountToman: order total in Toman. ZarinPal's v4 API expects Rial, so it's ×10 here.
export async function requestPayment({ amountToman, description, callbackUrl, mobile, email }) {
  const res = await fetch(`${baseUrl()}/pg/v4/payment/request.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      merchant_id: merchantId(),
      amount: Math.round(amountToman) * 10,
      description,
      callback_url: callbackUrl,
      metadata: { mobile, email },
    }),
  });
  const data = await res.json();

  if (data?.data?.code === 100) {
    const startPayHost = isSandbox() ? "https://sandbox.zarinpal.com" : "https://www.zarinpal.com";
    return {
      ok: true,
      authority: data.data.authority,
      gatewayUrl: `${startPayHost}/pg/StartPay/${data.data.authority}`,
    };
  }
  return { ok: false, error: data?.errors?.message || "درخواست پرداخت ناموفق بود" };
}

export async function verifyPayment({ amountToman, authority }) {
  const res = await fetch(`${baseUrl()}/pg/v4/payment/verify.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      merchant_id: merchantId(),
      amount: Math.round(amountToman) * 10,
      authority,
    }),
  });
  const data = await res.json();

  // 100 = freshly verified, 101 = already verified previously (still a success)
  if (data?.data?.code === 100 || data?.data?.code === 101) {
    return { ok: true, refId: data.data.ref_id };
  }
  return { ok: false, error: data?.errors?.message || "تایید پرداخت ناموفق بود" };
}
