"use client";
import { useEffect, useState, use as usePromise } from "react";
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

export default function OrderDetailPage({ params }) {
  const { id } = usePromise(params);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/orders/${id}`)
      .then((res) => res.json())
      .then((data) => setOrder(data.error ? null : data))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <main className="max-w-3xl mx-auto px-4 py-24 text-center text-ink-muted">در حال بارگذاری...</main>;
  if (!order) return <main className="max-w-3xl mx-auto px-4 py-24 text-center text-signal-bad">سفارش یافت نشد.</main>;

  const s = statusMap[order.status] || statusMap.pending;

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-2xl text-ink">سفارش #{order._id.slice(-6)}</h1>
        <Link href="/dashboard/orders" className="text-sm text-ink-muted hover:text-gold">بازگشت به سفارش‌ها</Link>
      </div>

      <div className="flex items-center gap-3 mb-8">
        <span className={`text-xs px-3 py-1 rounded-sm border ${s.cls}`}>{s.label}</span>
        {order.trackingCode && (
          <span className="text-xs font-mono text-ink-muted">کد رهگیری پستی: {order.trackingCode}</span>
        )}
      </div>

      <div className="bg-base-panel border border-base-line rounded-sm p-5 mb-6">
        <h2 className="font-display text-sm text-ink mb-3">اقلام سفارش</h2>
        {order.items.map((item, i) => (
          <div key={i} className="flex justify-between text-sm text-ink-muted py-1">
            <span>{item.title} × {item.quantity}</span>
            <span className="font-mono">{(item.price * item.quantity).toLocaleString()}</span>
          </div>
        ))}
        <div className="border-t border-base-line mt-3 pt-3 space-y-1 text-sm">
          <div className="flex justify-between text-ink-muted">
            <span>جمع جزء</span>
            <span className="font-mono">{order.subtotal?.toLocaleString()}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-signal-ok">
              <span>تخفیف ({order.couponCode})</span>
              <span className="font-mono">−{order.discount.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between text-ink font-semibold">
            <span>مبلغ نهایی</span>
            <span className="font-mono text-gold">{order.totalPrice.toLocaleString()} تومان</span>
          </div>
        </div>
      </div>

      <div className="bg-base-panel border border-base-line rounded-sm px-5">
        <h2 className="font-display text-sm text-ink mt-4 mb-1">اطلاعات گیرنده</h2>
        <div className="spec-row"><span className="text-ink-muted">نام</span><span className="text-ink">{order.receiver?.fullName}</span></div>
        <div className="spec-row"><span className="text-ink-muted">تلفن</span><span className="text-ink" dir="ltr">{order.receiver?.phone}</span></div>
        <div className="spec-row"><span className="text-ink-muted">استان / شهر</span><span className="text-ink">{order.receiver?.province} / {order.receiver?.city}</span></div>
        <div className="spec-row"><span className="text-ink-muted">کد پستی</span><span className="text-ink" dir="ltr">{order.receiver?.postalCode}</span></div>
        <div className="spec-row"><span className="text-ink-muted">آدرس</span><span className="text-ink">{order.receiver?.address}</span></div>
      </div>
    </main>
  );
}
