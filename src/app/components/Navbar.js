"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useSelector } from "react-redux";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const { data: session, status } = useSession();
  const totalQuantity = useSelector((state) => state.cart.totalQuantity);
  const [categories, setCategories] = useState([]);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchBoxRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || []))
      .catch(() => {});
  }, []);

  // live search suggestions, debounced
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }
    const id = setTimeout(() => {
      fetch(`/api/products?q=${encodeURIComponent(query.trim())}`)
        .then((res) => res.json())
        .then((data) => setSuggestions(Array.isArray(data) ? data.slice(0, 5) : []))
        .catch(() => {});
    }, 250);
    return () => clearTimeout(id);
  }, [query]);

  // close suggestion dropdown on outside click
  useEffect(() => {
    const onClick = (e) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setShowSuggestions(false);
    router.push(query.trim() ? `/?q=${encodeURIComponent(query.trim())}` : "/");
  };

  return (
    <header className="relative md:sticky md:top-0 z-40 bg-base/95 backdrop-blur border-b border-base-line">
      <div className="trace-line" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-6 lg:gap-10 h-28 lg:h-36">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="relative w-24 h-24 lg:w-32 lg:h-32">
              <Image src="/logo.png" alt="دایمند کالا" fill sizes="128px" className="object-contain" priority />
            </div>
            <span className="font-display text-lg tracking-wide text-ink hidden sm:inline">
              دایمند کالا
            </span>
          </Link>

          {/* search + category nav + login state: desktop/tablet only —
              on phones this all moves to the bottom tab bar instead */}
          <div ref={searchBoxRef} className="relative hidden md:block flex-1 max-w-md">
            <form onSubmit={handleSearch} className="flex">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                placeholder="جستجو در میان محصولات فروشگاه..."
                className="w-full bg-base-panel border border-base-line rounded-sm px-4 py-2 text-sm text-ink focus:outline-none focus:border-gold"
              />
            </form>

            {showSuggestions && suggestions.length > 0 && (
              <div className="pastel-card absolute top-full mt-2 w-full bg-base-panel border border-base-line shadow-lg overflow-hidden z-50">
                {suggestions.map((p) => (
                  <Link
                    key={p._id}
                    href={`/product/${p._id}`}
                    onClick={() => setShowSuggestions(false)}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-gold-soft/10 transition-colors"
                  >
                    <div className="relative w-10 h-10 shrink-0 bg-base rounded-sm overflow-hidden">
                      {(p.images?.[0] || p.image) && (
                        <Image src={p.images?.[0] || p.image} alt={p.name} fill sizes="40px" className="object-contain" />
                      )}
                    </div>
                    <span className="text-sm text-ink flex-1 truncate">{p.name}</span>
                    <span className="text-xs text-gold font-mono shrink-0">{p.price.toLocaleString()}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <nav className="hidden lg:flex items-center gap-6 font-body text-sm text-ink-muted mr-auto">
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

          <div className="flex items-center gap-4 mr-auto lg:mr-0">
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
              <div className="hidden lg:flex items-center gap-4">
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

        {/* Mobile-only sub-header: the top row above is compact (logo +
            theme toggle) so this fills the rest with search, auth state,
            and a horizontal category strip — nothing here duplicates the
            bottom tab bar's job. */}
        <div className="md:hidden pb-3 space-y-3">
          <form onSubmit={handleSearch}>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="جستجو در میان محصولات فروشگاه..."
              className="w-full bg-base-panel border border-base-line rounded-sm px-4 py-2.5 text-sm text-ink focus:outline-none focus:border-gold"
            />
          </form>

          {status === "authenticated" ? (
            <Link href="/dashboard" className="flex items-center gap-2 text-sm text-ink">
              <span className="w-8 h-8 rounded-full bg-gold-soft/30 border border-gold/40 text-gold flex items-center justify-center font-display text-sm shrink-0">
                {(session.user.name || session.user.email || "؟").charAt(0)}
              </span>
              سلام، {session.user.name || session.user.email}
            </Link>
          ) : status === "unauthenticated" ? (
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
          ) : (
            <div className="h-9 rounded-sm bg-base-raised animate-pulse" />
          )}

          {categories.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
              {categories.map((c) => (
                <Link
                  key={c}
                  href={`/?category=${encodeURIComponent(c)}`}
                  className="shrink-0 flex flex-col items-center gap-1.5 w-16"
                >
                  <span className="w-12 h-12 rounded-full bg-gradient-to-br from-gold-soft/30 to-teal/20 border border-base-line flex items-center justify-center text-gold font-display text-sm">
                    {c.charAt(0)}
                  </span>
                  <span className="text-[10px] text-ink-muted text-center leading-tight line-clamp-2">{c}</span>
                </Link>
              ))}
            </div>
          )}
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
