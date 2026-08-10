"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function ChatWidget() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [online, setOnline] = useState(false);
  const [hasUnseen, setHasUnseen] = useState(false);
  const bottomRef = useRef(null);
  const knownCount = useRef(0);

  // support online/offline indicator, checked regardless of open state
  useEffect(() => {
    const check = () =>
      fetch("/api/chat/support-status")
        .then((res) => res.json())
        .then((data) => setOnline(data.online))
        .catch(() => {});
    check();
    const id = setInterval(check, 30000);
    return () => clearInterval(id);
  }, []);

  // poll the conversation while logged in; faster while the panel is open
  useEffect(() => {
    if (!session) return;
    const fetchMessages = () =>
      fetch("/api/chat")
        .then((res) => res.json())
        .then((data) => {
          if (!Array.isArray(data)) return;
          if (!open && data.length > knownCount.current) setHasUnseen(true);
          knownCount.current = data.length;
          setMessages(data);
        })
        .catch(() => {});
    fetchMessages();
    const id = setInterval(fetchMessages, open ? 4000 : 15000);
    return () => clearInterval(id);
  }, [session, open]);

  useEffect(() => {
    if (open) {
      setHasUnseen(false);
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [open, messages]);

  const send = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const message = await res.json();
      if (res.ok) {
        setMessages((prev) => [...prev, message]);
        setText("");
      }
    } finally {
      setSending(false);
    }
  };

  if (status === "loading") return null;

  return (
    <div className="fixed bottom-24 lg:bottom-5 left-5 z-40">
      {open && (
        <div className="mb-3 w-80 max-w-[calc(100vw-2.5rem)] bg-base-panel border border-base-line rounded-sm shadow-xl flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-base-line">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${online ? "bg-signal-ok" : "bg-ink-faint"}`} />
              <span className="text-sm text-ink font-medium">پشتیبانی دایمند کالا</span>
            </div>
            <button onClick={() => setOpen(false)} className="text-ink-faint hover:text-gold">✕</button>
          </div>

          {!session ? (
            <div className="p-5 text-center text-sm text-ink-muted">
              برای گفتگو با پشتیبانی ابتدا{" "}
              <Link href="/auth/login" className="text-gold underline">وارد شوید</Link>.
            </div>
          ) : (
            <>
              <div className="flex-1 max-h-80 overflow-y-auto px-4 py-3 space-y-3">
                {messages.length === 0 && (
                  <p className="text-ink-faint text-xs text-center py-6">
                    پیامی ندارید. سوال یا مشکل خود را بنویسید.
                  </p>
                )}
                {messages.map((m) => (
                  <div key={m._id} className={`flex ${m.senderRole === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[75%] rounded-sm px-3 py-2 text-sm ${
                        m.senderRole === "user"
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
                  placeholder="پیام خود را بنویسید..."
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
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="گفتگو با پشتیبانی"
        className="relative w-14 h-14 rounded-full bg-gold text-base shadow-lg flex items-center justify-center hover:bg-gold-soft transition-colors"
      >
        <ChatGlyph />
        {hasUnseen && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-signal-bad rounded-full border-2 border-base" />
        )}
      </button>
    </div>
  );
}

function ChatGlyph() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}
