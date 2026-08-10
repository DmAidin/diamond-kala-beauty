"use client";

import Link from "next/link";
import ProductCard from "./ProductCard";
import { ProductCardSkeleton } from "./Skeleton";

// Horizontal, snap-scrolling row of products — the Digikala-style
// "پیشنهاد شگفت‌انگیز" / bestseller rail, adapted to our card design
// instead of a from-scratch copy of their component.
export default function ProductCarousel({ title, products, loading, seeAllHref, wishlistIds }) {
  if (!loading && (!products || products.length === 0)) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-display text-2xl text-ink">{title}</h2>
        {seeAllHref && (
          <Link href={seeAllHref} className="text-sm text-gold hover:underline shrink-0">
            مشاهده همه
          </Link>
        )}
      </div>

      <div className="flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:px-0">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="w-44 sm:w-52 shrink-0 snap-start">
                <ProductCardSkeleton />
              </div>
            ))
          : products.map((p) => (
              <div key={p._id} className="w-44 sm:w-52 shrink-0 snap-start">
                <ProductCard product={p} wishlistIds={wishlistIds} />
              </div>
            ))}
      </div>
    </section>
  );
}
