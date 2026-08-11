"use client";

import Link from "next/link";
import Image from "next/image";
import { useDispatch } from "react-redux";
import { addToCart } from "@/redux/cartSlice";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useToast } from "./Toast";

export default function ProductCard({ product, wishlistIds }) {
  const dispatch = useDispatch();
  const { data: session } = useSession();
  const showToast = useToast();
  const id = product._id || product.id;
  const stock = product.stock ?? 1;
  const inStock = stock > 0;
  const lowStock = inStock && stock <= 5;
  const [wished, setWished] = useState(false);
  const [qty, setQty] = useState(1);
  const image = product.images?.[0] || product.image;

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
    showToast(data.added ? "به علاقه‌مندی‌ها اضافه شد" : "از علاقه‌مندی‌ها حذف شد");
  };

  const handleAdd = (e) => {
    e.preventDefault();
    dispatch(addToCart({ ...product, quantity: qty }));
    showToast(`${product.name} به سبد خرید اضافه شد`);
    setQty(1);
  };

  const changeQty = (e, delta) => {
    e.preventDefault();
    e.stopPropagation();
    setQty((q) => Math.max(1, Math.min(stock || 99, q + delta)));
  };

  return (
    <div className="pastel-card group relative bg-base-panel border border-base-line p-5 hover:border-gold/60">
      <Link href={`/product/${id}`} className="block">
        {product.category && (
          <span className="absolute top-4 left-4 text-[10px] font-mono tracking-widest text-ink-faint border border-base-line rounded-sm px-2 py-1 bg-base-panel z-10">
            {product.category}
          </span>
        )}
        <div className="opal-shimmer relative h-40 mb-4 bg-white rounded-sm overflow-hidden">
          {image && (
            <Image
              src={image}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 20vw"
              className="object-contain p-3 group-hover:scale-105 transition-transform duration-500"
            />
          )}
        </div>

        <h3 className="text-ink font-medium mb-1 line-clamp-1">{product.name}</h3>
        {product.brand && <p className="text-ink-faint text-xs font-mono mb-2">{product.brand}</p>}
        <div className="flex items-center gap-2">
          <p className="text-gold font-mono font-bold">{product.price.toLocaleString()} تومان</p>
          {lowStock && <span className="text-[10px] text-signal-warn">فقط {stock} عدد باقی‌مانده</span>}
        </div>
      </Link>

      {session && (
        <button
          onClick={toggleWishlist}
          aria-label="افزودن به علاقه‌مندی‌ها"
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-base border border-base-line flex items-center justify-center hover:border-gold transition-colors z-10"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill={wished ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.9" className={wished ? "text-signal-bad" : "text-ink"}>
            <path d="M12 21s-7.5-4.7-10-9.3C.3 7.9 2.4 4 6.2 4c2 0 3.6 1.1 4.8 2.8C12.2 5.1 13.8 4 15.8 4c3.8 0 5.9 3.9 4.2 7.7C19.5 16.3 12 21 12 21Z" />
          </svg>
        </button>
      )}

      {inStock ? (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <div className="flex items-center border border-base-line rounded-sm shrink-0">
            <button onClick={(e) => changeQty(e, -1)} className="w-7 h-8 text-ink-muted hover:text-gold" aria-label="کم کردن تعداد">−</button>
            <span className="w-6 text-center text-sm font-mono text-ink">{qty}</span>
            <button onClick={(e) => changeQty(e, 1)} className="w-7 h-8 text-ink-muted hover:text-gold" aria-label="زیاد کردن تعداد">+</button>
          </div>
          <button
            onClick={handleAdd}
            className="flex-1 min-w-[6.5rem] py-2 rounded-sm border border-gold/60 text-gold text-xs sm:text-sm hover:bg-gold hover:text-base transition-colors"
          >
            افزودن به سبد
          </button>
        </div>
      ) : (
        <button disabled className="mt-4 w-full py-2 rounded-sm border border-base-line text-ink-faint text-sm cursor-not-allowed">
          ناموجود
        </button>
      )}
    </div>
  );
}
