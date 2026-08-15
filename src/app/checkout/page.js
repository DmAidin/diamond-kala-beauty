"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const provinces = [
  "تهران", "البرز", "اصفهان", "فارس", "خراسان رضوی", "آذربایجان شرقی", "آذربایجان غربی",
  "خوزستان", "مازندران", "گیلان", "کرمان", "یزد", "قم", "همدان", "کرمانشاه", "سیستان و بلوچستان",
  "هرمزگان", "بوشهر", "اردبیل", "زنجان", "قزوین", "لرستان", "کردستان", "چهارمحال و بختیاری",
  "گلستان", "سمنان", "مرکزی", "ایلام", "کهگیلویه و بویراحمد", "خراسان شمالی", "خراسان جنوبی",
];

const COURIER_FEE = 0; // collected by the courier in person, not paid online

export default function CheckoutPage() {
  const cart = useSelector((state) => state.cart);
  const { data: session, status } = useSession();
  const router = useRouter();

  const [deliveryMethod, setDeliveryMethod] = useState("courier");
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    province: "تهران",
    city: "",
    postalCode: "",
    address: "",
    notes: "",
  });
  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState(null); // { code, discount }
  const [couponError, setCouponError] = useState(null);
  const [checkingCoupon, setCheckingCoupon] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const discount = coupon?.discount || 0;
  const shippingCost = COURIER_FEE;
  const finalTotal = Math.max(cart.totalPrice - discount, 0) + shippingCost;

  const applyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCheckingCoupon(true);
    setCouponError(null);
    try {
      const res = await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponInput, subtotal: cart.totalPrice }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCoupon(data);
    } catch (err) {
      setCoupon(null);
      setCouponError(err.message);
    } finally {
      setCheckingCoupon(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!form.fullName.trim() || !form.phone.trim() || !form.city.trim() || !form.postalCode.trim() || !form.address.trim()) {
      setError("لطفاً همه فیلدهای الزامی گیرنده را کامل کنید.");
      return;
    }

    setSubmitting(true);
    try {
      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: cart.items, receiver: form, couponCode: coupon?.code || "", deliveryMethod }),
      });
      const order = await orderRes.json();
      if (!orderRes.ok) throw new Error(order.error || "ثبت سفارش ناموفق بود");

      const payRes = await fetch("/api/payment/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order._id }),
      });
      const pay = await payRes.json();
      if (!payRes.ok) throw new Error(pay.error || "اتصال به درگاه پرداخت ناموفق بود");

      window.location.href = pay.gatewayUrl;
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  if (status === "loading") return null;

  if (status === "unauthenticated") {
    return (
      <main className="max-w-xl mx-auto px-4 py-24 text-center">
        <p className="text-ink-muted mb-6">برای تسویه حساب ابتدا باید وارد حساب کاربری‌تان شوید.</p>
        <button
          onClick={() => router.push("/auth/login?callbackUrl=/checkout")}
          className="px-6 py-3 rounded-sm bg-gold text-base font-semibold"
        >
          ورود به حساب
        </button>
      </main>
    );
  }

  if (cart.items.length === 0) {
    return (
      <main className="max-w-xl mx-auto px-4 py-24 text-center">
        <p className="text-ink-muted mb-6">سبد خرید شما خالی است.</p>
        <Link href="/" className="px-6 py-3 rounded-sm bg-gold text-base font-semibold inline-block">
          بازگشت به فروشگاه
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="font-display text-3xl text-ink mb-8">تسویه حساب</h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <form onSubmit={handleSubmit} className="lg:col-span-3 bg-base-panel border border-base-line rounded-sm p-6 space-y-5">
          <h2 className="font-display text-lg text-ink mb-2">روش تحویل</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <button
              type="button"
              onClick={() => setDeliveryMethod("courier")}
              disabled={submitting}
              className={`text-right p-4 rounded-sm border transition-colors ${
                deliveryMethod === "courier" ? "border-gold bg-gold/10" : "border-base-line hover:border-gold/50"
              }`}
            >
              <p className="text-ink font-medium mb-1">ارسال با پیک (پس‌کرایه)</p>
              <p className="text-ink-muted text-xs">
                تحویل درب منزل — گیرنده مبلغ ارسال را پس از دریافت کالا پرداخت می‌کند
              </p>
            </button>
            <button
              type="button"
              onClick={() => setDeliveryMethod("pickup")}
              disabled={submitting}
              className={`text-right p-4 rounded-sm border transition-colors ${
                deliveryMethod === "pickup" ? "border-gold bg-gold/10" : "border-base-line hover:border-gold/50"
              }`}
            >
              <p className="text-ink font-medium mb-1">تحویل حضوری</p>
              <p className="text-ink-muted text-xs">دریافت از فروشگاه — بدون هزینه ارسال</p>
            </button>
          </div>

          <h2 className="font-display text-lg text-ink mb-2">اطلاعات گیرنده</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="نام و نام خانوادگی *">
              <input
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                className="input"
                disabled={submitting}
              />
            </Field>
            <Field label="شماره تماس *">
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="input"
                disabled={submitting}
                dir="ltr"
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <Field label="استان *">
              <select
                value={form.province}
                onChange={(e) => setForm({ ...form, province: e.target.value })}
                disabled={submitting}
                className="input"
              >
                {provinces.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </Field>
            <Field label="شهر *">
              <input
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="input"
                disabled={submitting}
              />
            </Field>
            <Field label="کد پستی *">
              <input
                value={form.postalCode}
                onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                className="input"
                disabled={submitting}
                dir="ltr"
              />
            </Field>
          </div>

          <Field label="آدرس کامل *">
            <textarea
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              rows={3}
              className="input"
              disabled={submitting}
            />
          </Field>

          <Field label="توضیحات سفارش (اختیاری)">
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
              className="input"
              disabled={submitting}
              placeholder="مثلاً: زمان ترجیحی تحویل، نشانی دقیق‌تر و..."
            />
          </Field>

          {error && (
            <p className="text-signal-bad text-sm border border-signal-bad/40 bg-signal-bad/10 rounded-sm px-4 py-3">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-sm bg-gold text-base font-bold hover:bg-gold-soft transition-colors disabled:opacity-50"
          >
            {submitting ? "در حال اتصال به درگاه پرداخت..." : "پرداخت و تکمیل سفارش"}
          </button>
        </form>

        <div className="lg:col-span-2 space-y-5 h-fit">
          <div className="bg-base-panel border border-base-line rounded-sm p-6">
            <h2 className="font-display text-lg text-ink mb-4">خلاصه سفارش</h2>
            <div className="space-y-3 mb-4">
              {cart.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm text-ink-muted">
                  <span>{item.title} × {item.quantity}</span>
                  <span className="font-mono">{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className="spec-row text-sm">
              <span className="text-ink-muted">جمع جزء</span>
              <span className="text-ink font-mono">{cart.totalPrice.toLocaleString()}</span>
            </div>
            {discount > 0 && (
              <div className="spec-row text-sm">
                <span className="text-signal-ok">تخفیف ({coupon.code})</span>
                <span className="text-signal-ok font-mono">−{discount.toLocaleString()}</span>
              </div>
            )}
            <div className="spec-row text-sm">
              <span className="text-ink-muted">هزینه ارسال</span>
              <span className="text-ink text-xs">
                {deliveryMethod === "pickup" ? "رایگان (تحویل حضوری)" : "پس‌کرایه — پرداخت به پیک"}
              </span>
            </div>
            <div className="spec-row text-ink text-base font-semibold">
              <span>مبلغ قابل پرداخت (تومان)</span>
              <span className="text-gold">{finalTotal.toLocaleString()}</span>
            </div>
          </div>

          <div className="bg-base-panel border border-base-line rounded-sm p-6">
            <h2 className="font-display text-sm text-ink mb-3">کد تخفیف</h2>
            <div className="flex gap-2">
              <input
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                placeholder="مثلاً DIAMOND10"
                disabled={checkingCoupon || !!coupon}
                className="input flex-1"
                dir="ltr"
              />
              <button
                type="button"
                onClick={applyCoupon}
                disabled={checkingCoupon || !!coupon}
                className="px-4 rounded-sm border border-gold/60 text-gold text-sm hover:bg-gold/10 disabled:opacity-50 shrink-0"
              >
                {checkingCoupon ? "..." : coupon ? "اعمال شد" : "اعمال کد"}
              </button>
            </div>
            {couponError && <p className="text-signal-bad text-xs mt-2">{couponError}</p>}
            {coupon && (
              <p className="text-signal-ok text-xs mt-2">
                کد «{coupon.code}» اعمال شد — {discount.toLocaleString()} تومان تخفیف
              </p>
            )}
          </div>
        </div>
      </div>

      <style jsx global>{`
        .input {
          width: 100%;
          background: rgb(var(--color-base));
          border: 1px solid rgb(var(--color-base-line));
          border-radius: 2px;
          padding: 0.7rem 1rem;
          color: rgb(var(--color-ink));
        }
        .input:focus {
          outline: none;
          border-color: rgb(var(--color-gold));
        }
      `}</style>
    </main>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block mb-2 text-sm text-ink-muted">{label}</label>
      {children}
    </div>
  );
}
