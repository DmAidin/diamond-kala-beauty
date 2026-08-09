"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useSelector } from "react-redux";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const { data: session, status } = useSession();
  const totalQuantity = useSelector((state) => state.cart.totalQuantity);
  const [categories, setCategories] = useState([]);
  const [query, setQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || []))
      .catch(() => {});
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    router.push(query.trim() ? `/?q=${encodeURIComponent(query.trim())}` : "/");
  };

  return (
    <header className="sticky top-0 z-40 bg-base/95 backdrop-blur border-b border-base-line">
      <div className="trace-line" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-4 h-28 lg:h-36">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <img src="/logo.png" alt="دایموند کالا" className="w-24 h-24 lg:w-32 lg:h-32 object-contain" />
            <span className="font-display text-lg tracking-wide text-ink hidden sm:inline">
              دایموند کالا
            </span>
          </Link>

          {/* search + category nav + login state: desktop/tablet only —
              on phones this all moves to the bottom tab bar instead */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="جستجو در میان محصولات فروشگاه..."
              className="w-full bg-base-panel border border-base-line rounded-sm px-4 py-2 text-sm text-ink focus:outline-none focus:border-gold"
            />
          </form>

          <nav className="hidden lg:flex items-center gap-5 font-body text-sm text-ink-muted mr-auto">
            {categories.slice(0, 5).map((c) => (
              <Link
                key={c}
                href={`/?category=${encodeURIComponent(c)}`}
                className="hover:text-gold transition-colors whitespace-nowrap"
              >
                {c}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3 mr-auto lg:mr-0">
            <ThemeToggle />

            <Link
              href="/cart"
              className="relative hidden lg:flex w-10 h-10 items-center justify-center rounded-sm border border-base-line text-ink hover:border-gold hover:text-gold transition-colors"
              aria-label="سبد خرید"
            >
              <CartGlyph />
              {totalQuantity > 0 && (
                <span className="absolute -top-2 -right-2 bg-gold text-base text-[11px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {totalQuantity}
                </span>
              )}
            </Link>

            {status === "authenticated" ? (
              <div className="hidden lg:flex items-center gap-3">
                {session.user.role === "admin" && (
                  <Link
                    href="/admin"
                    className="text-xs px-3 py-2 rounded-sm border border-gold/50 text-gold hover:bg-gold/10 transition-colors"
                  >
                    پنل مدیریت
                  </Link>
                )}
                <Link href="/dashboard" className="text-sm text-ink hover:text-gold transition-colors">
                  {session.user.name || session.user.email}
                </Link>
              </div>
            ) : status === "unauthenticated" ? (
              <div className="hidden lg:flex items-center gap-2">
                <Link
                  href="/auth/login"
                  className="text-sm px-4 py-2 rounded-sm border border-gold/60 text-gold hover:bg-gold/10 transition-colors"
                >
                  ورود
                </Link>
                <Link
                  href="/auth/register"
                  className="text-sm px-4 py-2 rounded-sm bg-gold text-base font-semibold hover:bg-gold-soft transition-colors"
                >
                  ثبت‌نام
                </Link>
              </div>
            ) : (
              <div className="hidden lg:block w-24 h-8 rounded-sm bg-base-raised animate-pulse" />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

function CartGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <circle cx="9" cy="21" r="1" />
      <circle cx="18" cy="21" r="1" />
      <path d="M2.5 3h2l2.4 12.2a2 2 0 0 0 2 1.6h7.6a2 2 0 0 0 2-1.6L21 7H6" />
    </svg>
  );
}
