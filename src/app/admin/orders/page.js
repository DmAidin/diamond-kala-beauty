"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

const statusOptions = [
  { value: "pending", label: "در انتظار پرداخت" },
  { value: "paid", label: "پرداخت‌شده" },
  { value: "processing", label: "در حال آماده‌سازی" },
  { value: "shipped", label: "ارسال‌شده" },
  { value: "delivered", label: "تحویل داده‌شده" },
  { value: "failed", label: "ناموفق" },
  { value: "cancelled", label: "لغوشده" },
];

const statusCls = {
  pending: "text-signal-warn border-signal-warn",
  paid: "text-signal-ok border-signal-ok",
  processing: "text-gold border-gold",
  shipped: "text-gold border-gold",
  delivered: "text-signal-ok border-signal-ok",
  failed: "text-signal-bad border-signal-bad",
  cancelled: "text-signal-bad border-signal-bad",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    fetch("/api/admin/orders")
      .then((res) => res.json())
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  const updateOrder = async (id, patch) => {
    setSavingId(id);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const updated = await res.json();
      setOrders((prev) => prev.map((o) => (o._id === id ? updated : o)));
    } finally {
      setSavingId(null);
    }
  };

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-2xl text-ink">سفارش‌های فروشگاه</h1>
        <Link href="/admin" className="text-sm text-ink-muted hover:text-gold">بازگشت به پنل مدیریت</Link>
      </div>

      {loading ? (
        <p className="text-ink-muted">در حال بارگذاری...</p>
      ) : orders.length === 0 ? (
        <p className="text-ink-muted">هنوز سفارشی ثبت نشده است.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <div key={o._id} className="bg-base-panel border border-base-line rounded-sm p-5">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <span className="font-mono text-ink-faint text-sm">#{o._id.slice(-6)}</span>
                <span className="text-ink text-sm">{o.receiver?.fullName}</span>
                <span className="font-mono text-gold">{o.totalPrice.toLocaleString()} تومان</span>
                <span className={`text-xs px-2 py-1 rounded-sm border ${statusCls[o.status]}`}>
                  {statusOptions.find((s) => s.value === o.status)?.label}
                </span>
              </div>

              <div className="bg-base border border-base-line rounded-sm px-4 mb-4">
                <div className="spec-row">
                  <span className="text-ink-muted">تلفن</span>
                  <span className="text-ink" dir="ltr">{o.receiver?.phone || "—"}</span>
                </div>
                <div className="spec-row">
                  <span className="text-ink-muted">استان / شهر</span>
                  <span className="text-ink">{o.receiver?.province || "—"} / {o.receiver?.city || "—"}</span>
                </div>
                <div className="spec-row">
                  <span className="text-ink-muted">کد پستی</span>
                  <span className="text-ink" dir="ltr">{o.receiver?.postalCode || "—"}</span>
                </div>
                <div className="spec-row">
                  <span className="text-ink-muted">آدرس</span>
                  <span className="text-ink">{o.receiver?.address || "—"}</span>
                </div>
                {o.receiver?.notes && (
                  <div className="spec-row">
                    <span className="text-ink-muted">توضیحات</span>
                    <span className="text-ink">{o.receiver.notes}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={o.status}
                  onChange={(e) => updateOrder(o._id, { status: e.target.value })}
                  disabled={savingId === o._id}
                  className="bg-base border border-base-line rounded-sm px-3 py-2 text-sm text-ink focus:outline-none focus:border-gold"
                >
                  {statusOptions.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>

                <input
                  defaultValue={o.trackingCode || ""}
                  placeholder="کد رهگیری پستی"
                  onBlur={(e) => {
                    if (e.target.value !== (o.trackingCode || "")) {
                      updateOrder(o._id, { trackingCode: e.target.value });
                    }
                  }}
                  disabled={savingId === o._id}
                  className="bg-base border border-base-line rounded-sm px-3 py-2 text-sm text-ink focus:outline-none focus:border-gold w-48"
                  dir="ltr"
                />

                {savingId === o._id && <span className="text-xs text-ink-faint">در حال ذخیره...</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
