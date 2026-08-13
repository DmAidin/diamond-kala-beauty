"use client";

import Link from "next/link";
import Image from "next/image";
import { useDispatch } from "react-redux";
import { addToCart } from "@/redux/cartSlice";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useToast } from "./Toast";
import QuickViewModal from "./QuickViewModal";

export default function ProductCard({ product, wishlistIds }) {
  const dispatch = useDispatch();
  const { data: session } = useSession();
  const showToast = useToast();
  const id = product._id || product.id;
  const stock = product.stock ?? 1;
  const inStock = stock > 0;
  const lowStock = inStock && stock <= 5;
  const [wished, setWished] = useState(false);
  const [quickView, setQuickView] = useState(false);
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
    dispatch(addToCart({ ...product, quantity: 1 }));
    showToast(`${product.name} به سبد خرید اضافه شد`);
  };

  return (
    <>
      <div className="group relative bg-base-panel rounded-3xl border border-base-line p-4 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
        <button
          onClick={toggleWishlist}
          aria-label="افزودن به علاقه‌مندی‌ها"
          className={`absolute top-6 left-6 z-10 w-9 h-9 rounded-full bg-base-panel/90 backdrop-blur-md shadow-md flex items-center justify-center transition-transform hover:scale-110 ${
            !session ? "hidden" : ""
          }`}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill={wished ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.9" className={wished ? "text-signal-bad" : "text-ink"}>
            <path d="M12 21s-7.5-4.7-10-9.3C.3 7.9 2.4 4 6.2 4c2 0 3.6 1.1 4.8 2.8C12.2 5.1 13.8 4 15.8 4c3.8 0 5.9 3.9 4.2 7.7C19.5 16.3 12 21 12 21Z" />
          </svg>
        </button>

        {lowStock && (
          <span className="absolute top-6 right-6 z-10 bg-ink text-base text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md">
            فقط {stock} عدد
          </span>
        )}

        <Link href={`/product/${id}`} className="block">
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-white mb-4">
            {image && (
              <Image
                src={image}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 20vw"
                className="object-contain p-3 group-hover:scale-105 transition-transform duration-500"
              />
            )}
            <button
              onClick={(e) => {
                e.preventDefault();
                setQuickView(true);
              }}
              className="absolute inset-x-3 bottom-3 py-2 bg-base-panel/90 backdrop-blur-md text-ink text-xs font-bold rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-md text-center"
            >
              👁️ مشاهده سریع
            </button>
          </div>

          {product.brand && (
            <span className="text-[10px] font-bold text-gold uppercase tracking-wider">{product.brand}</span>
          )}
          <h3 className="text-xs sm:text-sm font-bold text-ink line-clamp-2 mt-1 leading-relaxed">{product.name}</h3>
        </Link>

        <div className="mt-4 pt-3 border-t border-base-line flex items-center justify-between">
          <span className="text-sm font-black text-gold-dim">
            {product.price.toLocaleString()} <span className="text-[10px] font-normal">تومان</span>
          </span>
          <button
            onClick={handleAdd}
            disabled={!inStock}
            className="px-3.5 py-2 bg-gold hover:bg-gold-soft text-base rounded-xl shadow-md hover:shadow-lg transition-all text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {inStock ? "+ خرید" : "ناموجود"}
          </button>
        </div>
      </div>

      {quickView && <QuickViewModal product={product} onClose={() => setQuickView(false)} />}
    </>
  );
}
