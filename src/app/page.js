"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import ProductCard from "./components/ProductCard";
import Reveal from "./components/Reveal";
import RecentlyViewed from "./components/RecentlyViewed";
import EmptyState from "./components/EmptyState";
import { ProductGridSkeleton } from "./components/Skeleton";
import ProductCarousel from "./components/ProductCarousel";
import { CATEGORY_IMAGES } from "./categoryImages";

const faqs = [
  { q: "چگونه سفارش خود را ثبت کنم؟", a: "کالای مورد نظر را به سبد خرید اضافه کرده و در مرحله‌ی تسویه حساب، اطلاعات گیرنده را وارد و پرداخت را از طریق درگاه بانکی تکمیل کنید." },
  { q: "روش‌های پرداخت چیست؟", a: "پرداخت به‌صورت آنلاین و از طریق درگاه بانکی معتبر و رمزنگاری‌شده انجام می‌شود." },
  { q: "زمان ارسال سفارش چقدر است؟", a: "سفارش‌ها معمولاً ۲ تا ۴ روز کاری پس از تایید پرداخت ارسال می‌شوند و کد رهگیری از طریق پنل کاربری در دسترس قرار می‌گیرد." },
  { q: "آیا امکان مرجوعی کالا وجود دارد؟", a: "در صورت عدم مطابقت کالا با سفارش، طبق شرایط مرجوعی امکان بازگرداندن کالا وجود دارد." },
];

function StoreBody() {
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category");
  const queryParam = searchParams.get("q") || "";
  const { data: session } = useSession();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [wishlistIds, setWishlistIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(queryParam);
  const [sort, setSort] = useState("newest");
  const [bestsellers, setBestsellers] = useState([]);
  const [bestsellersLoading, setBestsellersLoading] = useState(true);
  const [newest, setNewest] = useState([]);
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);

  useEffect(() => setSearch(queryParam), [queryParam]);

  useEffect(() => {
    setLoading(true);
    const qs = activeCategory ? `?category=${encodeURIComponent(activeCategory)}` : "";
    fetch(`/api/products${qs}`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [activeCategory]);

  useEffect(() => {
    fetch("/api/products/bestsellers")
      .then((res) => res.json())
      .then((data) => setBestsellers(Array.isArray(data) ? data : []))
      .finally(() => setBestsellersLoading(false));

    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => setNewest(Array.isArray(data) ? data.slice(0, 10) : []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        setCategories(data.categories || []);
        setBrands(data.brands || []);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!session) {
      setWishlistIds([]);
      return;
    }
    fetch("/api/wishlist")
      .then((res) => res.json())
      .then((data) => setWishlistIds(Array.isArray(data) ? data.map((p) => p._id) : []))
      .catch(() => {});
  }, [session]);

  const visible = products
    .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    .filter((p) => (brandFilter ? p.brand === brandFilter : true))
    .filter((p) => (priceMin ? p.price >= Number(priceMin) : true))
    .filter((p) => (priceMax ? p.price <= Number(priceMax) : true))
    .filter((p) => (inStockOnly ? (p.stock ?? 0) > 0 : true))
    .sort((a, b) => {
      if (sort === "price-asc") return a.price - b.price;
      if (sort === "price-desc") return b.price - a.price;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  const resetFilters = () => {
    setPriceMin("");
    setPriceMax("");
    setBrandFilter("");
    setInStockOnly(false);
  };

  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-base-line bg-gradient-to-b from-gold-soft/15 via-base to-teal/10">
        <div className="absolute inset-0 opacity-[0.16] pointer-events-none">
          <CascadePattern />
        </div>
        <div className="float absolute -top-10 left-[8%] w-56 h-56 rounded-full bg-gold-soft/50 blur-3xl pointer-events-none" />
        <div className="float-delay absolute top-24 right-[10%] w-72 h-72 rounded-full bg-teal/35 blur-3xl pointer-events-none" />
        <div className="float absolute bottom-0 left-[35%] w-48 h-48 rounded-full bg-gold/40 blur-3xl pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-28">
          <p className="font-mono text-gold text-xs tracking-[0.3em] mb-4">DIAMOND KALA / BEAUTY &amp; CARE</p>
          <h1 className="font-display text-4xl sm:text-5xl text-ink max-w-2xl leading-tight mb-6">
            دایمند کالا؛ زیبایی و مراقبت، با اطمینان خرید کنید
          </h1>
          <p className="text-ink-muted max-w-xl leading-7 mb-8">
            دایمند کالا مرجع خرید آنلاین لوازم آرایشی و بهداشتی اورجینال است؛ از مراقبت پوست و مو تا عطر و آرایش، با مشخصات شفاف، بسته‌بندی ویژه و ارسال سریع.
          </p>
          <div className="cascade-line max-w-xs mb-8" />
          <a
            href="#catalog"
            className="inline-block px-7 py-3 rounded-sm bg-gold text-base font-bold hover:bg-gold-soft transition-colors"
          >
            مشاهده محصولات
          </a>
        </div>
      </section>

      {/* Trust badges */}
      <Reveal className="max-w-7xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <TrustBadge title="۱۰۰٪ اورجینال" text="اصالت هر محصول تضمین می‌شود" />
        <TrustBadge title="پرداخت امن" text="درگاه بانکی رمزنگاری‌شده" />
        <TrustBadge title="بسته‌بندی ویژه" text="ارسال ایمن با بسته‌بندی مراقبت‌شده" />
        <TrustBadge title="پشتیبانی مستقیم" text="پاسخ‌گویی به سوالات پیش و پس از خرید" />
      </Reveal>

      {/* Category grid */}
      {categories.length > 0 && (
        <Reveal className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <h2 className="font-display text-2xl text-ink mb-6">دسته‌بندی محصولات</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories.map((c) => {
              const img = CATEGORY_IMAGES[c];
              return (
                <Link key={c} href={`/category/${encodeURIComponent(c)}`} className="group block">
                  {img ? (
                    <div className="relative rounded-2xl overflow-hidden border border-base-line">
                      <Image
                        src={img}
                        alt={c}
                        width={655}
                        height={610}
                        sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 18vw"
                        className="w-full h-auto group-hover:scale-105 transition-transform duration-500"
                      />
                      <span className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-base/95 text-ink text-xs px-3 py-1.5 rounded-full border border-base-line">
                        {c}
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gold">
                          <path d="M15 6l-6 6 6 6" />
                        </svg>
                      </span>
                    </div>
                  ) : (
                    <div className="pastel-card border border-base-line bg-base-panel hover:border-gold/50 p-5 text-center transition-colors">
                      <span className="block w-10 h-10 mx-auto mb-3 rounded-full border border-gold/50 flex items-center justify-center text-gold font-display group-hover:bg-gold/10">
                        {c.charAt(0)}
                      </span>
                      <span className="text-sm text-ink">{c}</span>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </Reveal>
      )}

      <ProductCarousel title="پرفروش‌ترین‌ها" products={bestsellers} loading={bestsellersLoading} wishlistIds={wishlistIds} />
      <ProductCarousel title="تازه‌ترین محصولات" products={newest} loading={false} seeAllHref="/#catalog" wishlistIds={wishlistIds} />

      {/* Catalog + filters */}
      <section id="catalog" className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <h2 className="font-display text-2xl text-ink">
            {activeCategory || (search ? `نتایج جستجو برای «${search}»` : "همه محصولات")}
          </h2>
          <input
            type="text"
            placeholder="جستجوی محصول..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-base-panel border border-base-line rounded-sm px-4 py-2 text-sm text-ink w-full sm:w-64 focus:outline-none focus:border-gold"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Filter sidebar */}
          <aside className="pastel-card lg:col-span-1 space-y-6 h-fit bg-gradient-to-b from-gold-soft/10 via-base-panel to-teal/5 border border-base-line p-5">
            <div>
              <h3 className="text-ink text-sm font-semibold mb-3">مرتب‌سازی</h3>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="w-full bg-base border border-base-line rounded-sm px-3 py-2 text-sm text-ink focus:outline-none focus:border-gold"
              >
                <option value="newest">جدیدترین</option>
                <option value="price-asc">ارزان‌ترین</option>
                <option value="price-desc">گران‌ترین</option>
              </select>
            </div>

            <div>
              <h3 className="text-ink text-sm font-semibold mb-3">بازه قیمت (تومان)</h3>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="از"
                  value={priceMin}
                  onChange={(e) => setPriceMin(e.target.value)}
                  className="w-1/2 bg-base border border-base-line rounded-sm px-3 py-2 text-sm text-ink focus:outline-none focus:border-gold"
                />
                <input
                  type="number"
                  placeholder="تا"
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                  className="w-1/2 bg-base border border-base-line rounded-sm px-3 py-2 text-sm text-ink focus:outline-none focus:border-gold"
                />
              </div>
            </div>

            {brands.length > 0 && (
              <div>
                <h3 className="text-ink text-sm font-semibold mb-3">برند</h3>
                <select
                  value={brandFilter}
                  onChange={(e) => setBrandFilter(e.target.value)}
                  className="w-full bg-base border border-base-line rounded-sm px-3 py-2 text-sm text-ink focus:outline-none focus:border-gold"
                >
                  <option value="">همه برندها</option>
                  {brands.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
            )}

            <label className="flex items-center gap-2 text-sm text-ink-muted cursor-pointer">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="accent-gold"
              />
              فقط کالاهای موجود
            </label>

            <button
              onClick={resetFilters}
              className="w-full text-xs text-ink-faint hover:text-gold underline underline-offset-2"
            >
              پاک‌کردن فیلترها
            </button>
          </aside>

          {/* Grid */}
          <div className="lg:col-span-4">
            {loading ? (
              <ProductGridSkeleton count={8} />
            ) : visible.length === 0 ? (
              <EmptyState
                icon="search"
                title="محصولی یافت نشد"
                text="فیلترها یا عبارت جستجو را تغییر دهید و دوباره امتحان کنید."
              />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-5">
                {visible.map((product) => (
                  <ProductCard key={product._id || product.id} product={product} wishlistIds={wishlistIds} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <RecentlyViewed />

      {/* Newsletter */}
      <Reveal className="border-y border-base-line bg-base-panel">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14 text-center">
          <h2 className="font-display text-2xl text-ink mb-3">از تخفیف‌ها و محصولات جدید باخبر شوید</h2>
          <p className="text-ink-muted text-sm mb-6">ایمیل خود را وارد کنید تا اخبار فروشگاه را از دست ندهید.</p>
          <NewsletterForm />
        </div>
      </Reveal>

      {/* FAQ */}
      <Reveal className="max-w-3xl mx-auto px-4 sm:px-6 py-20">
        <h2 className="font-display text-2xl text-ink mb-6">سوالات متداول</h2>
        <div className="space-y-3">
          {faqs.map((f, i) => (
            <details key={i} className="bg-base-panel border border-base-line rounded-sm p-4 group">
              <summary className="cursor-pointer text-ink font-medium list-none flex justify-between items-center">
                {f.q}
                <span className="text-gold group-open:rotate-45 transition-transform">+</span>
              </summary>
              <p className="text-ink-muted text-sm mt-3 leading-6">{f.a}</p>
            </details>
          ))}
        </div>
      </Reveal>
    </main>
  );
}

function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");

  const submit = async (e) => {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error();
      setStatus("sent");
      setEmail("");
    } catch {
      setStatus("error");
    }
  };

  if (status === "sent") {
    return <p className="text-signal-ok text-sm">عضویت شما با موفقیت ثبت شد.</p>;
  }

  return (
    <form onSubmit={submit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="ایمیل شما"
        dir="ltr"
        className="flex-1 bg-base border border-base-line rounded-sm px-4 py-3 text-sm text-ink focus:outline-none focus:border-gold"
      />
      <button
        type="submit"
        disabled={status === "sending"}
        className="px-6 py-3 rounded-sm bg-gold text-base text-sm font-bold hover:bg-gold-soft transition-colors disabled:opacity-50"
      >
        {status === "sending" ? "..." : "عضویت"}
      </button>
    </form>
  );
}

function TrustBadge({ title, text }) {
  return (
    <div className="pastel-card border border-base-line p-4 text-center bg-gradient-to-br from-gold-soft/20 via-base-panel to-teal/10">
      <p className="text-gold font-display text-sm mb-1">{title}</p>
      <p className="text-ink-faint text-xs">{text}</p>
    </div>
  );
}

function CascadePattern() {
  // soft, repeating scallops — an "opal seashell cascade" rendered as a
  // quiet background texture rather than a literal illustration
  return (
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="cascade" width="80" height="40" patternUnits="userSpaceOnUse">
          <path d="M0 20 Q20 0 40 20 T80 20" fill="none" stroke="#C592A8" strokeWidth="1.2" />
          <path d="M0 32 Q20 12 40 32 T80 32" fill="none" stroke="#3EBCB3" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#cascade)" />
    </svg>
  );
}

export default function Home() {
  return (
    <Suspense fallback={null}>
      <StoreBody />
    </Suspense>
  );
}
