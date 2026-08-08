"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import ProductCard from "../../components/ProductCard";

export default function WishlistPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/wishlist")
      .then((res) => res.json())
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl text-ink">علاقه‌مندی‌های من</h1>
        <Link href="/dashboard" className="text-sm text-ink-muted hover:text-gold">بازگشت به داشبورد</Link>
      </div>

      {loading ? (
        <p className="text-ink-muted">در حال بارگذاری...</p>
      ) : products.length === 0 ? (
        <p className="text-ink-muted">هنوز محصولی به علاقه‌مندی‌ها اضافه نکرده‌اید.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {products.map((p) => (
            <ProductCard key={p._id} product={p} wishlistIds={products.map((x) => x._id)} />
          ))}
        </div>
      )}
    </main>
  );
}
