"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const emptyForm = { name: "", price: "", images: [], category: "", brand: "", stock: "", description: "" };

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [existingCategories, setExistingCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchProducts();
    fetch("/api/categories").then((res) => res.json()).then((data) => setExistingCategories(data.categories || []));
  }, []);

  async function fetchProducts() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/products");
      if (!res.ok) throw new Error("خطا در دریافت محصولات");
      setProducts(await res.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  // handles selecting any number of images at once — each file is read and
  // appended to the gallery, existing images are kept
  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => setForm((f) => ({ ...f, images: [...f.images, reader.result] }));
      reader.readAsDataURL(file);
    });
    e.target.value = ""; // allow re-selecting the same file again later
  };

  const removeImage = (idx) => {
    setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));
  };

  const handleDelete = async (id) => {
    if (!confirm("آیا از حذف این محصول مطمئن هستید؟")) return;
    try {
      const res = await fetch(`/api/products?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("خطا در حذف محصول");
      setProducts(products.filter((p) => p._id !== id));
      if (editingId === id) cancelEdit();
    } catch (e) {
      alert(e.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    if (!form.name.trim() || !form.price.toString().trim() || form.images.length === 0) {
      setError("نام، قیمت و حداقل یک تصویر محصول را وارد کنید.");
      setSaving(false);
      return;
    }

    const payload = {
      name: form.name,
      price: Number(form.price),
      images: form.images,
      category: form.category.trim() || "متفرقه",
      brand: form.brand,
      stock: Number(form.stock) || 0,
      description: form.description,
    };

    try {
      if (editingId) {
        const res = await fetch(`/api/products?id=${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("خطا در به‌روزرسانی محصول");
        const updated = await res.json();
        setProducts(products.map((p) => (p._id === editingId ? updated : p)));
        cancelEdit();
      } else {
        const res = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("خطا در افزودن محصول");
        const created = await res.json();
        setProducts([created, ...products]);
        setForm(emptyForm);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (product) => {
    setEditingId(product._id);
    setForm({
      name: product.name,
      price: product.price,
      images: product.images && product.images.length > 0 ? product.images : (product.image ? [product.image] : []),
      category: product.category || "",
      brand: product.brand || "",
      stock: product.stock ?? "",
      description: product.description || "",
    });
    setError(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError(null);
  };

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-2xl text-ink">مدیریت محصولات</h1>
        <Link href="/admin" className="text-sm text-ink-muted hover:text-gold">بازگشت به پنل مدیریت</Link>
      </div>

      <form onSubmit={handleSubmit} className="mb-10 p-6 bg-base-panel border border-base-line rounded-sm grid grid-cols-1 sm:grid-cols-2 gap-5">
        <h2 className="sm:col-span-2 font-display text-lg text-ink">{editingId ? "ویرایش محصول" : "افزودن محصول جدید"}</h2>

        <Input label="نام محصول" value={form.name} onChange={(v) => setForm({ ...form, name: v })} disabled={saving} />
        <Input label="قیمت (تومان)" type="number" value={form.price} onChange={(v) => setForm({ ...form, price: v })} disabled={saving} />
        <Input label="برند" value={form.brand} onChange={(v) => setForm({ ...form, brand: v })} disabled={saving} />
        <Input label="موجودی انبار" type="number" value={form.stock} onChange={(v) => setForm({ ...form, stock: v })} disabled={saving} />

        <div>
          <label className="block mb-2 text-sm text-ink-muted">دسته‌بندی</label>
          <input
            list="category-options"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            placeholder="مثلاً: مراقبت پوست، آرایش، عطر..."
            disabled={saving}
            className="w-full px-4 py-3 rounded-sm bg-base border border-base-line text-ink focus:outline-none focus:border-gold"
          />
          <datalist id="category-options">
            {existingCategories.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
          <p className="text-ink-faint text-xs mt-1">هر دسته‌ای که اینجا تایپ کنید، خودکار در فروشگاه به‌عنوان فیلتر ظاهر می‌شود.</p>
        </div>

        <div className="sm:col-span-2">
          <label className="block mb-2 text-sm text-ink-muted">تصاویر محصول (هر تعداد که بخواهید)</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImagesChange}
            disabled={saving}
            className="block w-full text-sm text-ink-muted file:ml-3 file:py-2 file:px-4 file:rounded-sm file:border-0 file:bg-gold/20 file:text-gold"
          />
          {form.images.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-3">
              {form.images.map((src, idx) => (
                <div key={idx} className="relative">
                  <img src={src} alt={`تصویر ${idx + 1}`} className="w-20 h-20 object-cover rounded-sm border border-base-line" />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-signal-bad text-white text-xs flex items-center justify-center"
                    aria-label="حذف این تصویر"
                  >
                    ✕
                  </button>
                  {idx === 0 && (
                    <span className="absolute bottom-0 inset-x-0 text-[10px] text-center bg-gold text-base rounded-b-sm">اصلی</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="sm:col-span-2">
          <label className="block mb-2 text-sm text-ink-muted">توضیحات</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            disabled={saving}
            className="w-full px-4 py-3 rounded-sm bg-base border border-base-line text-ink focus:outline-none focus:border-gold"
          />
        </div>

        <div className="sm:col-span-2 flex items-center gap-4">
          <button type="submit" disabled={saving} className="px-6 py-3 rounded-sm bg-gold text-base font-semibold disabled:opacity-50">
            {saving ? "در حال ذخیره..." : editingId ? "ذخیره تغییرات" : "افزودن محصول"}
          </button>
          {editingId && (
            <button type="button" onClick={cancelEdit} disabled={saving} className="px-6 py-3 rounded-sm border border-base-line text-ink-muted">
              انصراف
            </button>
          )}
        </div>

        {error && <p className="sm:col-span-2 text-signal-bad text-sm">{error}</p>}
      </form>

      {loading ? (
        <p className="text-ink-muted">در حال بارگذاری محصولات...</p>
      ) : products.length === 0 ? (
        <p className="text-ink-muted text-center py-10">محصولی وجود ندارد.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full bg-base-panel border border-base-line rounded-sm text-sm">
            <thead>
              <tr className="text-ink-muted text-right border-b border-base-line">
                <th className="py-3 px-4">نام</th>
                <th className="py-3 px-4">دسته</th>
                <th className="py-3 px-4">قیمت</th>
                <th className="py-3 px-4">موجودی</th>
                <th className="py-3 px-4">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id} className="border-b border-base-line last:border-0">
                  <td className="py-3 px-4 text-ink">{product.name}</td>
                  <td className="py-3 px-4 text-ink-muted">{product.category || "—"}</td>
                  <td className="py-3 px-4 font-mono text-gold">{product.price.toLocaleString()}</td>
                  <td className="py-3 px-4 text-ink-muted">{product.stock ?? 0}</td>
                  <td className="py-3 px-4 space-x-3">
                    <button onClick={() => startEdit(product)} className="text-gold hover:underline ml-3">ویرایش</button>
                    <button onClick={() => handleDelete(product._id)} className="text-signal-bad hover:underline">حذف</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

function Input({ label, value, onChange, type = "text", disabled }) {
  return (
    <div>
      <label className="block mb-2 text-sm text-ink-muted">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full px-4 py-3 rounded-sm bg-base border border-base-line text-ink focus:outline-none focus:border-gold"
      />
    </div>
  );
}
