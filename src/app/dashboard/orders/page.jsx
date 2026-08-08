"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const statusMap = {
  pending: { label: "در انتظار پرداخت", cls: "text-signal-warn border-signal-warn" },
  paid: { label: "پرداخت‌شده", cls: "text-signal-ok border-signal-ok" },
  processing: { label: "در حال آماده‌سازی", cls: "text-gold border-gold" },
  shipped: { label: "ارسال‌شده", cls: "text-gold border-gold" },
  delivered: { label: "تحویل داده‌شده", cls: "text-signal-ok border-signal-ok" },
  failed: { label: "ناموفق", cls: "text-signal-bad border-signal-bad" },
  cancelled: { label: "لغوشده", cls: "text-signal-bad border-signal-bad" },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/orders")
      .then((res) => res.json())
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl text-ink">سفارش‌های من</h1>
        <Link href="/dashboard" className="text-sm text-ink-muted hover:text-gold">
          بازگشت به داشبورد
        </Link>
      </div>

      {loading ? (
        <p className="text-ink-muted">در حال بارگذاری...</p>
      ) : orders.length === 0 ? (
        <p className="text-ink-muted">هنوز سفارشی ثبت نکرده‌اید.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const s = statusMap[order.status] || statusMap.pending;
            return (
              <Link
                key={order._id}
                href={`/dashboard/orders/${order._id}`}
                className="block bg-base-panel border border-base-line rounded-sm p-5 hover:border-gold/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-ink-faint text-sm">
                    سفارش #{order._id.slice(-6)}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-sm border ${s.cls}`}>{s.label}</span>
                </div>
                <div className="text-sm text-ink-muted space-y-1 mb-3">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span>{item.title} × {item.quantity}</span>
                      <span className="font-mono">{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between border-t border-base-line pt-3 text-sm">
                  <span className="text-ink-muted">جمع کل</span>
                  <span className="font-mono text-gold font-semibold">
                    {order.totalPrice.toLocaleString()} تومان
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
