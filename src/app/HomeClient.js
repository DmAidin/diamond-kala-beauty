"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import ProductCard from "./components/ProductCard";
import Reveal from "./components/Reveal";
import RecentlyViewed from "./components/RecentlyViewed";
import EmptyState from "./components/EmptyState";
import ProductCarousel from "./components/ProductCarousel";
import { CATEGORY_IMAGES } from "./categoryImages";

const faqs = [
  { q: "چگونه سفارش خود را ثبت کنم؟", a: "کالای مورد نظر را به سبد خرید اضافه کرده و در مرحله‌ی تسویه حساب، اطلاعات گیرنده را وارد و پرداخت را از طریق درگاه بانکی تکمیل کنید." },
  { q: "روش‌های پرداخت چیست؟", a: "پرداخت به‌صورت آنلاین و از طریق درگاه بانکی معتبر و رمزنگاری‌شده انجام می‌شود." },
  { q: "زمان ارسال سفارش چقدر است؟", a: "سفارش‌ها معمولاً ۲ تا ۴ روز کاری پس از تایید پرداخت ارسال می‌شوند و کد رهگیری از طریق پنل کاربری در دسترس قرار می‌گیرد." },
  { q: "آیا امکان مرجوعی کالا وجود دارد؟", a: "در صورت عدم مطابقت کالا با سفارش، طبق شرایط مرجوعی امکان بازگرداندن کالا وجود دارد." },
];

export default function HomeClient({ data, initialCategory, initialSearch }) {
  const { products, categories, brands, newest, bestsellers } = data;
  const { data: session } = useSession();

  const [wishlistIds, setWishlistIds] = useState([]);
  const [search, setSearch] = useState(initialSearch || "");
  const [sort, setSort] = useState("newest");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);

  // keep the local search box in sync if the URL's ?q= changes via
  // navigation (e.g. a search submitted from the navbar)
  useEffect(() => setSearch(initialSearch || ""), [initialSearch]);

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
      <section className="border-b border-base-line bg-base-panel">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Text column */}
            <div className="lg:col-span-7 text-center lg:text-right">
              <span className="pill pill-accent mb-6">
                مرجع تخصصی زیبایی و مراقبت اورجینال
              </span>

              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl text-ink leading-[1.3] mb-5">
                زیبایی، مراقبت و اصالت،
                <br />
                با دایمند کالا تجربه کنید
              </h1>

              <p className="text-ink-muted text-base leading-relaxed max-w-xl mx-auto lg:mx-0 mb-8">
                منتخبی از بهترین برندهای مراقبت پوست، مو و آرایشی اورجینال، با مشخصات شفاف، بسته‌بندی ویژه و ارسال سریع برای شما فراهم شده است.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 mb-10">
                <a
                  href="#catalog"
                  className="w-full sm:w-auto px-7 py-3 bg-gold text-base font-bold rounded-sm hover:bg-gold-dim transition-colors text-center"
                >
                  مشاهده ویترین محصولات ←
                </a>
                <Link
                  href="/#catalog-categories"
                  className="w-full sm:w-auto px-7 py-3 bg-base-panel hover:border-gold/50 text-ink font-bold rounded-sm border border-base-line transition-colors text-center"
                >
                  مشاهده دسته‌بندی‌ها
                </Link>
              </div>

              <div className="pt-6 border-t border-base-line grid grid-cols-3 gap-4 max-w-lg mx-auto lg:mx-0">
                <div className="text-center lg:text-right">
                  <p className="text-xl sm:text-2xl font-display text-ink">۱۰۰٪</p>
                  <p className="text-xs text-ink-faint font-medium">تضمین اصالت کالا</p>
                </div>
                <div className="text-center lg:text-right border-x border-base-line px-2">
                  <p className="text-xl sm:text-2xl font-display text-ink">ارسال</p>
                  <p className="text-xs text-ink-faint font-medium">سریع و مطمئن</p>
                </div>
                <div className="text-center lg:text-right">
                  <p className="text-xl sm:text-2xl font-display text-ink">۲۴/۷</p>
                  <p className="text-xs text-ink-faint font-medium">پشتیبانی مستقیم</p>
                </div>
              </div>
            </div>

            {/* Visual column */}
            <div className="lg:col-span-5 relative hidden sm:block">
              <div className="relative mx-auto max-w-sm lg:max-w-none aspect-square border border-base-line rounded-sm overflow-hidden bg-base-raised">
                <Image src="/Gliss.jpg" alt="محصولات دایمند کالا" fill sizes="380px" className="object-contain p-6" />
                <span className="pill absolute top-4 right-4 bg-base-panel">
                  منتخب دایمند کالا
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category grid */}
      {categories.length > 0 && (
        <Reveal id="catalog-categories" className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="section-banner mb-6">دسته‌بندی محصولات</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories.map((c) => {
              const img = CATEGORY_IMAGES[c];
              return (
                <Link key={c} href={`/category/${encodeURIComponent(c)}`} className="category-photo-card block">
                  {img ? (
                    <Image
                      src={img.src}
                      alt={c}
                      width={img.width}
                      height={img.height}
                      sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 18vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="w-10 h-10 rounded-full border border-gold/50 flex items-center justify-center text-gold font-display">
                        {c.charAt(0)}
                      </span>
                    </div>
                  )}
                  <span className="cat-label">{c}</span>
                </Link>
              );
            })}
          </div>
        </Reveal>
      )}

      <ProductCarousel title="پرفروش‌ترین‌ها" products={bestsellers} loading={false} wishlistIds={wishlistIds} />
      <ProductCarousel title="تازه‌ترین محصولات" products={newest} loading={false} seeAllHref="/#catalog" wishlistIds={wishlistIds} />

      {/* Catalog + filters */}
      <section id="catalog" className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="section-banner flex-1">
            {initialCategory || (search ? `نتایج جستجو برای «${search}»` : "همه محصولات")}
          </div>
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
          <aside className="pastel-card lg:col-span-1 space-y-6 h-fit bg-base-panel p-5">
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
            {visible.length === 0 ? (
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
          <h2 className="font-display text-xl text-ink mb-3">از تخفیف‌ها و محصولات جدید باخبر شوید</h2>
          <p className="text-ink-muted text-sm mb-6">ایمیل خود را وارد کنید تا اخبار فروشگاه را از دست ندهید.</p>
          <NewsletterForm />
        </div>
      </Reveal>

      {/* FAQ */}
      <Reveal className="max-w-3xl mx-auto px-4 sm:px-6 py-20">
        <div className="section-banner mb-6">سوالات متداول</div>
        <div>
          {faqs.map((f, i) => (
            <details key={i} className="faq-row group">
              <summary className="cursor-pointer text-ink font-medium list-none flex justify-between items-center">
                {f.q}
                <span className="text-gold group-open:rotate-45 transition-transform">+</span>
              </summary>
              <p className="text-ink-muted text-sm mt-3 leading-6">{f.a}</p>
            </details>
          ))}
        </div>
      </Reveal>

      {/* Trust badges */}
      <Reveal className="max-w-7xl mx-auto px-4 sm:px-6 pb-20 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <TrustBadge title="۱۰۰٪ اورجینال" text="اصالت هر محصول تضمین می‌شود" />
        <TrustBadge title="پرداخت امن" text="درگاه بانکی رمزنگاری‌شده" />
        <TrustBadge title="بسته‌بندی ویژه" text="ارسال ایمن با بسته‌بندی مراقبت‌شده" />
        <TrustBadge title="پشتیبانی مستقیم" text="پاسخ‌گویی به سوالات پیش و پس از خرید" />
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
    <div className="pastel-card border border-base-line p-4 text-center bg-base-panel">
      <p className="text-ink font-display text-sm mb-1">{title}</p>
      <p className="text-ink-faint text-xs">{text}</p>
    </div>
  );
}
