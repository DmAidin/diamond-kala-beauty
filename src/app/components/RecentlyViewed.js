"use client";

import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";

const STORAGE_KEY = "dk-recently-viewed";
const MAX_ITEMS = 8;

// Called from the product detail page to record a view — pure localStorage,
// no backend needed, and never blocks rendering.
export function trackProductView(product) {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const list = raw ? JSON.parse(raw) : [];
    const id = product._id || product.id;
    const filtered = list.filter((p) => (p._id || p.id) !== id);
    filtered.unshift({
      _id: id,
      name: product.name,
      price: product.price,
      image: product.images?.[0] || product.image,
      brand: product.brand,
      category: product.category,
      stock: product.stock,
    });
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered.slice(0, MAX_ITEMS)));
  } catch {
    // localStorage may be unavailable (private mode) — viewing still works, just isn't recorded
  }
}

export default function RecentlyViewed({ excludeId, title = "بازدیدهای اخیر شما" }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const list = raw ? JSON.parse(raw) : [];
      setItems(list.filter((p) => p._id !== excludeId));
    } catch {
      setItems([]);
    }
  }, [excludeId]);

  if (items.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <h2 className="font-display text-2xl text-ink mb-6">{title}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
        {items.slice(0, 4).map((p) => (
          <ProductCard key={p._id} product={p} />
        ))}
      </div>
    </section>
  );
}
