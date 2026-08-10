"use client";

import { useSelector, useDispatch } from "react-redux";
import { removeFromCart, increaseQuantity, decreaseQuantity } from "@/redux/cartSlice";
import Link from "next/link";
import Image from "next/image";
import EmptyState from "../components/EmptyState";

export default function CartPage() {
  const cart = useSelector((state) => state.cart);
  const dispatch = useDispatch();

  if (cart.items.length === 0) {
    return (
      <main className="max-w-xl mx-auto px-4">
        <EmptyState
          icon="cart"
          title="سبد خرید شما خالی است"
          text="هنوز محصولی به سبد خریدتان اضافه نکرده‌اید."
          actionHref="/"
          actionLabel="مشاهده محصولات"
        />
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="font-display text-3xl text-ink mb-8">سبد خرید</h1>

      <div className="pastel-card bg-base-panel border border-base-line divide-y divide-base-line overflow-hidden">
        {cart.items.map((item) => (
          <div key={item.id} className="flex items-center gap-5 p-5">
            <div className="relative w-20 h-20 shrink-0 bg-base rounded-sm border border-base-line overflow-hidden">
              {item.image && (
                <Image src={item.image} alt={item.title} fill sizes="80px" className="object-contain p-1" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-ink font-medium truncate">{item.title}</h3>
              <p className="text-gold font-mono text-sm mt-1">{item.price.toLocaleString()} تومان</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => dispatch(decreaseQuantity(item.id))}
                className="w-8 h-8 rounded-sm border border-base-line text-ink hover:border-gold hover:text-gold transition-colors"
              >
                −
              </button>
              <span className="font-mono w-6 text-center text-ink">{item.quantity}</span>
              <button
                onClick={() => dispatch(increaseQuantity(item.id))}
                className="w-8 h-8 rounded-sm border border-base-line text-ink hover:border-gold hover:text-gold transition-colors"
              >
                +
              </button>
              <button
                onClick={() => dispatch(removeFromCart(item.id))}
                className="text-signal-bad text-sm mr-3 hover:underline"
              >
                حذف
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mt-8 mb-6">
        <span className="text-ink-muted">مجموع سبد خرید</span>
        <span className="font-mono text-2xl text-gold font-bold">
          {cart.totalPrice.toLocaleString()} تومان
        </span>
      </div>

      <Link
        href="/checkout"
        className="block w-full text-center py-3 rounded-sm bg-gold text-base font-bold hover:bg-gold-soft transition-colors"
      >
        ادامه فرآیند خرید
      </Link>
    </main>
  );
}
