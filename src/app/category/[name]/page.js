"use client";

import { useEffect, useState, use as usePromise } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import ProductCard from "@/app/components/ProductCard";
import EmptyState from "@/app/components/EmptyState";
import { ProductGridSkeleton } from "@/app/components/Skeleton";

// A focused, single-category page — nothing above the fold except this
// category's own products, per the request to stop mixing category
// browsing into the general homepage feed.
export default function CategoryPage({ params }) {
  const { name } = usePromise(params);
  const category = decodeURIComponent(name);
  const { data: session } = useSession();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlistIds, setWishlistIds] = useState([]);
  const [sort, setSort] = useState("newest");

  useEffect(() => {
    setLoading(true);
    fetch(`/api/products?category=${encodeURIComponent(category)}`)
      .then((res) => res.json())
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, [category]);

  useEffect(() => {
    if (!session) return;
    fetch("/api/wishlist")
      .then((res) => res.json())
      .then((data) => setWishlistIds(Array.isArray(data) ? data.map((p) => p._id) : []))
      .catch(() => {});
  }, [session]);

  const sorted = [...products].sort((a, b) => {
    if (sort === "price-asc") return a.price - b.price;
    if (sort === "price-desc") return b.price - a.price;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <nav className="text-xs text-ink-faint mb-4 font-mono">
        <Link href="/" className="hover:text-gold">فروشگاه</Link>
        <span className="mx-2">/</span>
        <span className="text-ink">{category}</span>
      </nav>

      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-2xl sm:text-3xl text-ink">{category}</h1>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="bg-base-panel border border-base-line rounded-sm px-3 py-2 text-sm text-ink focus:outline-none focus:border-gold"
        >
          <option value="newest">جدیدترین</option>
          <option value="price-asc">ارزان‌ترین</option>
          <option value="price-desc">گران‌ترین</option>
        </select>
      </div>

      {loading ? (
        <ProductGridSkeleton />
      ) : sorted.length === 0 ? (
        <EmptyState
          icon="search"
          title="محصولی در این دسته یافت نشد"
          text="به‌زودی محصولات جدید در این دسته اضافه خواهد شد."
          actionHref="/"
          actionLabel="بازگشت به فروشگاه"
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-5">
          {sorted.map((p) => (
            <ProductCard key={p._id} product={p} wishlistIds={wishlistIds} />
          ))}
        </div>
      )}
    </main>
  );
}
