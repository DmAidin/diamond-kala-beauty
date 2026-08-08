import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-base-line bg-base-panel">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 sm:grid-cols-4 gap-8 text-sm">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <img src="/logo.png" alt="دایموند کالا" className="w-14 h-14 object-contain" />
            <span className="font-display text-ink">دایموند کالا</span>
          </div>
          <p className="text-ink-muted leading-6">
            فروشگاه اینترنتی لوازم آرایشی و بهداشتی اورجینال، با بسته‌بندی ویژه، ارسال سریع و ضمانت اصالت کالا.
          </p>
        </div>
        <div>
          <h3 className="text-ink font-semibold mb-3">دسترسی سریع</h3>
          <ul className="space-y-2 text-ink-muted">
            <li><Link href="/" className="hover:text-gold transition-colors">فروشگاه</Link></li>
            <li><Link href="/cart" className="hover:text-gold transition-colors">سبد خرید</Link></li>
            <li><Link href="/dashboard/orders" className="hover:text-gold transition-colors">سفارش‌های من</Link></li>
            <li><Link href="/dashboard/wishlist" className="hover:text-gold transition-colors">علاقه‌مندی‌ها</Link></li>
            <li><Link href="/about" className="hover:text-gold transition-colors">درباره ما</Link></li>
            <li><Link href="/contact" className="hover:text-gold transition-colors">تماس با ما</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-ink font-semibold mb-3">قوانین</h3>
          <ul className="space-y-2 text-ink-muted">
            <li><Link href="/policies/privacy" className="hover:text-gold transition-colors">حریم خصوصی</Link></li>
            <li><Link href="/policies/terms" className="hover:text-gold transition-colors">قوانین و مقررات</Link></li>
            <li><Link href="/policies/returns" className="hover:text-gold transition-colors">شرایط مرجوعی</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-ink font-semibold mb-3">پرداخت امن</h3>
          <p className="text-ink-muted leading-6">
            پرداخت آنلاین از طریق درگاه بانکی معتبر و رمزنگاری‌شده انجام می‌شود.
          </p>
        </div>
      </div>
      <div className="border-t border-base-line py-4 text-center text-xs text-ink-faint font-mono">
        © {new Date().getFullYear()} Diamond Kala
      </div>
    </footer>
  );
}
