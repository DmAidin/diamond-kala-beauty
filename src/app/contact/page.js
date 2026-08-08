"use client";

import { useState } from "react";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", text: "" });
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("sending");
    setError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "ارسال پیام ناموفق بود");
      setStatus("sent");
      setForm({ name: "", email: "", phone: "", text: "" });
    } catch (err) {
      setError(err.message);
      setStatus("error");
    }
  };

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
      <p className="font-mono text-gold text-xs tracking-[0.3em] mb-4">CONTACT / DIAMOND KALA</p>
      <h1 className="font-display text-3xl sm:text-4xl text-ink mb-10">تماس با ما</h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 space-y-5">
          <InfoRow label="تلفن" value="09369555097" href="tel:09369555097" />
          <InfoRow label="ایمیل" value="Rahkarhayehooshmandelin@gmail.com" href="mailto:Rahkarhayehooshmandelin@gmail.com" />
          <InfoRow label="شهر" value="تهران" />
        </div>

        <form onSubmit={handleSubmit} className="lg:col-span-3 bg-base-panel border border-base-line rounded-sm p-6 space-y-5">
          {status === "sent" ? (
            <p className="text-signal-ok text-center py-8">
              پیام شما ارسال شد، به‌زودی پاسخ داده می‌شود.
            </p>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field label="نام">
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="input"
                  />
                </Field>
                <Field label="ایمیل">
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="input"
                  />
                </Field>
              </div>
              <Field label="شماره تماس (اختیاری)">
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="input"
                />
              </Field>
              <Field label="پیام شما">
                <textarea
                  required
                  rows={5}
                  value={form.text}
                  onChange={(e) => setForm({ ...form, text: e.target.value })}
                  className="input"
                />
              </Field>

              {error && <p className="text-signal-bad text-sm">{error}</p>}

              <button
                type="submit"
                disabled={status === "sending"}
                className="w-full py-3 rounded-sm bg-gold text-base font-bold hover:bg-gold-soft transition-colors disabled:opacity-50"
              >
                {status === "sending" ? "در حال ارسال..." : "ارسال پیام"}
              </button>
            </>
          )}
        </form>
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

function InfoRow({ label, value, href }) {
  return (
    <div className="bg-base-panel border border-base-line rounded-sm p-5">
      <p className="text-ink-faint text-xs font-mono mb-1">{label}</p>
      {href ? (
        <a href={href} className="text-ink hover:text-gold transition-colors font-mono" dir="ltr">
          {value}
        </a>
      ) : (
        <p className="text-ink font-mono" dir="ltr">{value}</p>
      )}
    </div>
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
