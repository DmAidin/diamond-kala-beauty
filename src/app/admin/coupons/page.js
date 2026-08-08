"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

const emptyForm = { code: "", type: "percent", value: "", minOrderTotal: "", expiresAt: "" };

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCoupons();
  }, []);

  async function fetchCoupons() {
    setLoading(true);
    const res = await fetch("/api/admin/coupons");
    setCoupons(await res.json());
    setLoading(false);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCoupons([data, ...coupons]);
      setForm(emptyForm);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (coupon) => {
    const res = await fetch(`/api/admin/coupons/${coupon._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !coupon.active }),
    });
    const updated = await res.json();
    setCoupons(coupons.map((c) => (c._id === coupon._id ? updated : c)));
  };

  const remove = async (id) => {
    if (!confirm("این کد تخفیف حذف شود؟")) return;
    await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
    setCoupons(coupons.filter((c) => c._id !== id));
  };

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-2xl text-ink">کدهای تخفیف</h1>
        <Link href="/admin" className="text-sm text-ink-muted hover:text-gold">بازگشت به پنل مدیریت</Link>
      </div>

      <form onSubmit={handleSubmit} className="bg-base-panel border border-base-line rounded-sm p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
        <Input label="کد" value={form.code} onChange={(v) => setForm({ ...form, code: v.toUpperCase() })} />
        <div>
          <label className="block mb-2 text-sm text-ink-muted">نوع تخفیف</label>
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            className="w-full px-4 py-3 rounded-sm bg-base border border-base-line text-ink focus:outline-none focus:border-gold"
          >
            <option value="percent">درصدی</option>
            <option value="fixed">مبلغ ثابت (تومان)</option>
          </select>
        </div>
        <Input label={form.type === "percent" ? "درصد تخفیف" : "مبلغ تخفیف (تومان)"} type="number" value={form.value} onChange={(v) => setForm({ ...form, value: v })} />
        <Input label="حداقل مبلغ سفارش (اختیاری)" type="number" value={form.minOrderTotal} onChange={(v) => setForm({ ...form, minOrderTotal: v })} />
        <Input label="تاریخ انقضا (اختیاری)" type="date" value={form.expiresAt} onChange={(v) => setForm({ ...form, expiresAt: v })} />
        <div className="sm:col-span-2">
          {error && <p className="text-signal-bad text-sm mb-3">{error}</p>}
          <button type="submit" disabled={saving} className="px-6 py-3 rounded-sm bg-gold text-base font-semibold disabled:opacity-50">
            {saving ? "در حال ساخت..." : "ساخت کد تخفیف"}
          </button>
        </div>
      </form>

      {loading ? (
        <p className="text-ink-muted">در حال بارگذاری...</p>
      ) : coupons.length === 0 ? (
        <p className="text-ink-muted">هنوز کد تخفیفی ثبت نشده است.</p>
      ) : (
        <div className="space-y-3">
          {coupons.map((c) => (
            <div key={c._id} className="bg-base-panel border border-base-line rounded-sm p-4 flex flex-wrap items-center justify-between gap-3">
              <span className="font-mono text-gold">{c.code}</span>
              <span className="text-ink-muted text-sm">
                {c.type === "percent" ? `${c.value}٪` : `${c.value.toLocaleString()} تومان`}
              </span>
              <span className={`text-xs px-2 py-1 rounded-sm border ${c.active ? "text-signal-ok border-signal-ok" : "text-ink-faint border-base-line"}`}>
                {c.active ? "فعال" : "غیرفعال"}
              </span>
              <div className="flex gap-3">
                <button onClick={() => toggleActive(c)} className="text-gold text-sm hover:underline">
                  {c.active ? "غیرفعال کن" : "فعال کن"}
                </button>
                <button onClick={() => remove(c._id)} className="text-signal-bad text-sm hover:underline">حذف</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

function Input({ label, value, onChange, type = "text" }) {
  return (
    <div>
      <label className="block mb-2 text-sm text-ink-muted">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 rounded-sm bg-base border border-base-line text-ink focus:outline-none focus:border-gold"
      />
    </div>
  );
}
