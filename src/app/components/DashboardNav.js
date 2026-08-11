"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const items = [
  { href: "/dashboard", label: "داشبورد", icon: HomeIcon },
  { href: "/dashboard/orders", label: "سفارش‌ها", icon: BoxIcon },
  { href: "/dashboard/wishlist", label: "علاقه‌مندی‌ها", icon: HeartIcon },
  { href: "/dashboard/profile", label: "پروفایل", icon: UserIcon },
];

// Mobile gets big, unmistakably-tappable square tiles (icon + label) —
// the old small pill row was too easy to miss. Desktop keeps the compact
// vertical list, which already works fine at that size.
export default function DashboardNav({ isAdmin }) {
  const pathname = usePathname();
  const isActive = (href) => (href === "/dashboard" ? pathname === href : pathname.startsWith(href));

  const allItems = [
    ...items,
    ...(isAdmin ? [{ href: "/admin", label: "پنل مدیریت", icon: ShieldIcon, accent: true }] : []),
  ];

  return (
    <nav>
      {/* Mobile: big square tiles */}
      <div className="grid grid-cols-3 gap-3 sm:hidden mb-3">
        {allItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`aspect-square rounded-2xl border flex flex-col items-center justify-center gap-2 transition-colors ${
              isActive(item.href)
                ? "border-gold bg-gold/10 text-gold"
                : item.accent
                ? "border-gold/50 text-gold bg-gold-soft/10"
                : "border-base-line text-ink-muted bg-base-panel"
            }`}
          >
            <item.icon />
            <span className="text-xs">{item.label}</span>
          </Link>
        ))}
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="aspect-square rounded-2xl border border-signal-bad/40 text-signal-bad bg-base-panel flex flex-col items-center justify-center gap-2"
        >
          <LogoutIcon />
          <span className="text-xs">خروج</span>
        </button>
      </div>

      {/* Desktop: compact vertical list */}
      <div className="hidden sm:flex sm:flex-col gap-2 text-sm">
        {allItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`px-4 py-2 rounded-sm border transition-colors ${
              isActive(item.href)
                ? "border-gold bg-base-panel text-gold"
                : item.accent
                ? "border-gold/50 text-gold hover:bg-gold/10"
                : "border-base-line text-ink-muted hover:border-gold/50"
            }`}
          >
            {item.label}
          </Link>
        ))}
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="px-4 py-2 rounded-sm border border-base-line text-signal-bad hover:border-signal-bad transition-colors text-right"
        >
          خروج از حساب
        </button>
      </div>
    </nav>
  );
}

function HomeIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M3 11.5 12 4l9 7.5" /><path d="M5.5 10v9.5h13V10" />
    </svg>
  );
}
function BoxIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M3.5 8 12 3.5 20.5 8 12 12.5 3.5 8Z" /><path d="M3.5 8v8L12 20.5 20.5 16V8" /><path d="M12 12.5V20.5" />
    </svg>
  );
}
function HeartIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M12 21s-7.5-4.7-10-9.3C.3 7.9 2.4 4 6.2 4c2 0 3.6 1.1 4.8 2.8C12.2 5.1 13.8 4 15.8 4c3.8 0 5.9 3.9 4.2 7.7C19.5 16.3 12 21 12 21Z" />
    </svg>
  );
}
function UserIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <circle cx="12" cy="8" r="3.7" /><path d="M4.5 20c1.5-4 4.2-6 7.5-6s6 2 7.5 6" />
    </svg>
  );
}
function ShieldIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3Z" />
    </svg>
  );
}
function LogoutIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5" /><path d="M21 12H9" />
    </svg>
  );
}
