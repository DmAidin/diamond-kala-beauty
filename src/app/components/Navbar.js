"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useSelector } from "react-redux";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const { data: session, status } = useSession();
  const totalQuantity = useSelector((state) => state.cart.totalQuantity);
  const [menuOpen, setMenuOpen] = useState(false);
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
    setMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-base/95 backdrop-blur border-b border-base-line">
      <div className="trace-line" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-4 h-16">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="w-8 h-8 rounded-full border border-gold/60 flex items-center justify-center text-gold font-mono text-sm">
              DK
            </span>
            <span className="font-display text-lg tracking-wide text-ink hidden sm:inline">
              دایموند کالا
            </span>
          </Link>

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
              className="relative w-10 h-10 flex items-center justify-center rounded-sm border border-base-line text-ink hover:border-gold hover:text-gold transition-colors"
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
              <div className="hidden sm:flex items-center gap-3">
                {session.user.role === "admin" && (
                  <Link
                    href="/admin"
                    className="text-xs px-3 py-2 rounded-sm border border-gold/50 text-gold hover:bg-gold/10 transition-colors"
                  >
                    پنل مدیریت
                  </Link>
                )}
                <Link
                  href="/dashboard"
                  className="text-sm text-ink hover:text-gold transition-colors"
                >
                  {session.user.name || session.user.email}
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="text-xs px-3 py-2 rounded-sm border border-base-line text-ink-muted hover:border-signal-bad hover:text-signal-bad transition-colors"
                >
                  خروج
                </button>
              </div>
            ) : status === "unauthenticated" ? (
              <div className="hidden sm:flex items-center gap-2">
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
              <div className="hidden sm:block w-24 h-8 rounded-sm bg-base-raised animate-pulse" />
            )}

            <button
              className="lg:hidden w-10 h-10 flex items-center justify-center text-ink"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="منو"
            >
              <MenuGlyph open={menuOpen} />
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="lg:hidden pb-4 fade-up">
            <form onSubmit={handleSearch} className="mb-4">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="جستجو در فروشگاه..."
                className="w-full bg-base-panel border border-base-line rounded-sm px-4 py-2 text-sm text-ink focus:outline-none focus:border-gold"
              />
            </form>

            <div className="grid grid-cols-2 gap-2 mb-4">
              {categories.map((c) => (
                <Link
                  key={c}
                  href={`/?category=${encodeURIComponent(c)}`}
                  onClick={() => setMenuOpen(false)}
                  className="text-sm text-ink-muted border border-base-line rounded-sm px-3 py-2 hover:border-gold hover:text-gold transition-colors"
                >
                  {c}
                </Link>
              ))}
            </div>
            {status === "authenticated" ? (
              <div className="flex flex-col gap-2">
                <Link href="/dashboard" className="text-sm text-ink">
                  {session.user.name || session.user.email}
                </Link>
                {session.user.role === "admin" && (
                  <Link href="/admin" className="text-sm text-gold">
                    پنل مدیریت
                  </Link>
                )}
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="text-sm text-signal-bad text-right"
                >
                  خروج
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link
                  href="/auth/login"
                  className="flex-1 text-center text-sm px-4 py-2 rounded-sm border border-gold/60 text-gold"
                >
                  ورود
                </Link>
                <Link
                  href="/auth/register"
                  className="flex-1 text-center text-sm px-4 py-2 rounded-sm bg-gold text-base font-semibold"
                >
                  ثبت‌نام
                </Link>
              </div>
            )}
          </div>
        )}
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

function MenuGlyph({ open }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
    </svg>
  );
}
