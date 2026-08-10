"use client";

import { createContext, useCallback, useContext, useState } from "react";

const ToastContext = createContext(null);

let idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = "success") => {
    const id = ++idCounter;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2800);
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div className="fixed top-20 lg:top-6 inset-x-0 z-[70] flex flex-col items-center gap-2 pointer-events-none px-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`fade-up pointer-events-auto max-w-sm w-full sm:w-auto flex items-center gap-2 px-4 py-3 rounded-sm shadow-lg text-sm border ${
              t.type === "error"
                ? "bg-base-panel border-signal-bad text-signal-bad"
                : "bg-base-panel border-gold text-ink"
            }`}
          >
            {t.type === "error" ? (
              <span className="text-signal-bad">✕</span>
            ) : (
              <span className="text-gold">✓</span>
            )}
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// usage: const showToast = useToast(); showToast("به سبد اضافه شد");
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
