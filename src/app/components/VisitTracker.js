"use client";

import { useEffect } from "react";

const SESSION_FLAG = "dk-visit-counted";

// Fires once per browser session (sessionStorage, cleared when the tab/
// browser closes), not on every page navigation — so the admin's "daily
// visits" number reflects visits, not page views.
export default function VisitTracker() {
  useEffect(() => {
    try {
      if (window.sessionStorage.getItem(SESSION_FLAG)) return;
      window.sessionStorage.setItem(SESSION_FLAG, "1");
      fetch("/api/analytics/track", { method: "POST" }).catch(() => {});
    } catch {
      // sessionStorage may be unavailable (private mode) — safe to skip
    }
  }, []);

  return null;
}
