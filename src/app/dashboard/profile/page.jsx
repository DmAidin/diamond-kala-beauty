"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState(null);

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

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMessage(null);

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: "error", text: "رمز عبور جدید و تکرار آن یکسان نیستند" });
      return;
    }

    setChangingPassword(true);
    try {
      const res = await fetch("/api/profile/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPasswordMessage({ type: "ok", text: data.message });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordMessage({ type: "error", text: err.message });
    } finally {
      setChangingPassword(false);
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

      <form onSubmit={handleSave} className="bg-base-panel border border-base-line rounded-sm p-5 mb-6">
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

      <form onSubmit={handleChangePassword} className="bg-base-panel border border-base-line rounded-sm p-5">
        <h2 className="font-display text-lg text-ink mb-4">تغییر رمز عبور</h2>

        <label className="block mb-2 text-sm text-ink-muted">رمز عبور فعلی</label>
        <input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          disabled={changingPassword}
          className="w-full px-4 py-3 rounded-sm bg-base border border-base-line text-ink focus:outline-none focus:border-gold mb-4"
        />

        <label className="block mb-2 text-sm text-ink-muted">رمز عبور جدید</label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          disabled={changingPassword}
          className="w-full px-4 py-3 rounded-sm bg-base border border-base-line text-ink focus:outline-none focus:border-gold mb-4"
        />

        <label className="block mb-2 text-sm text-ink-muted">تکرار رمز عبور جدید</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={changingPassword}
          className="w-full px-4 py-3 rounded-sm bg-base border border-base-line text-ink focus:outline-none focus:border-gold mb-4"
        />

        {passwordMessage && (
          <p className={`text-sm mb-4 ${passwordMessage.type === "ok" ? "text-signal-ok" : "text-signal-bad"}`}>
            {passwordMessage.text}
          </p>
        )}

        <button
          type="submit"
          disabled={changingPassword}
          className="px-6 py-2 rounded-sm bg-gold text-base font-semibold disabled:opacity-50"
        >
          {changingPassword ? "در حال تغییر..." : "تغییر رمز عبور"}
        </button>
      </form>
    </main>
  );
}
