"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/contact")
      .then((res) => res.json())
      .then((data) => setMessages(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-2xl text-ink">پیام‌های تماس با ما</h1>
        <Link href="/admin" className="text-sm text-ink-muted hover:text-gold">بازگشت به پنل مدیریت</Link>
      </div>

      {loading ? (
        <p className="text-ink-muted">در حال بارگذاری...</p>
      ) : messages.length === 0 ? (
        <p className="text-ink-muted">پیامی ثبت نشده است.</p>
      ) : (
        <div className="space-y-4">
          {messages.map((m) => (
            <div key={m._id} className="bg-base-panel border border-base-line rounded-sm p-5">
              <div className="flex items-center justify-between mb-2 text-sm">
                <span className="text-ink font-medium">{m.name}</span>
                <span className="text-ink-faint font-mono text-xs">
                  {new Date(m.createdAt).toLocaleDateString("fa-IR")}
                </span>
              </div>
              <p className="text-ink-muted text-xs font-mono mb-3" dir="ltr">
                {m.email}{m.phone ? ` · ${m.phone}` : ""}
              </p>
              <p className="text-ink-muted text-sm leading-6">{m.text}</p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
