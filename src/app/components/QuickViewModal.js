"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { addToCart } from "@/redux/cartSlice";
import { useToast } from "./Toast";

export default function QuickViewModal({ product, onClose }) {
  const dispatch = useDispatch();
  const showToast = useToast();
  const [qty, setQty] = useState(1);
  if (!product) return null;

  const image = product.images?.[0] || product.image;
  const stock = product.stock ?? 1;
  const inStock = stock > 0;

  const handleAdd = () => {
    dispatch(addToCart({ ...product, quantity: qty }));
    showToast(`${product.name} به سبد خرید اضافه شد`);
    onClose();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-base-panel rounded-[2rem] max-w-2xl w-full p-6 sm:p-8 relative shadow-2xl border border-base-line max-h-[90vh] overflow-y-auto"
      >
        <button
          onClick={onClose}
          aria-label="بستن"
          className="absolute top-4 left-4 w-10 h-10 rounded-full bg-base hover:bg-gold-soft/20 text-ink-muted hover:text-gold flex items-center justify-center transition-colors"
        >
          ✕
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-white border border-base-line">
            {image && <Image src={image} alt={product.name} fill sizes="400px" className="object-contain p-4" />}
          </div>

          <div className="flex flex-col gap-3">
            {product.brand && (
              <span className="text-xs text-gold font-bold tracking-wide uppercase">{product.brand}</span>
            )}
            <h3 className="text-xl font-display text-ink leading-snug">{product.name}</h3>
            {product.description && (
              <p className="text-xs text-ink-muted leading-relaxed line-clamp-3">{product.description}</p>
            )}

            <div className="mt-2 py-3 border-y border-base-line flex items-center justify-between">
              <span className="text-xs text-ink-muted">قیمت:</span>
              <span className="text-xl font-display text-gold">
                {product.price.toLocaleString()} <span className="text-xs">تومان</span>
              </span>
            </div>

            {inStock ? (
              <>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-base-line rounded-xl">
                    <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="w-9 h-9 text-ink-muted hover:text-gold">−</button>
                    <span className="w-8 text-center font-mono text-ink">{qty}</span>
                    <button onClick={() => setQty((q) => Math.min(stock, q + 1))} className="w-9 h-9 text-ink-muted hover:text-gold">+</button>
                  </div>
                </div>
                <button
                  onClick={handleAdd}
                  className="w-full py-3 bg-gradient-to-l from-gold to-gold-dim text-base font-bold rounded-2xl shadow-lg shadow-gold/30 hover:shadow-xl transition-all"
                >
                  افزودن به سبد خرید
                </button>
              </>
            ) : (
              <p className="text-signal-bad text-sm">این محصول در حال حاضر ناموجود است.</p>
            )}

            <Link href={`/product/${product._id || product.id}`} onClick={onClose} className="text-xs text-gold hover:underline text-center mt-1">
              مشاهده جزئیات کامل محصول
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
