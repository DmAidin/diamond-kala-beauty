"use client";

import { useEffect, useState, use as usePromise } from "react";
import { useDispatch } from "react-redux";
import { addToCart } from "@/redux/cartSlice";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import RecentlyViewed, { trackProductView } from "@/app/components/RecentlyViewed";
import ProductCard from "@/app/components/ProductCard";
import { useToast } from "@/app/components/Toast";

export default function ProductDetailPage({ params }) {
  const { id } = usePromise(params);
  const { data: session } = useSession();
  const showToast = useToast();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wished, setWished] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [qty, setQty] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [average, setAverage] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [myRating, setMyRating] = useState(0);
  const [myText, setMyText] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [related, setRelated] = useState([]);
  const dispatch = useDispatch();

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("محصول یافت نشد");
        return res.json();
      })
      .then((data) => {
        setProduct(data);
        trackProductView(data);
        fetch(`/api/products?category=${encodeURIComponent(data.category)}`)
          .then((res) => res.json())
          .then((list) => setRelated(Array.isArray(list) ? list.filter((p) => p._id !== id).slice(0, 4) : []))
          .catch(() => {});
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));

    fetch(`/api/reviews?productId=${id}`)
      .then((res) => res.json())
      .then((data) => {
        setReviews(data.reviews || []);
        setAverage(data.average || 0);
        setReviewCount(data.count || 0);
      })
      .catch(() => {});
  }, [id]);

  useEffect(() => {
    if (!session) return;
    fetch("/api/wishlist")
      .then((res) => res.json())
      .then((products) => {
        if (Array.isArray(products)) setWished(products.some((p) => p._id === id));
      })
      .catch(() => {});
  }, [session, id]);

  const handleAdd = () => {
    dispatch(addToCart({ ...product, quantity: qty }));
    showToast(`${product.name} به سبد خرید اضافه شد`);
    setQty(1);
  };

  const toggleWishlist = async () => {
    if (!session) return;
    const res = await fetch("/api/wishlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: id }),
    });
    const data = await res.json();
    setWished(data.added);
    showToast(data.added ? "به علاقه‌مندی‌ها اضافه شد" : "از علاقه‌مندی‌ها حذف شد");
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!myRating) return;
    setSubmittingReview(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: id, rating: myRating, text: myText }),
      });
      if (res.ok) {
        const refreshed = await fetch(`/api/reviews?productId=${id}`).then((r) => r.json());
        setReviews(refreshed.reviews || []);
        setAverage(refreshed.average || 0);
        setReviewCount(refreshed.count || 0);
        setMyText("");
        showToast("نظر شما ثبت شد");
      }
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12 animate-pulse">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="h-96 rounded-sm bg-base-panel" />
          <div className="space-y-4">
            <div className="h-6 w-2/3 rounded bg-base-panel" />
            <div className="h-4 w-1/3 rounded bg-base-panel" />
            <div className="h-20 rounded bg-base-panel" />
            <div className="h-10 w-1/2 rounded bg-base-panel" />
          </div>
        </div>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="max-w-6xl mx-auto px-4 py-24 text-center">
        <p className="text-signal-bad mb-6">{error || "محصول یافت نشد"}</p>
        <Link href="/" className="text-gold underline">بازگشت به فروشگاه</Link>
      </main>
    );
  }

  const specs = product.specs ? Object.entries(product.specs) : [];
  const inStock = (product.stock ?? 0) > 0;
  const gallery = product.images && product.images.length > 0 ? product.images : [product.image].filter(Boolean);
  const currentImage = gallery[activeImage] || gallery[0];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: gallery[0],
    brand: product.brand || undefined,
    offers: {
      "@type": "Offer",
      priceCurrency: "IRR",
      price: product.price * 10,
      availability: inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
    ...(reviewCount > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: average.toFixed(1),
        reviewCount,
      },
    }),
  };

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {zoomOpen && currentImage && (
        <div
          onClick={() => setZoomOpen(false)}
          className="fixed inset-0 z-[80] bg-black/85 flex items-center justify-center p-6 cursor-zoom-out"
        >
          <div className="relative w-full max-w-2xl h-full max-h-[85vh]">
            <Image src={currentImage} alt={product.name} fill sizes="90vw" className="object-contain" />
          </div>
          <button
            onClick={() => setZoomOpen(false)}
            className="absolute top-6 left-6 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center"
            aria-label="بستن"
          >
            ✕
          </button>
        </div>
      )}

      <nav className="text-xs text-ink-faint mb-8 font-mono">
        <Link href="/" className="hover:text-gold">فروشگاه</Link>
        <span className="mx-2">/</span>
        <Link href={`/?category=${encodeURIComponent(product.category)}`} className="hover:text-gold">
          {product.category}
        </Link>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <button
            onClick={() => setZoomOpen(true)}
            className="pastel-card opal-shimmer relative w-full aspect-square bg-gradient-to-br from-gold-soft/15 via-base-panel to-teal/10 border border-base-line cursor-zoom-in block"
            aria-label="بزرگ‌نمایی تصویر"
          >
            {currentImage && (
              <Image src={currentImage} alt={product.name} fill sizes="(max-width: 1024px) 90vw, 45vw" className="object-contain p-8" />
            )}
            {session && (
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleWishlist();
                }}
                aria-label="افزودن به علاقه‌مندی‌ها"
                className="absolute top-4 left-4 w-10 h-10 rounded-full bg-base border border-base-line flex items-center justify-center hover:border-gold transition-colors"
              >
                <HeartGlyph filled={wished} />
              </span>
            )}
            <span className="absolute bottom-3 right-3 text-[11px] bg-base/90 border border-base-line rounded-full px-3 py-1 text-ink-muted">
              برای بزرگ‌نمایی کلیک کنید 🔍
            </span>
          </button>

          {gallery.length > 1 && (
            <div className="flex gap-3 mt-4 overflow-x-auto pb-1">
              {gallery.map((src, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`relative shrink-0 w-16 h-16 rounded-sm border p-1 bg-base-panel transition-colors ${
                    idx === activeImage ? "border-gold" : "border-base-line hover:border-gold/50"
                  }`}
                >
                  <Image src={src} alt={`${product.name} ${idx + 1}`} fill sizes="64px" className="object-contain p-1" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          {product.brand && (
            <p className="text-gold font-mono text-xs tracking-widest mb-2">{product.brand.toUpperCase()}</p>
          )}
          <h1 className="font-display text-3xl text-ink mb-3">{product.name}</h1>

          {reviewCount > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <Stars value={average} />
              <span className="text-ink-muted text-sm">
                {average.toFixed(1)} از ۵ ({reviewCount} نظر)
              </span>
            </div>
          )}

          <p className="text-ink-muted leading-7 mb-6">{product.description}</p>

          <div className="flex items-center gap-4 mb-8">
            <span className="font-mono text-2xl text-gold font-bold">
              {product.price.toLocaleString()} تومان
            </span>
            <span
              className={`text-xs px-3 py-1 rounded-sm border ${
                inStock ? "border-signal-ok text-signal-ok" : "border-signal-bad text-signal-bad"
              }`}
            >
              {inStock ? "موجود در انبار" : "ناموجود"}
            </span>
            {inStock && product.stock <= 5 && (
              <span className="text-xs px-3 py-1 rounded-sm border border-signal-warn text-signal-warn">
                فقط {product.stock} عدد باقی‌مانده
              </span>
            )}
          </div>

          {inStock && (
            <div className="flex items-center gap-3 mb-5">
              <div className="flex items-center border border-base-line rounded-sm">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="w-10 h-10 text-ink-muted hover:text-gold" aria-label="کم کردن تعداد">−</button>
                <span className="w-8 text-center font-mono text-ink">{qty}</span>
                <button onClick={() => setQty((q) => Math.min(product.stock, q + 1))} className="w-10 h-10 text-ink-muted hover:text-gold" aria-label="زیاد کردن تعداد">+</button>
              </div>
            </div>
          )}

          <button
            onClick={handleAdd}
            disabled={!inStock}
            className="w-full sm:w-auto px-8 py-3 rounded-sm bg-gold text-base font-bold hover:bg-gold-soft transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            افزودن به سبد خرید
          </button>

          {specs.length > 0 && (
            <div className="mt-10">
              <h2 className="font-display text-lg text-ink mb-3">مشخصات فنی</h2>
              <div className="bg-base-panel border border-base-line rounded-sm px-5">
                {specs.map(([key, value]) => (
                  <div key={key} className="spec-row">
                    <span className="text-ink-muted">{key}</span>
                    <span className="text-ink">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reviews */}
      <section className="mt-16 max-w-3xl">
        <h2 className="font-display text-xl text-ink mb-6">نظرات کاربران</h2>

        {session ? (
          <form onSubmit={submitReview} className="bg-base-panel border border-base-line rounded-sm p-5 mb-8">
            <p className="text-sm text-ink-muted mb-2">امتیاز شما</p>
            <div className="flex gap-1 mb-4">
              {[1, 2, 3, 4, 5].map((n) => (
                <button type="button" key={n} onClick={() => setMyRating(n)} className="text-xl" aria-label={`${n} ستاره`}>
                  <span className={n <= myRating ? "text-gold" : "text-ink-faint"}>★</span>
                </button>
              ))}
            </div>
            <textarea
              value={myText}
              onChange={(e) => setMyText(e.target.value)}
              rows={3}
              placeholder="نظر شما درباره این محصول (اختیاری)"
              className="w-full bg-base border border-base-line rounded-sm px-4 py-2 text-ink text-sm focus:outline-none focus:border-gold mb-3"
            />
            <button
              type="submit"
              disabled={!myRating || submittingReview}
              className="px-5 py-2 rounded-sm bg-gold text-base text-sm font-semibold disabled:opacity-50"
            >
              {submittingReview ? "در حال ثبت..." : "ثبت نظر"}
            </button>
          </form>
        ) : (
          <p className="text-ink-muted text-sm mb-8">
            برای ثبت نظر <Link href="/auth/login" className="text-gold underline">وارد شوید</Link>.
          </p>
        )}

        {reviews.length === 0 ? (
          <p className="text-ink-muted text-sm">هنوز نظری برای این محصول ثبت نشده است.</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((r) => (
              <div key={r._id} className="border-b border-base-line pb-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-ink text-sm font-medium">{r.userName}</span>
                  <Stars value={r.rating} />
                </div>
                {r.text && <p className="text-ink-muted text-sm leading-6">{r.text}</p>}
              </div>
            ))}
          </div>
        )}
      </section>

      {related.length > 0 && (
        <section className="mt-4">
          <h2 className="font-display text-xl text-ink mb-6">محصولات مشابه</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
            {related.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}

      <RecentlyViewed excludeId={id} />
    </main>
  );
}

function Stars({ value }) {
  return (
    <div className="flex gap-0.5 text-sm" aria-label={`${value} از ۵`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={n <= Math.round(value) ? "text-gold" : "text-ink-faint"}>★</span>
      ))}
    </div>
  );
}

function HeartGlyph({ filled }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.7" className={filled ? "text-signal-bad" : "text-ink"}>
      <path d="M12 21s-7.5-4.7-10-9.3C.3 7.9 2.4 4 6.2 4c2 0 3.6 1.1 4.8 2.8C12.2 5.1 13.8 4 15.8 4c3.8 0 5.9 3.9 4.2 7.7C19.5 16.3 12 21 12 21Z" />
    </svg>
  );
}
