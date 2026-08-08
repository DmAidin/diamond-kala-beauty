"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
import { clearCart } from "@/redux/cartSlice";
import Link from "next/link";

function ResultBody() {
  const params = useSearchParams();
  const status = params.get("status");
  const refId = params.get("refId");
  const dispatch = useDispatch();
  const paid = status === "paid";

  useEffect(() => {
    if (paid) dispatch(clearCart());
  }, [paid, dispatch]);

  return (
    <main className="max-w-lg mx-auto px-4 py-24 text-center">
      <div
        className={`w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center border-2 ${
          paid ? "border-signal-ok text-signal-ok" : "border-signal-bad text-signal-bad"
        }`}
      >
        {paid ? "✓" : "✕"}
      </div>
      <h1 className="font-display text-2xl text-ink mb-3">
        {paid ? "پرداخت با موفقیت انجام شد" : "پرداخت ناموفق بود"}
      </h1>
      <p className="text-ink-muted mb-6">
        {paid
          ? "سفارش شما ثبت شد و به‌زودی برای ارسال آماده می‌شود."
          : "پرداخت شما تکمیل نشد یا لغو شد. می‌توانید دوباره تلاش کنید."}
      </p>
      {paid && refId && (
        <p className="font-mono text-sm text-gold mb-8">کد پیگیری: {refId}</p>
      )}
      <div className="flex gap-3 justify-center">
        <Link href="/dashboard/orders" className="px-6 py-3 rounded-sm bg-gold text-base font-semibold">
          سفارش‌های من
        </Link>
        <Link href="/" className="px-6 py-3 rounded-sm border border-base-line text-ink">
          بازگشت به فروشگاه
        </Link>
      </div>
    </main>
  );
}

export default function PaymentResultPage() {
  return (
    <Suspense fallback={null}>
      <ResultBody />
    </Suspense>
  );
}
