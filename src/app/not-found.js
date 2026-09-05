import Link from "next/link";

export const metadata = { title: "صفحه یافت نشد | دایمند کالا" };

export default function NotFound() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-24 text-center">
      <p className="font-display text-3xl text-ink mb-4">صفحه‌ای که دنبالش بودید پیدا نشد</p>
      <p className="text-ink-muted mb-8">
        ممکن است این محصول یا صفحه حذف شده یا آدرس آن تغییر کرده باشد.
      </p>
      <Link
        href="/"
        className="inline-block px-7 py-3 bg-gold text-base font-bold rounded-sm hover:bg-gold-dim transition-colors"
      >
        بازگشت به فروشگاه
      </Link>
    </main>
  );
}
