"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export default function AdminChatPage() {
  const [conversations, setConversations] = useState([]);
  const [activeUserId, setActiveUserId] = useState(null);
  const [thread, setThread] = useState([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  // heartbeat so the "online" indicator on the customer widget lights up
  useEffect(() => {
    const ping = () => fetch("/api/admin/presence", { method: "POST" }).catch(() => {});
    ping();
    const id = setInterval(ping, 30000);
    return () => clearInterval(id);
  }, []);

  const loadConversations = () =>
    fetch("/api/admin/chat")
      .then((res) => res.json())
      .then((data) => setConversations(Array.isArray(data) ? data : []))
      .catch(() => {});

  useEffect(() => {
    loadConversations();
    const id = setInterval(loadConversations, 10000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!activeUserId) return;
    const loadThread = () =>
      fetch(`/api/admin/chat/${activeUserId}`)
        .then((res) => res.json())
        .then((data) => {
          setThread(Array.isArray(data) ? data : []);
          loadConversations(); // refresh unread badges
        })
        .catch(() => {});
    loadThread();
    const id = setInterval(loadThread, 4000);
    return () => clearInterval(id);
  }, [activeUserId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread]);

  const send = async (e) => {
    e.preventDefault();
    if (!text.trim() || !activeUserId) return;
    setSending(true);
    try {
      const res = await fetch(`/api/admin/chat/${activeUserId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const message = await res.json();
      if (res.ok) {
        setThread((prev) => [...prev, message]);
        setText("");
      }
    } finally {
      setSending(false);
    }
  };

  const active = conversations.find((c) => c.userId === activeUserId);

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-2xl text-ink">گفتگوی پشتیبانی</h1>
        <Link href="/admin" className="text-sm text-ink-muted hover:text-gold">بازگشت به پنل مدیریت</Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 h-[32rem]">
        {/* conversation list */}
        <div className="bg-base-panel border border-base-line rounded-sm overflow-y-auto">
          {conversations.length === 0 ? (
            <p className="text-ink-faint text-sm text-center py-10 px-4">هنوز پیامی از مشتریان دریافت نشده است.</p>
          ) : (
            conversations.map((c) => (
              <button
                key={c.userId}
                onClick={() => setActiveUserId(c.userId)}
                className={`w-full text-right px-4 py-3 border-b border-base-line hover:bg-base transition-colors ${
                  activeUserId === c.userId ? "bg-base" : ""
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-ink text-sm font-medium">{c.userName}</span>
                  {c.unreadCount > 0 && (
                    <span className="bg-signal-bad text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center">
                      {c.unreadCount}
                    </span>
                  )}
                </div>
                <p className="text-ink-faint text-xs truncate">{c.lastMessage}</p>
              </button>
            ))
          )}
        </div>

        {/* active thread */}
        <div className="md:col-span-2 bg-base-panel border border-base-line rounded-sm flex flex-col">
          {!activeUserId ? (
            <div className="flex-1 flex items-center justify-center text-ink-faint text-sm">
              یک گفتگو را از فهرست انتخاب کنید
            </div>
          ) : (
            <>
              <div className="px-4 py-3 border-b border-base-line">
                <p className="text-ink text-sm font-medium">{active?.userName}</p>
                <p className="text-ink-faint text-xs font-mono" dir="ltr">{active?.userEmail}</p>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                {thread.map((m) => (
                  <div key={m._id} className={`flex ${m.senderRole === "admin" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[75%] rounded-sm px-3 py-2 text-sm ${
                        m.senderRole === "admin"
                          ? "bg-gold text-base"
                          : "bg-base border border-base-line text-ink"
                      }`}
                    >
                      {m.text}
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              <form onSubmit={send} className="flex gap-2 p-3 border-t border-base-line">
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="پاسخ خود را بنویسید..."
                  disabled={sending}
                  className="flex-1 bg-base border border-base-line rounded-sm px-3 py-2 text-sm text-ink focus:outline-none focus:border-gold"
                />
                <button
                  type="submit"
                  disabled={sending || !text.trim()}
                  className="px-4 rounded-sm bg-gold text-base text-sm font-semibold disabled:opacity-50"
                >
                  ارسال
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
