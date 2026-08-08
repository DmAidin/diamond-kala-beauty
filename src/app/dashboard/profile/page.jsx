"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (session?.user?.name) setName(session.user.name);
  }, [session?.user?.name]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      await update({ name: data.name });
      setMessage({ type: "ok", text: "پروفایل به‌روزرسانی شد" });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="font-display text-3xl text-ink mb-8">پروفایل من</h1>

      <div className="bg-base-panel border border-base-line rounded-sm px-5 mb-6">
        <div className="spec-row">
          <span className="text-ink-muted">ایمیل</span>
          <span className="text-ink" dir="ltr">{session?.user?.email || "—"}</span>
        </div>
        <div className="spec-row">
          <span className="text-ink-muted">نقش کاربری</span>
          <span className="text-ink">{session?.user?.role === "admin" ? "مدیر" : "کاربر"}</span>
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-base-panel border border-base-line rounded-sm p-5">
        <label className="block mb-2 text-sm text-ink-muted">نام</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={saving}
          className="w-full px-4 py-3 rounded-sm bg-base border border-base-line text-ink focus:outline-none focus:border-gold mb-4"
        />
        {message && (
          <p className={`text-sm mb-4 ${message.type === "ok" ? "text-signal-ok" : "text-signal-bad"}`}>
            {message.text}
          </p>
        )}
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2 rounded-sm bg-gold text-base font-semibold disabled:opacity-50"
        >
          {saving ? "در حال ذخیره..." : "ذخیره تغییرات"}
        </button>
      </form>
    </main>
  );
}
