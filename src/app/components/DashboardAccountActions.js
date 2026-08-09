"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";

// The old logout button and admin-panel link only lived in the desktop
// navbar, so mobile visitors (who now get the bottom tab bar instead)
// had no way to reach either. This renders inside the dashboard sidebar,
// which is visible on every screen size.
export default function DashboardAccountActions({ isAdmin }) {
  return (
    <>
      {isAdmin && (
        <Link
          href="/admin"
          className="px-4 py-2 rounded-sm border border-gold/50 text-gold hover:bg-gold/10 transition-colors"
        >
          پنل مدیریت
        </Link>
      )}
      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="px-4 py-2 rounded-sm border border-base-line text-signal-bad hover:border-signal-bad transition-colors text-right"
      >
        خروج از حساب
      </button>
    </>
  );
}
