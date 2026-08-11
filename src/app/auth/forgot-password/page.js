"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setMessage(data.message);
      setStatus("sent");
    } catch {
      setMessage("خطایی رخ داد، دوباره امتحان کنید");
      setStatus("idle");
    }
  };

  return (
    <main className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md bg-base-panel border border-base-line rounded-sm p-8 sm:p-10">
        <h2 className="font-display text-2xl text-ink text-center mb-6">بازیابی رمز عبور</h2>
        <p className="text-ink-muted text-sm text-center mb-8">
          ایمیل حساب کاربری‌تان را وارد کنید تا لینک بازیابی رمز عبور برایتان ارسال شود.
        </p>

        {status === "sent" ? (
          <p className="text-signal-ok text-sm text-center">{message}</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@example.com"
              dir="ltr"
              className="w-full px-4 py-3 rounded-sm bg-base border border-base-line text-ink focus:outline-none focus:border-gold"
            />
            <button
              type="submit"
              disabled={status === "sending"}
              className="w-full py-3 rounded-sm bg-gold text-base font-bold hover:bg-gold-soft transition-colors disabled:opacity-50"
            >
              {status === "sending" ? "در حال ارسال..." : "ارسال لینک بازیابی"}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-ink-muted mt-6">
          <Link href="/auth/login" className="text-gold hover:underline">بازگشت به ورود</Link>
        </p>
      </div>
    </main>
  );
}
