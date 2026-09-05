import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-base-line bg-base-panel">
      {/* Brand intro panel */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-10">
        <div className="rounded-[2rem] border border-base-line bg-base-raised p-6 sm:p-8">
          <span className="pill pill-accent mb-4">آرایشی، بهداشتی و وارداتی</span>
          <div className="flex items-center gap-3 mb-3">
            <div className="relative w-16 h-16 shrink-0">
              <Image src="/logo.png" alt="دایمند کالا" fill sizes="64px" className="object-contain" />
            </div>
            <span className="font-display text-xl text-ink">دایمند کالا</span>
          </div>
          <p className="text-ink-muted leading-6 max-w-xl mb-6">
            فروشگاه اینترنتی لوازم آرایشی و بهداشتی اورجینال، با بسته‌بندی ویژه،
            ارسال سریع و ضمانت اصالت کالا.
          </p>

          <div className="flex flex-wrap gap-3">
            <span className="pill">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 2 4 5v6c0 5 3.4 8.7 8 9 4.6-.3 8-4 8-9V5l-8-3Z"/></svg>
              اعتماد و اعتبار
            </span>
            <Link href="/dashboard/orders" className="pill">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 12h18M3 6h18M3 18h12"/></svg>
              پیگیری سفارش
            </Link>
            <Link href="/contact" className="pill">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4 20-7Z"/></svg>
              تماس با پشتیبانی
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 sm:grid-cols-3 gap-8 text-sm">

        {/* دسترسی سریع */}
        <div>
          <h3 className="text-ink font-semibold mb-3">
            دسترسی سریع
          </h3>

          <ul className="space-y-2 text-ink-muted">
            <li>
              <Link
                href="/"
                className="hover:text-gold transition-colors"
              >
                فروشگاه
              </Link>
            </li>

            <li>
              <Link
                href="/cart"
                className="hover:text-gold transition-colors"
              >
                سبد خرید
              </Link>
            </li>

            <li>
              <Link
                href="/dashboard/orders"
                className="hover:text-gold transition-colors"
              >
                سفارش‌های من
              </Link>
            </li>

            <li>
              <Link
                href="/dashboard/wishlist"
                className="hover:text-gold transition-colors"
              >
                علاقه‌مندی‌ها
              </Link>
            </li>

            <li>
              <Link
                href="/about"
                className="hover:text-gold transition-colors"
              >
                درباره ما
              </Link>
            </li>

            <li>
              <Link
                href="/contact"
                className="hover:text-gold transition-colors"
              >
                تماس با ما
              </Link>
            </li>
          </ul>
        </div>

        {/* قوانین */}
        <div>
          <h3 className="text-ink font-semibold mb-3">
            قوانین
          </h3>

          <ul className="space-y-2 text-ink-muted">
            <li>
              <Link
                href="/policies/privacy"
                className="hover:text-gold transition-colors"
              >
                حریم خصوصی
              </Link>
            </li>

            <li>
              <Link
                href="/policies/terms"
                className="hover:text-gold transition-colors"
              >
                قوانین و مقررات
              </Link>
            </li>

            <li>
              <Link
                href="/policies/returns"
                className="hover:text-gold transition-colors"
              >
                شرایط مرجوعی
              </Link>
            </li>
          </ul>
        </div>

        {/* پرداخت امن */}
        <div>
          <h3 className="text-ink font-semibold mb-3">
            پرداخت امن
          </h3>

          <p className="text-ink-muted leading-6 mb-3">
            پرداخت آنلاین از طریق درگاه بانکی معتبر و رمزنگاری‌شده انجام می‌شود.
          </p>

          <a
            referrerPolicy="origin"
            target="_blank"
            href="https://trustseal.enamad.ir/?id=7412525&Code=wXACqldrfToTBPBX0cy7EsiX002JAMXq"
          >
            <img
              referrerPolicy="origin"
              src="https://trustseal.enamad.ir/logo.aspx?id=7412525&Code=wXACqldrfToTBPBX0cy7EsiX002JAMXq"
              alt="نماد اعتماد الکترونیکی"
              style={{ cursor: "pointer" }}
            />
          </a>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-base-line py-4 text-center text-xs text-ink-faint font-mono">
        © {new Date().getFullYear()} Diamond Kala
      </div>
    </footer>
  );
}