"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useSelector } from "react-redux";

// Phone-only bottom navigation, replacing the top menu on small screens —
// a deliberately different, native-app-style layout for mobile visitors
// instead of a shrunk-down desktop menu.
export default function MobileTabBar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const totalQuantity = useSelector((state) => state.cart.totalQuantity);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  const accountHref = session ? "/dashboard" : "/auth/login";
  const isActive = (href) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  const submitSearch = (e) => {
    e.preventDefault();
    setSearchOpen(false);
    router.push(query.trim() ? `/?q=${encodeURIComponent(query.trim())}` : "/");
  };

  const tabs = [
    { href: "/", label: "خانه", icon: HomeIcon },
    { href: "/#catalog", label: "دسته‌ها", icon: GridIcon },
    { href: null, label: "جستجو", icon: SearchIcon, onClick: () => setSearchOpen(true) },
    { href: "/cart", label: "سبد خرید", icon: CartIcon, badge: totalQuantity },
    { href: accountHref, label: "حساب من", icon: UserIcon },
  ];

  return (
    <>
      {searchOpen && (
        <div className="lg:hidden fixed inset-0 z-[60] bg-base/98 backdrop-blur px-5 pt-6">
          <form onSubmit={submitSearch} className="flex items-center gap-3">
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="جستجو در فروشگاه..."
              className="flex-1 bg-base-panel border border-base-line rounded-sm px-4 py-3 text-sm text-ink focus:outline-none focus:border-gold"
            />
            <button
              type="button"
              onClick={() => setSearchOpen(false)}
              className="w-11 h-11 flex items-center justify-center rounded-full border border-base-line text-ink"
              aria-label="بستن جستجو"
            >
              ✕
            </button>
          </form>
        </div>
      )}

      <nav
        className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-base-panel border-t border-base-line flex"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {tabs.map((tab) => {
          const active = tab.href && tab.href !== "/#catalog" ? isActive(tab.href) : false;
          const content = (
            <>
              <span className="relative">
                <tab.icon active={active} />
                {tab.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-gold text-base text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {tab.badge}
                  </span>
                )}
              </span>
              <span className={`text-[10px] mt-1 ${active ? "text-gold" : "text-ink-faint"}`}>{tab.label}</span>
            </>
          );

          if (tab.onClick) {
            return (
              <button
                key={tab.label}
                onClick={tab.onClick}
                className="flex-1 flex flex-col items-center justify-center py-2.5"
              >
                {content}
              </button>
            );
          }

          return (
            <Link
              key={tab.label}
              href={tab.href}
              className="flex-1 flex flex-col items-center justify-center py-2.5"
            >
              {content}
            </Link>
          );
        })}
      </nav>
    </>
  );
}

function iconProps(active) {
  return {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: active ? 2.1 : 1.7,
    className: active ? "text-gold" : "text-ink-muted",
  };
}

function HomeIcon({ active }) {
  return (
    <svg {...iconProps(active)}>
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5.5 10v9.5h13V10" />
    </svg>
  );
}
function GridIcon({ active }) {
  return (
    <svg {...iconProps(active)}>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.2" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.2" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.2" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.2" />
    </svg>
  );
}
function SearchIcon({ active }) {
  return (
    <svg {...iconProps(active)}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M20 20l-4.3-4.3" />
    </svg>
  );
}
function CartIcon({ active }) {
  return (
    <svg {...iconProps(active)}>
      <circle cx="9" cy="21" r="1" />
      <circle cx="18" cy="21" r="1" />
      <path d="M2.5 3h2l2.4 12.2a2 2 0 0 0 2 1.6h7.6a2 2 0 0 0 2-1.6L21 7H6" />
    </svg>
  );
}
function UserIcon({ active }) {
  return (
    <svg {...iconProps(active)}>
      <circle cx="12" cy="8" r="3.7" />
      <path d="M4.5 20c1.5-4 4.2-6 7.5-6s6 2 7.5 6" />
    </svg>
  );
}
