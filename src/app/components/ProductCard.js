"use client";

import Link from "next/link";
import { useDispatch } from "react-redux";
import { addToCart } from "@/redux/cartSlice";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function ProductCard({ product, wishlistIds }) {
  const dispatch = useDispatch();
  const { data: session } = useSession();
  const id = product._id || product.id;
  const stock = product.stock ?? 1;
  const inStock = stock > 0;
  const lowStock = inStock && stock <= 5;
  const [wished, setWished] = useState(false);

  useEffect(() => {
    if (wishlistIds) setWished(wishlistIds.includes(id));
  }, [wishlistIds, id]);

  const toggleWishlist = async (e) => {
    e.preventDefault();
    if (!session) return;
    const res = await fetch("/api/wishlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: id }),
    });
    const data = await res.json();
    setWished(data.added);
  };

  return (
    <div className="pastel-card group relative bg-base-panel border border-base-line p-5 hover:border-gold/60">
      <Link href={`/product/${id}`} className="block">
        <div className="flex items-start justify-between mb-2">
          {product.category && (
            <span className="text-[10px] font-mono tracking-widest text-ink-faint border border-base-line rounded-sm px-2 py-1">
              {product.category}
            </span>
          )}
          {lowStock && (
            <span className="text-[10px] font-mono text-signal-warn border border-signal-warn/50 rounded-sm px-2 py-1">
              فقط {stock} عدد باقی‌مانده
            </span>
          )}
        </div>

        <div className="opal-shimmer h-40 flex items-center justify-center mb-4 bg-gradient-to-br from-gold-soft/20 via-base to-teal/10 rounded-sm">
          <img
            src={product.image}
            alt={product.name}
            className="max-h-40 object-contain group-hover:scale-105 transition-transform duration-500"
          />
        </div>

        <h3 className="text-ink font-medium mb-1 line-clamp-1">{product.name}</h3>
        {product.brand && <p className="text-ink-faint text-xs font-mono mb-2">{product.brand}</p>}
        <p className="text-gold font-mono font-bold">{product.price.toLocaleString()} تومان</p>
      </Link>

      {session && (
        <button
          onClick={toggleWishlist}
          aria-label="افزودن به علاقه‌مندی‌ها"
          className="absolute top-4 left-4 w-8 h-8 rounded-full bg-base border border-base-line flex items-center justify-center hover:border-gold transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill={wished ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.9" className={wished ? "text-signal-bad" : "text-ink"}>
            <path d="M12 21s-7.5-4.7-10-9.3C.3 7.9 2.4 4 6.2 4c2 0 3.6 1.1 4.8 2.8C12.2 5.1 13.8 4 15.8 4c3.8 0 5.9 3.9 4.2 7.7C19.5 16.3 12 21 12 21Z" />
          </svg>
        </button>
      )}

      <button
        onClick={(e) => {
          e.preventDefault();
          dispatch(addToCart(product));
        }}
        disabled={!inStock}
        className="mt-4 w-full py-2 rounded-sm border border-gold/60 text-gold text-sm hover:bg-gold hover:text-base transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {inStock ? "افزودن به سبد" : "ناموجود"}
      </button>
    </div>
  );
}
