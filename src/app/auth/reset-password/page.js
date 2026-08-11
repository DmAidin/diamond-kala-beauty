"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

function ResetForm() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("رمز عبور و تکرار آن یکسان نیستند");
      return;
    }
    setStatus("sending");
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setStatus("done");
      setTimeout(() => router.push("/auth/login"), 2000);
    } catch (err) {
      setError(err.message);
      setStatus("idle");
    }
  };

  if (!token) {
    return (
      <p className="text-signal-bad text-sm text-center">
        لینک بازیابی نامعتبر است. <Link href="/auth/forgot-password" className="text-gold underline">دوباره درخواست بدهید</Link>.
      </p>
    );
  }

  if (status === "done") {
    return <p className="text-signal-ok text-sm text-center">رمز عبور با موفقیت تغییر کرد، در حال انتقال به صفحه ورود...</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block mb-2 text-sm text-ink-muted">رمز عبور جدید</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 rounded-sm bg-base border border-base-line text-ink focus:outline-none focus:border-gold"
        />
      </div>
      <div>
        <label className="block mb-2 text-sm text-ink-muted">تکرار رمز عبور جدید</label>
        <input
          type="password"
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="w-full px-4 py-3 rounded-sm bg-base border border-base-line text-ink focus:outline-none focus:border-gold"
        />
      </div>
      {error && <p className="text-signal-bad text-sm">{error}</p>}
      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full py-3 rounded-sm bg-gold text-base font-bold hover:bg-gold-soft transition-colors disabled:opacity-50"
      >
        {status === "sending" ? "در حال ثبت..." : "تغییر رمز عبور"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md bg-base-panel border border-base-line rounded-sm p-8 sm:p-10">
        <h2 className="font-display text-2xl text-ink text-center mb-8">تنظیم رمز عبور جدید</h2>
        <Suspense fallback={null}>
          <ResetForm />
        </Suspense>
      </div>
    </main>
  );
}
